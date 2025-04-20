from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam
import os

# ✅ Path to your processed dataset (where images are .jpg and cleaned)
dataset_path = r"C:\Users\gawes\Desktop\Edge_AI_CW\processed_dataset"

# ✅ Image generators with validation split
datagen = ImageDataGenerator(
    rescale=1. / 255,
    validation_split=0.2  # 80% training, 20% validation
)

train_gen = datagen.flow_from_directory(
    dataset_path,
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical',
    subset='training',
    shuffle=True
)

val_gen = datagen.flow_from_directory(
    dataset_path,
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical',
    subset='validation'
)

# ✅ Load MobileNetV2 as base model
base_model = MobileNetV2(input_shape=(224, 224, 3), include_top=False, weights='imagenet')
base_model.trainable = False  # freeze the base model

# ✅ Build the full model
model = Sequential([
    base_model,
    GlobalAveragePooling2D(),
    Dense(128, activation='relu'),
    Dense(2, activation='softmax')  # Binary classification: open_palm, closed_palm
])

# ✅ Compile the model
model.compile(
    optimizer=Adam(learning_rate=0.0001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# ✅ Train the model
model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=10
)

# ✅ Save the model
model.save("gesture_model.h5")
print("✅ Model training completed and saved as gesture_model.h5")
