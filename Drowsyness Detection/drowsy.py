import cv2
import torch
import torchvision.transforms as transforms
from torchvision import models
from torch import nn
import time

# Load the model
model_path = "Drowsyness Detection/models/Drowsiness-MobileNetV3.pth"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load MobileNetV3 with grayscale input (1 channel)
model = models.mobilenet_v3_small(weights=None)
model.features[0][0] = torch.nn.Conv2d(1, 16, kernel_size=3, stride=2, padding=1, bias=False)

# Adjust classifier to match trained output (1 class)
model.classifier[3] = torch.nn.Linear(model.classifier[3].in_features, 1)

# Load weights
model.load_state_dict(torch.load(model_path, map_location=device))
model.to(device)
model.eval()

# Define transformation pipeline
transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Grayscale(num_output_channels=1),
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
])

# Directly define the class labels
class_labels = ["Drowsy", "Not Drowsy"]

# Start webcam
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Transform image
    input_tensor = transform(frame).unsqueeze(0).to(device)

    # Predict
    with torch.no_grad():
        output = model(input_tensor)
        prob = torch.sigmoid(output).item()  # Apply sigmoid for binary output
        label = class_labels[1] if prob > 0.5 else class_labels[0]

    # Display the result on the frame
    cv2.putText(frame, f"Prediction: {label}", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0) if label == "Not Drowsy" else (0, 0, 255), 2)
    
    cv2.imshow("Drowsiness Detection", frame)

    # Exit on pressing 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Cleanup
cap.release()
cv2.destroyAllWindows()