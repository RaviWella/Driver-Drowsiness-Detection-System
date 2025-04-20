import cv2
import mediapipe as mp
import numpy as np
import time

# Init Mediapipe
mp_hands = mp.solutions.hands
mp_face_mesh = mp.solutions.face_mesh

hands = mp_hands.Hands(min_detection_confidence=0.7, max_num_hands=1)
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, min_detection_confidence=0.5)

# EAR and yawning parameters
LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]
EAR_THRESHOLD = 0.25
YAWN_THRESHOLD = 25.0
DROWSY_DURATION = 2.0
NO_FACE_TIMEOUT = 2.0

# State tracking
eye_closed_start = None
no_face_start = None
fatigue_label = "Awake"
drowsy = False

def euclidean_dist(p1, p2):
    return np.linalg.norm(np.array(p1) - np.array(p2))

def eye_aspect_ratio(eye_points):
    A = euclidean_dist(eye_points[1], eye_points[5])
    B = euclidean_dist(eye_points[2], eye_points[4])
    C = euclidean_dist(eye_points[0], eye_points[3])
    return (A + B) / (2.0 * C)

def is_yawning(landmarks, width, height):
    top_lip = np.array([landmarks[13].x * width, landmarks[13].y * height])
    bottom_lip = np.array([landmarks[14].x * width, landmarks[14].y * height])
    dist = euclidean_dist(top_lip, bottom_lip)
    return dist > YAWN_THRESHOLD

def get_head_tilt_angle(landmarks, width, height):
    left_eye = np.array([landmarks[33].x * width, landmarks[33].y * height])
    right_eye = np.array([landmarks[263].x * width, landmarks[263].y * height])
    delta_y = right_eye[1] - left_eye[1]
    delta_x = right_eye[0] - left_eye[0]
    angle = np.arctan2(delta_y, delta_x) * 180 / np.pi
    return angle

def is_fist(hand_landmarks):
    tips = [4, 8, 12, 16, 20]
    folded = 0
    for tip_id in tips:
        tip = hand_landmarks.landmark[tip_id]
        pip = hand_landmarks.landmark[tip_id - 2]
        if tip.y > pip.y:
            folded += 1
    return folded >= 3

def is_peace_sign(hand_landmarks):
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

# Webcam
cap = cv2.VideoCapture(0)

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    height, width, _ = frame.shape
    drew_box = False
    drowsy = False

    # --- Hand gesture detection ---
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
                x_min, y_min = max(0, x_min), max(0, y_min)
                x_max, y_max = min(width, x_max), min(height, y_max)

                cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)
                cv2.putText(frame, gesture, (x_min, y_min - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
                drew_box = True
                break

    # Skip face logic if gesture is detected
    if drew_box:
        no_face_start = None
        cv2.imshow("Fatigue + Gesture Detector", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
        continue

    # --- Face fatigue analysis ---
    face_results = face_mesh.process(image_rgb)
    if face_results.multi_face_landmarks:
        landmarks = face_results.multi_face_landmarks[0].landmark

        left_eye_pts = [(landmarks[i].x * width, landmarks[i].y * height) for i in LEFT_EYE]
        right_eye_pts = [(landmarks[i].x * width, landmarks[i].y * height) for i in RIGHT_EYE]
        left_ear = eye_aspect_ratio(left_eye_pts)
        right_ear = eye_aspect_ratio(right_eye_pts)
        avg_ear = (left_ear + right_ear) / 2.0

        yawning = is_yawning(landmarks, width, height)
        head_angle = get_head_tilt_angle(landmarks, width, height)
        head_droop = abs(head_angle) > 15

        current_time = time.time()

        if avg_ear < EAR_THRESHOLD or yawning or head_droop:
            if eye_closed_start is None:
                eye_closed_start = current_time
            elif current_time - eye_closed_start >= DROWSY_DURATION:
                drowsy = True
        else:
            eye_closed_start = None

        fatigue_label = "Drowsy" if drowsy else "Awake"
        color = (0, 0, 255) if drowsy else (0, 255, 0)

        xs = [lm.x * width for lm in landmarks]
        ys = [lm.y * height for lm in landmarks]
        x_min, y_min = int(min(xs)), int(min(ys))
        x_max, y_max = int(max(xs)), int(max(ys))

        cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), color, 2)
        cv2.putText(frame, fatigue_label, (x_min, y_min - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)

        no_face_start = None

    else:
        current_time = time.time()
        if no_face_start is None:
            no_face_start = current_time
        elif current_time - no_face_start >= NO_FACE_TIMEOUT:
            drowsy = True
            fatigue_label = "No Face Detected"
            color = (0, 0, 255)
            cv2.putText(frame, fatigue_label, (30, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)

    cv2.imshow("Fatigue + Gesture Detector", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
