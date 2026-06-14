import json
import os
from urllib.parse import quote
import re
import sqlite3
import struct
import subprocess
import time
import webbrowser
import eel
import pyaudio
import pyautogui
import pywhatkit as kit
import pvporcupine
from engine.command import speak
from engine.config import ASSISTANT_NAME, LLM_KEY
from engine.helper import extract_yt_term, markdown_to_text, remove_words
from hugchat import hugchat
from google import genai

con = sqlite3.connect("jarvis.db")
cursor = con.cursor()

@eel.expose
def playAssistantSound():
    # ─── FIXED PATH LOGIC ──────────────────────────────────────────────────
    # This finds the exact project root folder dynamically, preventing the beep bug
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    music_dir = os.path.join(base_dir, "www", "assets", "audio", "start_sound.mp3")
    
    # Diagnostic check: prints directly to your terminal if the file is physically missing
    if not os.path.exists(music_dir):
        print(f"\n⚠️ AUDIO FILE NOT FOUND AT: {music_dir}")
        print("Please check if your file is named 'start_sound.mp3' or if it is inside the right folder!\n")
    # ───────────────────────────────────────────────────────────────────────

    try:
        from playsound import playsound
        playsound(music_dir)
        print("Played startup sound (playsound)")
    except:
        try:
            import pygame
            pygame.mixer.init()
            pygame.mixer.music.load(music_dir)
            pygame.mixer.music.play()
            import time
            while pygame.mixer.music.get_busy():
                time.sleep(0.1)
            pygame.mixer.quit() 
            print("Played startup sound (pygame)")
        except Exception as e2:
            print(f"Playback failed: {e2}, minimal fallback triggering system beep.")
            import winsound
            winsound.Beep(800, 300)

def openCommand(query):
    import re
    query = query.replace(ASSISTANT_NAME, "").replace("open", "")
    query = re.sub(r'\b(the|a|an)\b\s*', '', query, flags=re.IGNORECASE)
    app_name = re.sub(r'\s+', ' ', query).strip().lower()

    if not app_name:
        return

    common_apps = {
        'notepad': 'notepad.exe',
        'calculator': 'calc.exe',
        'cmd': 'cmd.exe',
        'command prompt': 'cmd.exe',
        'paint': 'mspaint.exe',
        'chrome': 'chrome.exe',
        'edge': 'msedge.exe',
    }

    # 1) Keep the original behavior for built-ins
    if app_name in common_apps:
        try:
            speak("Opening " + app_name)
            os.startfile(common_apps[app_name])
            return
        except:
            pass

    # 2) Check sys_command first, then web_command
    try:
        cursor.execute(
            'SELECT path FROM sys_command WHERE LOWER(name) LIKE ? LIMIT 1',
            (f'%{app_name}%',),
        )
        row = cursor.fetchone()
        if row:
            speak("Opening " + app_name)
            os.startfile(row[0])
            return

        cursor.execute(
            'SELECT url FROM web_command WHERE LOWER(name) LIKE ? LIMIT 1',
            (f'%{app_name}%',),
        )
        row = cursor.fetchone()
        if row:
            speak("Opening " + app_name)
            webbrowser.open(row[0])
            return

        # 3) Fallback: keep original open behavior
        speak("Opening " + app_name)
        os.system('start ' + app_name)
    except:
        speak("App not found")


def PlayYoutube(query):
    search_term = extract_yt_term(query)
    if not search_term:
        speak("Sorry, I couldn't understand what to play on YouTube")
        return
    speak("Playing " + search_term + " on YouTube")
    kit.playonyt(search_term)


def OpenGoogle(query):
    if not query:
        return

    q = str(query).lower().strip()
    q = q.replace(ASSISTANT_NAME, "")

    term = ""
    m = re.search(r"\bopen\s+(.+?)\s+on\s+google\b", q, flags=re.IGNORECASE)
    if m:
        term = m.group(1).strip()
    else:
        m = re.search(r"\bopen\s+(.+?)\s+google\b", q, flags=re.IGNORECASE)
        if m:
            term = m.group(1).strip()
        else:
            m = re.search(r"\bopen\s+(.+)$", q, flags=re.IGNORECASE)
            term = m.group(1).strip() if m else ""

    if not term:
        speak("Sorry, I couldn't understand what to search on Google")
        return

    speak("Searching " + term + " on Google")
    url = "https://www.google.com/search?q=" + quote(term)
    webbrowser.open(url)
    time.sleep(5)

    try:
        screen_w, screen_h = pyautogui.size()
        x = int(screen_w * (320 / 1920))
        y = int(screen_h * (420 / 1080))
        pyautogui.moveTo(x, y, duration=0.3)
        pyautogui.click()
    except Exception:
        try:
            pyautogui.press('tab', presses=10, interval=0.03)
            time.sleep(0.2)
            pyautogui.press('enter')
        except Exception:
            pass


def hotword():
    porcupine = None
    pa = None
    audio_stream = None
    try:
        porcupine = None  
        pa = pyaudio.PyAudio()
        audio_stream = pa.open(rate=16000, channels=1, format=pyaudio.paInt16, input=True, frames_per_buffer=512)
        
        while True:
            keyword = audio_stream.read(porcupine.frame_length if porcupine else 512)
            keyword = struct.unpack_from("h" * (porcupine.frame_length if porcupine else 512), keyword)
            keyword_index = pvporcupine.process(porcupine, keyword) if porcupine else -1

            if keyword_index >= 0:
                print("hotword detected")
                pyautogui.keyDown("win")
                pyautogui.press("j")
                time.sleep(2)
                pyautogui.keyUp("win")
                
    except Exception as e:
        print(f"Hotword error: {e}")
    finally:
        if audio_stream is not None:
            audio_stream.close()
        if pa is not None:
            pa.terminate()
        if porcupine is not None:
            porcupine.delete()


def findContact(query):
    words_to_remove = [ASSISTANT_NAME, 'make', 'a', 'to', 'phone', 'call', 'send', 'message', 'wahtsapp', 'video']
    query = remove_words(query, words_to_remove)

    try:
        query = query.strip().lower()
        cursor.execute("SELECT mobile_no FROM contacts WHERE LOWER(name) LIKE ? OR LOWER(name) LIKE ?", ('%' + query + '%', query + '%'))
        results = cursor.fetchall()
        print(results[0][0])
        mobile_number_str = str(results[0][0])

        if not mobile_number_str.startswith('+91'):
            mobile_number_str = '+91' + mobile_number_str

        return mobile_number_str, query
    except:
        speak('not exist in contacts')
        return 0, 0
    
def whatsApp(mobile_no, message, flag, name):
    # Coordinate for WhatsApp "Send" button (desktop UI). Update if your UI scale changes.
    SEND_X = 1856
    SEND_Y = 979

    # Coordinate for WhatsApp call buttons.
    # Updated with verified coordinates.
    PHONE_CALL_X = 1718
    PHONE_CALL_Y = 87
    VIDEO_CALL_X = 1645
    VIDEO_CALL_Y = 87


    if flag == 'message':
        jarvis_message = "message send successfully to " + name
    elif flag == 'call':
        message = ''
        jarvis_message = "calling to " + name
    else:
        message = ''
        jarvis_message = "staring video call with " + name


    # Open chat + preload text (if message)
    encoded_message = quote(message) if message else ''
    whatsapp_url = f"whatsapp://send?phone={mobile_no}&text={encoded_message}" if message else f"whatsapp://send?phone={mobile_no}"
    full_command = f'start "" "{whatsapp_url}"'

    subprocess.run(full_command, shell=True)
    time.sleep(6)

    # Send / confirm
    if flag == 'message':
        # Small nudge to ensure cursor focus on WhatsApp window
        try:
            pyautogui.click(SEND_X, SEND_Y, clicks=1, interval=0.1)
        except Exception:
            # Fallback to Enter if click fails
            pyautogui.hotkey('enter')
        time.sleep(1)
    elif flag == 'call':
        # Click phone call button in the WhatsApp UI
        try:
            pyautogui.click(PHONE_CALL_X, PHONE_CALL_Y, clicks=1, interval=0.1)
        except Exception:
            pyautogui.hotkey('enter')
        time.sleep(1)
    else:
        # Click video call button in the WhatsApp UI
        try:
            pyautogui.click(VIDEO_CALL_X, VIDEO_CALL_Y, clicks=1, interval=0.1)
        except Exception:
            pyautogui.hotkey('enter')
        time.sleep(1)


    speak(jarvis_message)



def chatBot(query):
    user_input = query.lower()
    chatbot = hugchat.ChatBot(cookie_path="engine\\cookies.json")
    id = chatbot.new_conversation()
    chatbot.change_conversation(id)
    response =  chatbot.chat(user_input)
    print(response)
    speak(response)
    return response


def makeCall(name, mobileNo):
    mobileNo = mobileNo.replace(" ", "")
    speak("Calling "+name)
    command = 'adb shell am start -a android.intent.action.CALL -d tel:'+mobileNo
    os.system(command)


def sendMessage(message, mobileNo, name):
    from engine.helper import replace_spaces_with_percent_s, goback, keyEvent, tapEvents, adbInput
    message = replace_spaces_with_percent_s(message)
    mobileNo = replace_spaces_with_percent_s(mobileNo)
    speak("sending message")
    goback(4)
    time.sleep(1)
    keyEvent(3)
    tapEvents(136, 2220)
    tapEvents(819, 2192)
    adbInput(mobileNo)
    tapEvents(601, 574)
    tapEvents(390, 2270)
    adbInput(message)
    tapEvents(957, 1397)
    speak("message send successfully to "+name)


def gemini(query):
    try:
        query = query.replace(ASSISTANT_NAME, "")
        query = query.replace("search", "")
        
        client = genai.Client(api_key=LLM_KEY)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=query
        )
        
        filter_text = markdown_to_text(response.text)
        speak(filter_text)
    except Exception as e:
        print("Error:", e)


@eel.expose
def assistantName():
    name = ASSISTANT_NAME
    return name

@eel.expose
def personalInfo():
    try:
        cursor.execute("SELECT * FROM info")
        results = cursor.fetchall()
        jsonArr = json.dumps(results[0])
        eel.getData(jsonArr)
        return 1    
    except:
        print("no data")

@eel.expose
def updatePersonalInfo(name, designation, mobileno, email, city):
    cursor.execute("SELECT COUNT(*) FROM info")
    count = cursor.fetchone()[0]

    if count > 0:
        cursor.execute(
            '''UPDATE info 
               SET name=?, designation=?, mobileno=?, email=?, city=?''',
            (name, designation, mobileno, email, city)
        )
    else:
        cursor.execute(
            '''INSERT INTO info (name, designation, mobileno, email, city) 
               VALUES (?, ?, ?, ?, ?)''',
            (name, designation, mobileno, email, city)
        )

    con.commit()
    personalInfo()
    return 1

@eel.expose
def displaySysCommand():
    cursor.execute("SELECT * FROM sys_command")
    results = cursor.fetchall()
    jsonArr = json.dumps(results)
    eel.displaySysCommand(jsonArr)
    return 1

@eel.expose
def deleteSysCommand(id):
    cursor.execute("DELETE FROM sys_command WHERE id = ?", (id,))
    con.commit()

@eel.expose
def addSysCommand(key, value):
    cursor.execute(
        '''INSERT INTO sys_command VALUES (?, ?, ?)''', (None,key, value))
    con.commit()

@eel.expose
def displayWebCommand():
    cursor.execute("SELECT * FROM web_command")
    results = cursor.fetchall()
    jsonArr = json.dumps(results)
    eel.displayWebCommand(jsonArr)
    return 1

@eel.expose
def addWebCommand(key, value):
    cursor.execute(
        '''INSERT INTO web_command VALUES (?, ?, ?)''', (None, key, value))
    con.commit()

@eel.expose
def deleteWebCommand(id):
    cursor.execute("DELETE FROM web_command WHERE Id = ?", (id,))
    con.commit()

@eel.expose
def displayPhoneBookCommand():
    cursor.execute("SELECT * FROM contacts")
    results = cursor.fetchall()
    jsonArr = json.dumps(results)
    eel.displayPhoneBookCommand(jsonArr)
    return 1

@eel.expose
def deletePhoneBookCommand(id):
    cursor.execute("DELETE FROM contacts WHERE Id = ?", (id,))
    con.commit()

@eel.expose
def InsertContacts(Name, MobileNo, Email, City):
    cursor.execute(
        '''INSERT INTO contacts VALUES (?, ?, ?, ?, ?)''', (None,Name, MobileNo, Email, City))
    con.commit()