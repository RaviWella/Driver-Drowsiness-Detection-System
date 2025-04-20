import cv2
import mediapipe as mp
import torch
import torchvision.transforms as transforms
from torch import nn
from torchvision.models import mobilenet_v3_small

# ---------------- MultiTask Model Definition ----------------
class MultiTaskMobileNet(nn.Module):
    def __init__(self, num_drowsy_classes, num_yawn_classes):
        super().__init__()
        base_model = mobilenet_v3_small(pretrained=True)

        # Modify the first conv layer to accept grayscale input
        first_conv = base_model.features[0][0]
        new_conv = nn.Conv2d(1, first_conv.out_channels,
                             kernel_size=first_conv.kernel_size,
                             stride=first_conv.stride,
                             padding=first_conv.padding,
                             bias=False)
        with torch.no_grad():
            new_conv.weight[:] = first_conv.weight.mean(dim=1, keepdim=True)
        base_model.features[0][0] = new_conv

        self.features = base_model.features
        self.pool = nn.AdaptiveAvgPool2d((1, 1))
        self.dropout = nn.Dropout(0.2)
        in_features = base_model.classifier[0].in_features

        self.drowsy_head = nn.Linear(in_features, num_drowsy_classes)
        self.yawn_head = nn.Linear(in_features, num_yawn_classes)

    def extract_features(self, x):
        x = self.features(x)
        x = self.pool(x).squeeze(-1).squeeze(-1)
        x = self.dropout(x)
        return x

    def forward(self, x):
        x = self.extract_features(x)
        return self.drowsy_head(x), self.yawn_head(x)

# ---------------- Load Model ----------------
model_path = "models/model1_W.pth"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = MultiTaskMobileNet(num_drowsy_classes=2, num_yawn_classes=2)
model.load_state_dict(torch.load(model_path, map_location=device))
model.to(device)
model.eval()

# ---------------- Initialize Mediapipe ----------------
mp_face = mp.solutions.face_detection
mp_hands = mp.solutions.hands

face_detection = mp_face.FaceDetection(min_detection_confidence=0.6)
hands = mp_hands.Hands(min_detection_confidence=0.7, max_num_hands=1)

# ---------------- Transform ----------------
transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Grayscale(num_output_channels=1),
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
])

# ---------------- Webcam ----------------
cap = cv2.VideoCapture(0)

def is_fist(hand_landmarks):
    tips = [8, 12, 16, 20]
    return sum(hand_landmarks.landmark[tip].y > hand_landmarks.landmark[tip - 2].y for tip in tips) >= 3

def is_peace_sign(hand_landmarks):
    def is_extended(tip_id):
        return hand_landmarks.landmark[tip_id].y < hand_landmarks.landmark[tip_id - 2].y
    def is_folded(tip_id):
        return hand_landmarks.landmark[tip_id].y > hand_landmarks.landmark[tip_id - 2].y
    return (is_extended(8) and is_extended(12) and is_folded(16) and is_folded(20))

# ---------------- Class Index Constants ----------------
DROWSY = 0
NOT_DROWSY = 1
NOT_YAWN = 0
YAWN = 1

# ---------------- Main Loop ----------------
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    height, width, _ = frame.shape
    drew_box = False

    # ---- Hand Detection ----
    hand_results = hands.process(image_rgb)
    if hand_results.multi_hand_landmarks:
        for hand_landmarks in hand_results.multi_hand_landmarks:
            gesture = "Fist" if is_fist(hand_landmarks) else "Peace" if is_peace_sign(hand_landmarks) else None
            if gesture:
                x_vals = [lm.x for lm in hand_landmarks.landmark]
                y_vals = [lm.y for lm in hand_landmarks.landmark]
                x_min = max(0, int(min(x_vals) * width) - 20)
                y_min = max(0, int(min(y_vals) * height) - 20)
                x_max = min(width, int(max(x_vals) * width) + 20)
                y_max = min(height, int(max(y_vals) * height) + 20)

                cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)
                cv2.putText(frame, gesture, (x_min, y_min - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
                drew_box = True
                break

    # ---- Face Detection + Model Prediction ----
    if not drew_box:
        face_results = face_detection.process(image_rgb)
        if face_results.detections:
            for detection in face_results.detections:
                bbox = detection.location_data.relative_bounding_box
                x = max(0, int(bbox.xmin * width))
                y = max(0, int(bbox.ymin * height))
                w_box = int(bbox.width * width)
                h_box = int(bbox.height * height)

                face_crop = frame[y:y + h_box, x:x + w_box]
                input_tensor = transform(face_crop).unsqueeze(0).to(device)

                with torch.no_grad():
                    drowsy_logits, yawn_logits = model(input_tensor)
                    drowsy_probs = torch.softmax(drowsy_logits, dim=1)
                    yawn_probs = torch.softmax(yawn_logits, dim=1)

                    drowsy_class = torch.argmax(drowsy_probs).item()  # 0 = Drowsy, 1 = Not Drowsy
                    yawn_class = torch.argmax(yawn_probs).item()      # 0 = Not Yawn, 1 = Yawn

                    # ---- Final State Logic ----
                    if drowsy_class == DROWSY:
                        label = "Drowsy"
                    elif yawn_class == YAWN:
                        label = "Tired"
                    else:
                        label = "Alert"

                    print(f"[DEBUG] Drowsy Prob: {drowsy_probs.tolist()} | Yawn Prob: {yawn_probs.tolist()}")
                    print(f"\033[94m[State] {label}\033[0m")

                # Draw result
                cv2.rectangle(frame, (x, y), (x + w_box, y + h_box), (255, 0, 0), 2)
                cv2.putText(frame, f"State: {label}", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
                break

    cv2.imshow("Gesture or Head Detector", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()