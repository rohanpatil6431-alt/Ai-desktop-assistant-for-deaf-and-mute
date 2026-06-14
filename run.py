import sys
import os
import subprocess
import multiprocessing

print("=========================================")
print("       JARVIS SYSTEM BOOTLOADER          ")
print("=========================================")

# 1. Force Virtual Environment Wrapper
_venv_python = os.path.abspath(os.path.join(os.path.dirname(__file__), "venv", "Scripts", "python.exe"))
if os.path.exists(_venv_python) and os.path.normpath(sys.executable) != os.path.normpath(_venv_python):
    print("[REDIRECT] Diverting launch into Virtual Environment (venv)...")
    result = subprocess.run([_venv_python] + sys.argv)
    sys.exit(result.returncode)

# If we reach here, we are running inside the correct environment
print(f"[STATUS] Active Python: {sys.executable}")

# For compatibility with main.py import
def listenHotword():
    return

if __name__ == '__main__':
    multiprocessing.freeze_support()
    
    try:
        print("[LOAD] Loading system modules (main.py)...")
        from main import start_jarvis_system
        
        print("[BOOT] Launching Jarvis core...")
        ok = start_jarvis_system()
        
        if not ok:
            print("\n[FAILED] STARTUP FAILED: Port 5550 is blocked.")
            print("A hidden Python window from a previous run is likely still open in the background.")
            print("FIX: Close VS Code completely and reopen it to clear background memory.")
            input("\nPress Enter to close this window...")
        else:
            print("[SUCCESS] System running successfully.")
            
    except Exception as e:
        print("\n[CRITICAL] SYSTEM CRASH ON STARTUP:")
        print("--------------------------------------------------")
        import traceback
        traceback.print_exc()
        print("--------------------------------------------------")
        print("Look at the error lines right above! They show exactly what is broken.")
        input("\nPress Enter to exit and fix the error...")