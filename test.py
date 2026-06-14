import pyautogui
import time

# Shows the mouse pointer coordinates in real-time.
# Use this to find the exact (x, y) for the WhatsApp "Send" button.

try:
    while True:
        x, y = pyautogui.position()
        print(f"X={x}, Y={y}")
        time.sleep(0.05)
except KeyboardInterrupt:
    # Ctrl+C will stop the loop cleanly.
    pass

