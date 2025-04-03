import cv2
import numpy as np
import os
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV3Large
from tensorflow.keras import layers, models
from tensorflow.keras.optimizers import Adam

def load_images_from_folder(folder, label):
    """Load images from a folder and assign labels"""
    images = []
    labels = []
    for filename in os.listdir(folder):
        img_path = os.path.join(folder, filename)
        img = cv2.imread(img_path)
        if img is not None:
            img = cv2.resize(img, (224, 224))  # Resize to a standard size
            img = img / 255.0  # Normalize to 0-1
            images.append(img)
            labels.append(label)
    return images, labels

def load_hand_gestures_from_folder(folder, label):
    """Load hand gesture images from folder and assign labels."""
    images = []
    labels = []
    for filename in os.listdir(folder):
        img_path = os.path.join(folder, filename)
        img = cv2.imread(img_path)
        if img is not None:
            img = cv2.resize(img, (224, 224))  # Resize to 224x224
            img = img / 255.0  # Normalize to 0-1
            images.append(img)
            labels.append(label)
    return images, labels

# Paths to the train and test datasets for drowsiness detection
train_folder = './drowsiness/train/'
test_folder = './drowsiness/test/'

# Categories: closed, open, yawn, no_yawn
train_images = []
train_labels = []
test_images = []
test_labels = []

# Drowsy: closed, yawn (label=0), Awake: open, no_yawn (label=1)
drowsiness_folders = ['closed', 'open', 'yawn', 'no_yawn']

# Load train data for drowsiness detection
for i, folder_name in enumerate(drowsiness_folders):
    folder_path = os.path.join(train_folder, folder_name)
    label = 0 if folder_name in ['closed', 'yawn'] else 1
    images, labels = load_images_from_folder(folder_path, label)
    train_images.extend(images)
    train_labels.extend(labels)

# Load test data for drowsiness detection
for i, folder_name in enumerate(drowsiness_folders):
    folder_path = os.path.join(test_folder, folder_name)
    label = 0 if folder_name in ['closed', 'yawn'] else 1
    images, labels = load_images_from_folder(folder_path, label)
    test_images.extend(images)
    test_labels.extend(labels)

# Convert to numpy arrays
train_images = np.array(train_images)
train_labels = np.array(train_labels)
test_images = np.array(test_images)
test_labels = np.array(test_labels)

# Check the shape of the loaded data
print("Training data shape:", train_images.shape)
print("Test data shape:", test_images.shape)

# Load hand gesture data
gestures_folder = './hand_gestures/'

hand_gesture_images = []
hand_gesture_labels = []

# Load Thumbs Up (label = 1) and Open Palm (label = 0)
gesture_folders = ['thumbs_up', 'open_palm']

for i, folder_name in enumerate(gesture_folders):
    folder_path = os.path.join(gestures_folder, folder_name)
    label = 1 if folder_name == 'thumbs_up' else 0
    images, labels = load_hand_gestures_from_folder(folder_path, label)
    hand_gesture_images.extend(images)
    hand_gesture_labels.extend(labels)

# Convert to numpy arrays for hand gestures
hand_gesture_images = np.array(hand_gesture_images)
hand_gesture_labels = np.array(hand_gesture_labels)

# Check the shape of the loaded hand gesture data
print("Hand gesture data shape:", hand_gesture_images.shape)

# Data Augmentation (for both drowsiness and hand gesture datasets)
data_gen = ImageDataGenerator(
    rotation_range=20,   # Random rotations
    width_shift_range=0.2,  # Random horizontal shifts
    height_shift_range=0.2, # Random vertical shifts
    shear_range=0.2,     # Shearing
    zoom_range=0.2,      # Zoom in/out
    horizontal_flip=True, # Random horizontal flip
    fill_mode='nearest'  # Fill mode for newly created pixels
)

# Augment training data for drowsiness (for better generalization)
train_images_augmented = data_gen.flow(train_images, train_labels, batch_size=32)
hand_gesture_images_augmented = data_gen.flow(hand_gesture_images, hand_gesture_labels, batch_size=32)

# Define the MobileNetV3 model for drowsiness detection
base_model = MobileNetV3Large(input_shape=(224, 224, 3), include_top=False, weights='imagenet')

# Freeze the base model layers (optional for fine-tuning)
base_model.trainable = False

# Create the custom model
model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(128, activation='relu'),
    layers.Dense(1, activation='sigmoid')
])

# Compile the model
model.compile(optimizer=Adam(), loss='binary_crossentropy', metrics=['accuracy'])

# Train the model on drowsiness data
model.fit(train_images_augmented, epochs=10, validation_data=(test_images, test_labels))

# Evaluate the model
test_loss, test_acc = model.evaluate(test_images, test_labels)
print("Test accuracy on drowsiness data:", test_acc)

# Now, let's define the MobileNetV3 model for hand gestures
gesture_base_model = MobileNetV3Large(input_shape=(224, 224, 3), include_top=False, weights='imagenet')

# Freeze the base model layers (optional for fine-tuning)
gesture_base_model.trainable = False

# Create the custom model for hand gesture recognition
gesture_model = models.Sequential([
    gesture_base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(128, activation='relu'),
    layers.Dense(1, activation='sigmoid')
])

# Compile the gesture model
gesture_model.compile(optimizer=Adam(), loss='binary_crossentropy', metrics=['accuracy'])

# Train the model on hand gesture data
gesture_model.fit(hand_gesture_images_augmented, epochs=10, validation_data=(hand_gesture_images, hand_gesture_labels))

# Evaluate the gesture model
gesture_test_loss, gesture_test_acc = gesture_model.evaluate(hand_gesture_images, hand_gesture_labels)
print("Test accuracy on hand gesture data:", gesture_test_acc)

# Save the model in SavedModel format
model.save("C:/Users/gawes/Desktop/Edge_AI_CW/drowsiness_model", save_format='tf')

