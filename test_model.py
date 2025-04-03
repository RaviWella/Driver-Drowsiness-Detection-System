import os
import cv2
import numpy as np
import tensorflow as tf

# Load the model
drowsiness_model = tf.keras.models.load_model("C:/Users/gawes/Desktop/Edge_AI_CW/drowsiness_model")


def load_and_preprocess_image(image_path):
    """Loads an image, resizes it to (224, 224), and normalizes it."""
    img = cv2.imread(image_path)
    if img is None:
        print(f"Error loading image: {image_path}")
        return None
    img = cv2.resize(img, (224, 224))  # Resize to match model input size
    img = img / 255.0  # Normalize pixel values
    img = np.expand_dims(img, axis=0)  # Expand dimensions for batch processing
    return img


def test_drowsiness_images(test_folder):
    """Tests drowsiness detection model with new test images."""
    if not os.path.exists(test_folder):
        print(f"Error: Test folder '{test_folder}' not found!")
        return

    for filename in os.listdir(test_folder):
        image_path = os.path.join(test_folder, filename)
        img = load_and_preprocess_image(image_path)
        if img is not None:
            prediction = drowsiness_model.predict(img)
            status = "Awake" if prediction[0][0] > 0.5 else "Drowsy"
            print(f"{filename} → Prediction: {status}")


if __name__ == "__main__":
    # Set test folder
    drowsiness_test_folder = "C:/Users/gawes/Desktop/Edge_AI_CW/Test/"

    print("\n🔍 Testing Drowsiness Detection Model:")
    test_drowsiness_images(drowsiness_test_folder)
