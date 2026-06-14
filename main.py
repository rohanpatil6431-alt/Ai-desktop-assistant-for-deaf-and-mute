import warnings
warnings.filterwarnings("ignore", category=UserWarning)

import os
import eel
import threading
import time
import signal

from run import listenHotword
from engine.auth import recoganize
from engine.features import *
from engine.command import *

eel.init("www")

hotword_process = None
chrome_proc = None


def _try_start_eel():
    """Start eel only if we can bind the port.

    Prevents WinError 10048 from eel/bottle/gevent on Windows.
    """
    import socket

    host = "127.0.0.1"
    port = 5550

    # Bind-test: if binding fails, something else already owns the port.
    test_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        test_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        test_sock.bind((host, port))
        
        # ─── CRITICAL FIX: Close the socket BEFORE calling Eel ───────────────
        # Because eel.start blocks the code, the old code kept this socket open,
        # causing the program to block its own port!
        test_sock.close() 
        # ─────────────────────────────────────────────────────────────────────
        
        return _start_eel_on_port(host, port)
    except OSError as e:
        print(f"Eel port {host}:{port} is already in use ({e}). Exiting this instance.")
        return False
    finally:
        try:
            test_sock.close()
        except Exception:
            pass


def _start_eel_on_port(host: str, port: int):
    eel.start(
        'index.html',
        mode=None,
        host=host,
        port=port,
        block=True,
    )


@eel.expose
def init():
    eel.hideLoader()
    time.sleep(1)
    playAssistantSound()


@eel.expose
def requestShutdown():
    shutdown()


def shutdown(*args):
    print("Shutting down Jarvis...")

    # Hard-kill all backend + UI processes.
    try:
        os.system('taskkill /F /T /IM python.exe >nul 2>&1')
    except Exception:
        pass

    try:
        os.system('taskkill /F /T /IM chrome.exe >nul 2>&1')
    except Exception:
        pass

    global hotword_process, chrome_proc

    if hotword_process is not None and hotword_process.is_alive():
        try:
            hotword_process.terminate()
            hotword_process.join(timeout=2)
        except Exception as e:
            print(e)

    print("Goodbye.")
    os._exit(0)


signal.signal(signal.SIGINT, shutdown)
signal.signal(signal.SIGTERM, shutdown)


def open_browser():
    time.sleep(1)
    global chrome_proc
    try:
        import subprocess
        chrome_proc = subprocess.Popen(
            [
                'chrome',
                '--app=http://localhost:5550/index.html'
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0)
        )
    except Exception:
        os.system('start chrome --app="http://localhost:5550/index.html"')


def start_jarvis_system():
    """Safely initializes the browser thread and starts the Eel server."""
    threading.Thread(target=open_browser, daemon=True).start()

    try:
        ok = _try_start_eel()
        return ok
    except (SystemExit, KeyboardInterrupt):
        shutdown()
        return False