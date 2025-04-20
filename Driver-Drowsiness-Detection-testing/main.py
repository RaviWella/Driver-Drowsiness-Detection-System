from motion_sensor import MPU6050
from drowsy_detector import run_detection_loop
from led import led_on, led_off
import time

motion_sensor = MPU6050()
cooldown_start = None
camera_on = False

while True:
    if motion_sensor.detect_motion():
        if not camera_on:
            print("[Motion] Detected — Turning on camera.")
            led_on()
            camera_on = True
            run_detection_loop()
            cooldown_start = None
    else:
        if camera_on and cooldown_start is None:
            cooldown_start = time.time()
        elif camera_on and cooldown_start and time.time() - cooldown_start > 3:
            print("[Motion] No activity — Turning off camera.")
            led_off()
            camera_on = False
            cooldown_start = None

    time.sleep(0.2)
