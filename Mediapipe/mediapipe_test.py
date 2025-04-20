import cv2
import mediapipe as mp

# Initialize Mediapipe
mp_face = mp.solutions.face_detection
mp_hands = mp.solutions.hands

face_detection = mp_face.FaceDetection(min_detection_confidence=0.6)
hands = mp_hands.Hands(min_detection_confidence=0.7, max_num_hands=1)

# Start webcam
cap = cv2.VideoCapture(0)

def is_fist(hand_landmarks):
    # Check if most fingers are folded (skip thumb for now)
    tips = [8, 12, 16, 20]  # index to pinky
    folded = 0
    for tip_id in tips:
        tip = hand_landmarks.landmark[tip_id]
        pip = hand_landmarks.landmark[tip_id - 2]
        if tip.y > pip.y:
            folded += 1
    return folded >= 3

def is_peace_sign(hand_landmarks):
    # Index (8) and Middle (12) extended, Ring (16) and Pinky (20) folded
    def is_extended(tip_id):
        tip = hand_landmarks.landmark[tip_id]
        pip = hand_landmarks.landmark[tip_id - 2]
        return tip.y < pip.y

    def is_folded(tip_id):
        tip = hand_landmarks.landmark[tip_id]
        pip = hand_landmarks.landmark[tip_id - 2]
        return tip.y > pip.y

    return (is_extended(8) and is_extended(12) and
            is_folded(16) and is_folded(20))

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    height, width, _ = frame.shape

    drew_box = False

    # ---- Check for Hand First ----
    hand_results = hands.process(image_rgb)
    if hand_results.multi_hand_landmarks:
        for hand_landmarks in hand_results.multi_hand_landmarks:
            gesture = None

            if is_fist(hand_landmarks):
                gesture = "Fist"
            elif is_peace_sign(hand_landmarks):
                gesture = "Peace"

            if gesture:
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

                cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)
                cv2.putText(frame, gesture, (x_min, y_min - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
                drew_box = True
                break  # prioritize hand gesture

    # ---- If no hand gesture, check face ----
    if not drew_box:
        face_results = face_detection.process(image_rgb)
        if face_results.detections:
            for detection in face_results.detections:
                bbox = detection.location_data.relative_bounding_box
                x = int(bbox.xmin * width)
                y = int(bbox.ymin * height)
                w_box = int(bbox.width * width)
                h_box = int(bbox.height * height)

                x, y = max(0, x), max(0, y)

                cv2.rectangle(frame, (x, y), (x + w_box, y + h_box), (255, 0, 0), 2)
                cv2.putText(frame, "Head", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
                break

    cv2.imshow("Gesture or Head Detector", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
