import os
import glob
import numpy as np
import cv2
import tensorflow as tf
import xml.etree.ElementTree as ET
import random
import shutil
from sklearn.model_selection import train_test_split

def create_dataset_directories():
    """Create necessary directories for the dataset"""
    os.makedirs('dataset/images/train', exist_ok=True)
    os.makedirs('dataset/images/val', exist_ok=True)
    os.makedirs('dataset/annotations/train', exist_ok=True)
    os.makedirs('dataset/annotations/val', exist_ok=True)

def prepare_hand_gesture_data(rock_dir, paper_dir, output_dir, test_size=0.2):
    """
    Process rock (fist) and paper (palm) images and create annotations
    
    Args:
        rock_dir: Directory containing rock/fist images
        paper_dir: Directory containing paper/palm images
        output_dir: Base directory for processed dataset
        test_size: Proportion of data to use for validation
    """
    create_dataset_directories()
    
    # Process rock/fist images (class 1)
    process_class_images(rock_dir, output_dir, class_id=1, class_name='fist', test_size=test_size)
    
    # Process paper/palm images (class 2)
    process_class_images(paper_dir, output_dir, class_id=2, class_name='palm', test_size=test_size)
    
    print(f"Dataset prepared and saved to {output_dir}")

def process_class_images(class_dir, output_dir, class_id, class_name, test_size=0.2):
    """Process images for a specific class and create annotations"""
    image_files = glob.glob(os.path.join(class_dir, '*.jpg')) + glob.glob(os.path.join(class_dir, '*.png'))
    
    # Split into train and validation sets
    train_files, val_files = train_test_split(image_files, test_size=test_size, random_state=42)
    
    # Process training images
    process_image_set(train_files, os.path.join(output_dir, 'images/train'), 
                      os.path.join(output_dir, 'annotations/train'), class_id, class_name)
    
    # Process validation images
    process_image_set(val_files, os.path.join(output_dir, 'images/val'), 
                      os.path.join(output_dir, 'annotations/val'), class_id, class_name)
    
def process_image_set(files, image_dir, annotation_dir, class_id, class_name):
    """Process a set of images and create annotation files"""
    for i, img_path in enumerate(files):
        # Read image
        img = cv2.imread(img_path)
        if img is None:
            continue
            
        # Resize image to standard size
        img = cv2.resize(img, (224, 224))
        
        # Create a simple annotation (assuming the hand takes up most of the image)
        # In a real scenario, you would annotate the actual hand position
        height, width, _ = img.shape
        x_min = int(width * 0.1)
        y_min = int(height * 0.1)
        x_max = int(width * 0.9)
        y_max = int(height * 0.9)
        
        # Generate unique filename
        filename = f"{class_name}_{i:04d}.jpg"
        
        # Save image
        cv2.imwrite(os.path.join(image_dir, filename), img)
        
        # Create and save annotation XML file (Pascal VOC format)
        create_annotation_file(
            filename,
            width, height,
            class_name, class_id,
            x_min, y_min, x_max, y_max,
            os.path.join(annotation_dir, f"{os.path.splitext(filename)[0]}.xml")
        )

def create_annotation_file(filename, width, height, class_name, class_id, 
                          xmin, ymin, xmax, ymax, output_path):
    """Create a Pascal VOC format annotation file"""
    root = ET.Element("annotation")
    
    # Add image information
    ET.SubElement(root, "filename").text = filename
    size = ET.SubElement(root, "size")
    ET.SubElement(size, "width").text = str(width)
    ET.SubElement(size, "height").text = str(height)
    ET.SubElement(size, "depth").text = "3"
    
    # Add object information
    obj = ET.SubElement(root, "object")
    ET.SubElement(obj, "name").text = class_name
    ET.SubElement(obj, "pose").text = "Unspecified"
    ET.SubElement(obj, "truncated").text = "0"
    ET.SubElement(obj, "difficult").text = "0"
    
    bndbox = ET.SubElement(obj, "bndbox")
    ET.SubElement(bndbox, "xmin").text = str(xmin)
    ET.SubElement(bndbox, "ymin").text = str(ymin)
    ET.SubElement(bndbox, "xmax").text = str(xmax)
    ET.SubElement(bndbox, "ymax").text = str(ymax)
    
    # Write to file
    tree = ET.ElementTree(root)
    tree.write(output_path)

def create_tf_records():
    """
    Convert the prepared dataset to TFRecord format
    Note: This is a placeholder - for a real implementation, you would need
    to create TFRecords compatible with your SSD model
    """
    print("TFRecord creation would be implemented here based on your specific model requirements")
    
if __name__ == "__main__":
    # Example usage
    prepare_hand_gesture_data(
        rock_dir='path/to/rock_dataset',  # Fist images
        paper_dir='path/to/paper_dataset',  # Palm images
        output_dir='dataset'
    )
    
    # Create TFRecords (would need implementation)
    # create_tf_records()