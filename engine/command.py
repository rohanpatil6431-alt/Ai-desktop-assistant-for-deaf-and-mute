import pyttsx3
import speech_recognition as sr
import eel
import time


def speak(text):
    text = str(text)

    engine = pyttsx3.init('sapi5')
    voices = engine.getProperty('voices')

    engine.setProperty('voice', voices[0].id)
    engine.setProperty('rate', 174)

    eel.DisplayMessage(text)
    engine.say(text)
    eel.receiverText(text)

    engine.runAndWait()


def takecommand():

    r = sr.Recognizer()

    with sr.Microphone() as source:
        print('listening....')
        eel.DisplayMessage('listening....')

        r.pause_threshold = 1
        r.adjust_for_ambient_noise(source)

        audio = r.listen(source, 10, 6)

    try:
        print('recognizing')
        eel.DisplayMessage('recognizing....')

        query = r.recognize_google(audio, language='en-in')

        print(f"user said: {query}")
        eel.DisplayMessage(query)

        time.sleep(2)

    except Exception:
        return ""

    return query.lower()


@eel.expose
def process_text_command(message):
    allCommands(message)


@eel.expose
def allCommands(message=1):

    if message == 1:
        query = takecommand() or ""
    else:
        query = str(message) if message is not None else ""

    query = query.lower()

    # =========================
    # SHUTDOWN COMMAND
    # =========================
    if "you can sleep" in query:
        # Stop SiriWave animation immediately to avoid “stuck” UI.
        try:
            eel.stopSiriWave()()
        except Exception:
            pass

        speak("Okay, shutting down.")

        # Close the UI (best-effort) then stop the backend.
        try:
            eel.closeJarvis()()
        except Exception:
            pass

        import os
        try:
            os.system('taskkill /F /T /IM python.exe >nul 2>&1')
        except Exception:
            pass
        try:
            os.system('taskkill /F /T /IM chrome.exe >nul 2>&1')
        except Exception:
            pass

        try:
            eel.expose(lambda: None)  # no-op to ensure eel context exists
        except Exception:
            pass

        # Final hard stop of the process tree.
        os.kill(os.getpid(), 9)












    # =========================
    # SEND USER TEXT TO UI

    # =========================
    try:
        eel.senderText(query)
    except:
        pass

    # =========================
    # COMMAND PROCESSING
    # =========================
    try:

        if "open" in query and "google" in query:
            from engine.features import OpenGoogle
            OpenGoogle(query)

        elif "open" in query:
            from engine.features import openCommand
            openCommand(query)

        elif ("youtube" in query and "play" in query) or "on youtube" in query:
            from engine.features import PlayYoutube
            PlayYoutube(query)

        elif (
            "send message" in query
            or "phone call" in query
            or "video call" in query
        ):

            from engine.features import (
                findContact,
                whatsApp,
                makeCall,
                sendMessage,
            )

            contact_no, name = findContact(query)

            if contact_no != 0:

                speak("Which mode you want to use whatsapp or mobile")

                preferance = takecommand()
                print(preferance)

                if "mobile" in preferance:

                    if (
                        "send message" in query
                        or "send sms" in query
                    ):
                        speak("What message to send")
                        message = takecommand()
                        sendMessage(
                            message,
                            contact_no,
                            name
                        )

                    elif "phone call" in query:
                        makeCall(name, contact_no)

                    else:
                        speak("Please try again")

                elif "whatsapp" in preferance:

                    message_type = ""

                    if "send message" in query:
                        message_type = "message"

                        speak("What message to send")
                        query = takecommand()

                    elif "phone call" in query:
                        message_type = "call"

                    else:
                        message_type = "video call"

                    whatsApp(
                        contact_no,
                        query,
                        message_type,
                        name
                    )

        else:
            from engine.features import geminai
            geminai(query)

    except Exception as e:
        print("Error:", e)

    try:
        eel.ShowHood()
    except:
        pass