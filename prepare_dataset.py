import cv2
import os
import numpy as np
from tqdm import tqdm
from pathlib import Path
import random

# Configuration
INPUT_DIR = r"C:\Users\gawes\Desktop\Edge_AI_CW\dataset"
OUTPUT_DIR = r"C:\Users\gawes\Desktop\Edge_AI_CW\processed_dataset"
TARGET_SIZE = (224, 224)
AUGMENT_PER_IMAGE = 3  # how many augmented copies per image

# Create output folders
for class_name in ['open_palm', 'closed_palm']:
    Path(f"{OUTPUT_DIR}/{class_name}").mkdir(parents=True, exist_ok=True)


# Augmentation functions
def random_augment(image):
    rows, cols = image.shape[:2]

    # Random rotation
    angle = random.uniform(-15, 15)
    M = cv2.getRotationMatrix2D((cols / 2, rows / 2), angle, 1)
    image = cv2.warpAffine(image, M, (cols, rows))

    # Random brightness
    factor = random.uniform(0.7, 1.3)
    image = cv2.convertScaleAbs(image, alpha=factor, beta=0)

    # Add Gaussian blur
    if random.random() < 0.3:
        k = random.choice([3, 5])
        image = cv2.GaussianBlur(image, (k, k), 0)

    return image


# Process and augment images
for class_name in ['open_palm', 'closed_palm']:
    input_folder = os.path.join(INPUT_DIR, class_name)
    output_folder = os.path.join(OUTPUT_DIR, class_name)
    files = os.listdir(input_folder)

    for file in tqdm(files, desc=f"Processing {class_name}"):
        path = os.path.join(input_folder, file)
        img = cv2.imread(path)
        if img is None:
            continue

        # Rotate to correct orientation (manually 90 clockwise for now)
        img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)

        # Resize and save original (processed)
        img_resized = cv2.resize(img, TARGET_SIZE)
        base_filename = os.path.splitext(file)[0]
        cv2.imwrite(f"{output_folder}/{base_filename}_original.jpg", img_resized)

        # Generate augmented images
        for i in range(AUGMENT_PER_IMAGE):
            aug_img = random_augment(img_resized.copy())
            cv2.imwrite(f"{output_folder}/{base_filename}_aug{i}.jpg", aug_img)

print("✅ Dataset preprocessing and augmentation completed.")
