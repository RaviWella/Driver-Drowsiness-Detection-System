import cv2
import numpy as np
from tensorflow.keras.models import load_model
from collections import deque
import mediapipe as mp
import time

# Load your trained model
model = load_model("gesture_model.h5")
labels = ['closed_palm', 'open_palm']  # Index 0 = closed, Index 1 = open

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.7)
mp_drawing = mp.solutions.drawing_utils

# Prediction buffer
BUFFER_SIZE = 5
prediction_buffer = deque(maxlen=BUFFER_SIZE)

# Start webcam
cap = cv2.VideoCapture(0)
print("\n📸 Camera started — show gestures. Press 'q' to quit.\n")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    image = cv2.flip(frame, 1)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    result = hands.process(image_rgb)

    gesture = "No Hand Detected"

    if result.multi_hand_landmarks:
        for hand_landmarks in result.multi_hand_landmarks:
            # Get bounding box
            h, w, _ = image.shape
            landmark_array = np.array([[lm.x * w, lm.y * h] for lm in hand_landmarks.landmark])
            x_min = int(np.min(landmark_array[:, 0])) - 20
            y_min = int(np.min(landmark_array[:, 1])) - 20
            x_max = int(np.max(landmark_array[:, 0])) + 20
            y_max = int(np.max(landmark_array[:, 1])) + 20

            # Crop the hand region
            x_min = max(x_min, 0)
            y_min = max(y_min, 0)
            x_max = min(x_max, w)
            y_max = min(y_max, h)

            hand_img = image[y_min:y_max, x_min:x_max]
            try:
                hand_img_resized = cv2.resize(hand_img, (224, 224))
            except:
                continue

            input_img = np.expand_dims(hand_img_resized.astype(np.float32) / 255.0, axis=0)
            predictions = model.predict(input_img)
            class_index = np.argmax(predictions[0])
            confidence = predictions[0][class_index]
            gesture = labels[class_index]

            prediction_buffer.append(gesture)

            if len(prediction_buffer) == BUFFER_SIZE:
                most_common = max(set(prediction_buffer), key=prediction_buffer.count)
                count = prediction_buffer.count(most_common)

                if count >= 4 and confidence > 0.95:
                    if most_common == 'open_palm':
                        print("✅ ACTION: Drowsiness acknowledged. Buzzer stopped.")
                    elif most_common == 'closed_palm':
                        print("🚨 EMERGENCY: Accident detected! Alerting emergency services...")

            # Draw hand landmarks
            mp_drawing.draw_landmarks(image, hand_landmarks, mp_hands.HAND_CONNECTIONS)

    else:
        prediction_buffer.clear()  # Reset if no hand detected

    # Show status
    cv2.putText(image, f"Gesture: {gesture}", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0) if gesture != "No Hand Detected" else (0, 0, 255), 2)

    # Display the frame
    cv2.imshow("Gesture Detection", image)

    # Break loop
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
print("\n🛑 Test ended.")
