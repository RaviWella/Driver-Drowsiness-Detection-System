import cv2
import mediapipe as mp
import numpy as np
import time
from buzzer import buzz_drowsy, buzz_alert
import requests
from datetime import datetime

mp_hands = mp.solutions.hands
mp_face_mesh = mp.solutions.face_mesh

hands = mp_hands.Hands(min_detection_confidence=0.7)
face_mesh = mp_face_mesh.FaceMesh(min_detection_confidence=0.5)

LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]
EAR_THRESHOLD = 0.25
YAWN_THRESHOLD = 25
DROWSY_DURATION = 2
NO_FACE_TIMEOUT = 2
FIST_ALERT_COOLDOWN = 10

def send_emergency_alert():
    url = "https://dd-api-production.up.railway.app/sendAlerts?deviceKey=key-001"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            buzz_alert()
            print("[Alert] Sent successfully.")
        else:
            print("[Alert] Failed:", response.status_code)
    except Exception as e:
        print("[Alert] Exception:", e)

def eye_aspect_ratio(eye):
    A = np.linalg.norm(np.array(eye[1]) - np.array(eye[5]))
    B = np.linalg.norm(np.array(eye[2]) - np.array(eye[4]))
    C = np.linalg.norm(np.array(eye[0]) - np.array(eye[3]))
    return (A + B) / (2.0 * C)

def run_detection_loop():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Camera couldn't be opened.")
        return

    eye_closed_start = None
    no_face_start = None
    last_fist_alert_time = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        h, w, _ = frame.shape
        image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        drowsy = False
        hand_results = hands.process(image_rgb)

        if hand_results.multi_hand_landmarks:
            for hand in hand_results.multi_hand_landmarks:
                lm = hand.landmark
                if lm[8].y < lm[6].y and lm[12].y < lm[10].y and lm[16].y > lm[14].y and lm[20].y > lm[18].y:
                    if time.time() - last_fist_alert_time > FIST_ALERT_COOLDOWN:
                        send_emergency_alert()
                        last_fist_alert_time = time.time()

        face_results = face_mesh.process(image_rgb)
        if face_results.multi_face_landmarks:
            lm = face_results.multi_face_landmarks[0].landmark
            left_eye = [(lm[i].x * w, lm[i].y * h) for i in LEFT_EYE]
            right_eye = [(lm[i].x * w, lm[i].y * h) for i in RIGHT_EYE]

            ear = (eye_aspect_ratio(left_eye) + eye_aspect_ratio(right_eye)) / 2.0

            lip_top = np.array([lm[13].x * w, lm[13].y * h])
            lip_bottom = np.array([lm[14].x * w, lm[14].y * h])
            yawn_dist = np.linalg.norm(lip_top - lip_bottom)

            now = time.time()
            if ear < EAR_THRESHOLD or yawn_dist > YAWN_THRESHOLD:
                if eye_closed_start is None:
                    eye_closed_start = now
                elif now - eye_closed_start > DROWSY_DURATION:
                    drowsy = True
            else:
                eye_closed_start = None

            if drowsy:
                buzz_drowsy()

        cv2.imshow("Driver Monitor", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
