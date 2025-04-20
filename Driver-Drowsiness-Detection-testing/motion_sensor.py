import smbus2
import time

class MPU6050:
    def __init__(self, address=0x68, threshold=0.5):
        self.bus = smbus2.SMBus(1)
        self.address = address
        self.threshold = threshold
        self.previous_values = {'x': 0, 'y': 0, 'z': 0}
        self.bus.write_byte_data(self.address, 0x6B, 0)

    def read_word(self, reg):
        high = self.bus.read_byte_data(self.address, reg)
        low = self.bus.read_byte_data(self.address, reg + 1)
        val = (high << 8) + low
        return val - 65536 if val > 32768 else val

    def get_accel_data(self):
        accel = {
            'x': self.read_word(0x3B) / 16384.0,
            'y': self.read_word(0x3D) / 16384.0,
            'z': self.read_word(0x3F) / 16384.0,
        }
        return accel

    def detect_motion(self):
        accel = self.get_accel_data()
        for axis in ['x', 'y', 'z']:
            if abs(accel[axis] - self.previous_values[axis]) > self.threshold:
                self.previous_values = accel
                return True
        self.previous_values = accel
        return False
