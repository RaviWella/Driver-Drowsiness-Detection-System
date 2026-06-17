# WakeVision - Driver Drowsiness Detection System

**BSc (Hons) Artificial Intelligence and Data Science**  
Informatics Institute of Technology | In Collaboration with Robert Gordon University, Aberdeen  
Group 7 | April 2025

***

<img width="876" height="475" alt="Screenshot 2025-06-21 193715" src="https://github.com/user-attachments/assets/e5b1d63c-8554-4efa-8235-e17771ca5aa8" />


## Table of Contents

- [Overview](#overview)
- [Problem Background](#problem-background)
- [Project Aim](#project-aim)
- [Solution](#solution)
- [System Architecture](#system-architecture)
- [Hardware Requirements](#hardware-requirements)
- [Software Requirements](#software-requirements)
- [Key Features](#key-features)
- [Functional Requirements](#functional-requirements)
- [System Workflows](#system-workflows)
- [Mobile Application UI](#mobile-application-ui)
- [Challenges](#challenges)
- [Limitations and Future Enhancements](#limitations-and-future-enhancements)
- [Design Changes](#design-changes)
- [Team](#team)

***

## Overview

WakeVision is a real-time, Edge AI-based driver drowsiness detection system designed to operate on low-resource hardware. The system monitors the driver continuously, triggers an audible alarm when drowsiness is detected, and allows the driver to send emergency alerts to pre-configured contacts using hand gestures — without any physical interaction with buttons or a touchscreen.

The system is named **WakeVision** and operates under the motto: *Stay Awake. Stay Safe.*

***

## Problem Background

According to the National Highway Traffic Safety Administration (NHTSA), drowsy driving is responsible for approximately 91,000 crashes, 50,000 injuries, and 800 deaths every year. Research indicates that fatigued driving is comparable in danger to intoxicated driving, as it directly impairs reaction time and decision-making ability.

Existing cloud-based drowsiness detection systems introduce latency, raise user privacy concerns, and require a stable internet connection throughout operation. Additionally, systems that rely on physical interaction — such as buttons or touchscreens — create secondary distraction risks for drowsy drivers.

WakeVision addresses these limitations by processing all critical detection logic on-device (Edge AI), and by using hand gesture recognition to minimise physical interaction.

***

## Project Aim

Develop a cost-effective and resource-efficient drowsiness detection system that alerts emergency contacts to enhance driver safety.

***

## Solution

WakeVision is built around the following design principles:

- **Edge AI Processing**: All drowsiness detection and gesture recognition runs locally on the embedded device (Raspberry Pi), removing dependency on a continuous internet connection for core functionality.
- **Gesture-Based Control**: The driver interacts with the system via recognised hand gestures, enabling a hands-free experience that reduces distraction.
- **Optimised Resource Usage**: The system processes grayscale frames at a reduced frame rate to minimise computational load on the edge device.
- **Emergency Alerting**: When drowsiness is detected or the driver initiates an emergency gesture, the system automatically sends text messages to the driver's pre-configured emergency contacts via a third-party messaging service (Twilio).
- **Automatic Activation**: The system activates automatically when vehicle movement is detected via the IMU sensor, requiring no manual startup from the driver.

***

## System Architecture

The WakeVision architecture consists of four primary components:

### Edge Device (Raspberry Pi)

The edge device is the core processing unit. It hosts:

- **Detection Module**: Handles real-time drowsiness detection and hand gesture classification using MediaPipe.
- **End Device Logic**: Controls the buzzer, manages IMU input, and coordinates detection scheduling.
- **End Device API**: Communicates with the cloud server to trigger emergency alerts.
- **Sensor Area**: Houses the IMU sensor (MPU6050) and standard webcam camera.
- **Buzzer**: Activates audibly when drowsiness is detected; silenced via a specific hand gesture.

### Cloud Server

The cloud server manages account data, emergency contacts, and alert dispatch. It exposes an HTTP API and communicates with:

- **MongoDB Database**: Stores user accounts, device registrations, emergency contact lists, and alert history.
- **Twilio (3rd Party Text Message Service)**: Sends SMS alerts to emergency contacts when a request is received from the edge device.

### Mobile Application

Built with React Native and supported on both Android and iOS, the mobile app allows the driver to:

- Register and authenticate using a unique device key.
- Add, update, and delete emergency contacts.
- View alert history and drowsiness logs.
- Monitor device connectivity status in real time.

The mobile app uses local storage for offline contact management and automatically syncs with the cloud server when internet access is available. It does not communicate directly with the edge device.

### Data Flow Summary

```
Driver (Camera) --> Edge Device --> Cloud Server API --> Twilio --> Emergency Contacts
                                                      --> MongoDB (log)
Mobile App <--> Cloud Server API <--> MongoDB
```

***

## Hardware Requirements

| Component | Specification / Model | Purpose |
|---|---|---|
| Raspberry Pi 4 Model B | 4GB RAM, VideoCore VI GPU | Main processing unit for ML inference, sensor management, and output control |
| Micro SD Card | 64GB, Class-10 UHS-I | Storage for OS, trained models, captured frames, and program files |
| Camera | Standard Webcam (revised from NoIR module) | Captures driver's face for drowsiness detection and hand gesture recognition |
| IMU Sensor | MPU6050 (Accelerometer + Gyroscope) | Detects vehicle movement to trigger system activation |
| Active Buzzer Module | 3.3V/5V compatible | Triggers audible alarm when drowsiness is detected |
| Power Supply | 5V 3A USB-C Adapter or Car Adapter | Powers the Raspberry Pi reliably inside the vehicle |

***

## Software Requirements

| Software / Framework | Purpose |
|---|---|
| Python | Primary programming language |
| MediaPipe | Drowsiness detection and hand gesture recognition (replaced MTL model) |
| opencv-python | Image processing and frame capture |
| PyTorch (torch, torchvision) | Deep neural network development and training |
| scikit-learn | Model evaluation |
| matplotlib / Seaborn | Data visualisation |
| React Native / Expo Go | Cross-platform mobile application development |
| Express.js | Cloud API development |
| MongoDB | NoSQL database for user data and alert history |
| Raspberry Pi OS (64-bit) | Edge device operating system |
| VS Code | Development environment |
| Git / GitHub | Version control and collaboration |
| Figma | UI mockup design |
| Draw.io | System architecture and UML diagrams |
| Kaggle | Dataset sourcing and model experimentation |
| Twilio | Third-party SMS alert service |

***

## Key Features

- **Real-time drowsiness detection** using facial analysis (eye closure rate and yawning patterns)
- **Hand gesture recognition** for hands-free system control
- **Automatic buzzer activation** when drowsiness is confirmed across multiple frames
- **Emergency SMS alerts** sent to pre-configured contacts via a Fist gesture
- **Buzzer dismissal** via a specific control gesture
- **Vehicle movement detection** using IMU sensor to auto-start the system
- **Cloud-synced emergency contacts** managed through the mobile application
- **Drowsiness alert history log** accessible through the mobile application
- **Real-time device connectivity indicator** displayed on the mobile app home screen
- **Offline-capable contact management** with automatic cloud sync when internet is restored

***

## Functional Requirements

| Functionality | Description |
|---|---|
| User Authentication | Credential-based login to secure access to personal data and system features |
| Manage Emergency Contacts | Full CRUD operations on emergency contacts via the mobile application |
| Emergency Messaging via Gestures | A recognised Fist gesture triggers automatic SMS alerts to all saved contacts |
| Drowsiness Alert History | Drivers can review a history log of all generated drowsiness alerts |
| Device Connectivity Status | Real-time indicator on the mobile app showing whether the edge device is connected |
| Vehicle Movement Detection | IMU sensor activates the drowsiness detection pipeline when the vehicle is in motion |
| Face and Hand Detection | Frame captured at intervals is processed to identify drowsiness level and hand gestures |
| Drowsiness Detection | Analyses facial features across multiple frames to confirm and trigger safety mechanisms |
| Alarm System Activation | Audible buzzer activates immediately upon confirmed drowsiness detection |
| Gesture-Based Controls | Specific gestures stop the alarm or trigger emergency alerts |
| System Auto-On Logic | System starts automatically once vehicle movement is confirmed |
| Cloud Sync / Data Backup | Drowsiness events and emergency alerts are stored in the cloud for long-term tracking |

***

## System Workflows

### Emergency Alert Flow

1. Driver shows the emergency hand gesture (Fist) to the camera.
2. Edge device identifies the gesture.
3. Edge device sends a GET request to the cloud server.
4. Cloud server retrieves emergency contact details from the database.
5. Cloud server sends a request to Twilio to dispatch text messages.
6. Twilio delivers the SMS messages to all emergency contacts.
7. Cloud server returns request status to the edge device.
8. Mobile app receives a notification confirming the alert was sent.

### Buzzer Control Flow

1. Drowsiness is detected; edge device activates the buzzer.
2. Driver shows the control hand gesture (Fist) to the camera.
3. Edge device classifies the gesture.
4. Buzzer is silenced and the system is paused for a pre-set duration.

### Driver Registration Flow

1. Driver opens the mobile app and requests a new account.
2. App prompts for personal details (name, email, password).
3. Cloud server validates details and checks for duplicate emails.
4. Driver enters a unique device key.
5. Cloud server validates the device key and activates it.
6. Personal details are saved to the database and the account is confirmed.

### Emergency Contact Management Flow

1. Driver navigates to the Contacts section in the mobile app.
2. App requests device contacts (with permission) and fetches saved cloud contacts.
3. Driver can add a new contact (POST request to cloud), delete an existing contact (DELETE request), or view the current list.
4. All changes sync to MongoDB via the cloud server API.

***

## Mobile Application UI

The mobile application consists of the following screens:

- **Login Page**: Email and password authentication with a "Forgot Password" option and Google sign-in.
- **Register Page**: Account creation form including first name, last name, email, password, and device key fields.
- **Home Page**: Displays system status (active devices, today's alerts, accuracy), device connectivity indicators (IR Camera, Buzzer, Detection Engine, Cloud Sync), and recent alerts.
- **Alerts Page**: Full drowsiness alert history log with timestamps.
- **Contacts Page**: Searchable emergency contact list with add, view, and delete functionality.

***

## Challenges

- Quality labelled driver drowsiness datasets are limited and difficult to source.
- Configuring the edge device and establishing reliable connections to sensor peripherals.
- Achieving accurate model inference performance within the resource constraints of the Raspberry Pi.
- Establishing stable communication between the edge device and the mobile application.

***

## Limitations and Future Enhancements

**Current Limitations**

- The edge device requires an active internet connection to send emergency alerts to contacts.
- SMS delivery depends on the availability and reliability of the Twilio third-party service.

**Planned Future Enhancements**

- Cloud-based ML model to analyse individual drowsiness patterns over time and personalise detection thresholds per driver.
- Route SMS alerts directly through the driver's mobile phone messaging app, removing third-party service dependency.

***

## Design Changes

During development, the following design decisions were revised from the original specification:

| Original Design | Revised Design | Reason |
|---|---|---|
| Raspberry Pi Camera Module 2 NoIR | Standard Webcam | Clearer footage quality in standard lighting conditions |
| Multi-Task Learning (MTL) model for combined drowsiness and gesture detection | MediaPipe | More accurate and reliable detection performance on the edge device |

***

## Team

| Name | IIT Student ID | RGU Student ID |
|---|---|---|
| Ravindu Wellalage | 20220577 | 2313077 |
| Rumeth Sandinu | 20222449 | 2311688 |
| Gawesh Gomes | 20220578 | 2313082 |
| Mohamed Aslam | 20222439 | 2311131 |

<img width="3024" height="4032" alt="WhatsApp Image 2025-06-21 at 19 30 46_2a34816f" src="https://github.com/user-attachments/assets/a7d90b06-92f5-4952-97dc-bc8242df925e" />


**Module Leader**: Mr. Mohamed Ayoob

***

*Submitted in partial fulfilment of the requirements for the BSc (Hons) Artificial Intelligence and Data Science degree at Robert Gordon University.*

*Copyright for this project and all its associated products resides with the Informatics Institute of Technology.*
