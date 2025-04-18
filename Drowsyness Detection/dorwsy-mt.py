import cv2
import mediapipe as mp
import torch
import torchvision.transforms as transforms
from torchvision import models
import numpy as np

model_path = "Drowsyness Detection/models/Drowsiness-MobileNetV3-MultiTask.pth"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = models.mobilenet_v3_small(weights=None)
model.features[0][0] = torch.nn.Conv2d(1, 16, kernel_size=3, stride=2, padding=1, bias=False)
model.classifier[3] = torch.nn.Linear(model.classifier[3].in_features, 4)  # 4 classes
model.load_state_dict(torch.load(model_path, map_location=device))
model.to(device)
model.eval()

transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Grayscale(num_output_channels=1),
    transforms.Resize((96, 96)),
    transforms.CenterCrop(84),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5], std=[0.5])
])


mp_face = mp.solutions.face_detection
mp_hands = mp.solutions.hands

face_detection = mp_face.FaceDetection(min_detection_confidence=0.6)
hands = mp_hands.Hands(min_detection_confidence=0.7, max_num_hands=1)

cap = cv2.VideoCapture(0)

label_names = {
    0: "Drowsy",
    1: "Not Drowsy",
    2: "Gesture A",
    3: "Gesture B"
}

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    height, width, _ = frame.shape
    region_found = False

    hand_results = hands.process(image_rgb)
    if hand_results.multi_hand_landmarks:
        for hand_landmarks in hand_results.multi_hand_landmarks:
            x_vals = [lm.x for lm in hand_landmarks.landmark]
            y_vals = [lm.y for lm in hand_landmarks.landmark]
            x_min = int(min(x_vals) * width) - 20
            y_min = int(min(y_vals) * height) - 20
            x_max = int(max(x_vals) * width) + 20
            y_max = int(max(y_vals) * height) + 20

            x_min = max(0, x_min)
            y_min = max(0, y_min)
            x_max = min(width, x_max)
            y_max = min(height, y_max)

            hand_crop = frame[y_min:y_max, x_min:x_max]
            if hand_crop.size > 0:
                input_tensor = transform(hand_crop).unsqueeze(0).to(device)
                with torch.no_grad():
                    output = model(input_tensor)
                    pred = torch.argmax(output, dim=1).item()
                    label = label_names.get(pred, "Unknown")

                cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)
                cv2.putText(frame, f"Hand: {label}", (x_min, y_min - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
                region_found = True
                break 

    if not region_found:
        face_results = face_detection.process(image_rgb)
        if face_results.detections:
            for detection in face_results.detections:
                bbox = detection.location_data.relative_bounding_box
                x = int(bbox.xmin * width)
                y = int(bbox.ymin * height)
                w_box = int(bbox.width * width)
                h_box = int(bbox.height * height)

                x, y = max(0, x), max(0, y)
                face_crop = frame[y:y + h_box, x:x + w_box]

                if face_crop.size > 0:
                    input_tensor = transform(face_crop).unsqueeze(0).to(device)
                    with torch.no_grad():
                        output = model(input_tensor)
                        pred = torch.argmax(output, dim=1).item()
                        label = label_names.get(pred, "Unknown")

                    cv2.rectangle(frame, (x, y), (x + w_box, y + h_box), (255, 0, 0), 2)
                    cv2.putText(frame, f"Face: {label}", (x, y - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
                    break

    cv2.imshow("Live Classification (Hand/Face)", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
