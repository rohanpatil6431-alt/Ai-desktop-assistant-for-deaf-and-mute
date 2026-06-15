# AI Desktop Assistant for Deaf and Mute People

A Python-based desktop assistant that combines voice-controlled automation with real-time American Sign Language (ASL) hand-gesture recognition, enabling deaf and mute users to interact with a computer through sign language and receive text/voice feedback. Built as a final year group project, extending research published in IRJMETS (Vol. 08, Issue 05, May 2026, DOI: 10.56726/IRJMETS97303) on AI-based gesture recognition for accessibility communication.

## Features

- **Face-recognition login** using OpenCV Haarcascade detection + LBPH recognizer, trained on custom webcam samples
- **Real-time ASL hand-gesture recognition** that translates hand signs into text and voice commands
- **Voice assistant pipeline**: speech-to-text input, command parsing, and text-to-speech responses
- **Task automation**: opening applications, web searches, WhatsApp messaging, and system-level controls
- **Local data persistence** via SQLite for user profiles and contacts
- **Cross-platform desktop GUI** built with Eel, combining a Python backend with an HTML/CSS/JS frontend

## Tech Stack

**Backend**
- Python
- Eel (Python ↔ web frontend bridge for desktop apps)
- SQLite3

**Computer Vision / ML**
- OpenCV (Haarcascade face detection, LBPH face recognizer)
- TensorFlow.js + Handpose (hand landmark detection)
- Fingerpose (gesture classification from landmarks)

**Voice & Automation**
- pyttsx3 (text-to-speech)
- SpeechRecognition (speech-to-text)
- PyAutoGUI & keyboard (system automation)
- PyWhatKit (WhatsApp messaging, web automation)

**Frontend**
- HTML, CSS, JavaScript

## What I Learned

- Implementing face-recognition authentication end-to-end: capturing training samples, training an LBPH model with OpenCV, and verifying users in real time
- Detecting and classifying hand gestures in the browser using TensorFlow.js Handpose landmarks mapped to ASL signs via Fingerpose
- Bridging a Python backend with a JS/HTML frontend using Eel to build a desktop application without a heavy web framework
- Designing a voice assistant pipeline: speech-to-text → command parsing → action execution → text-to-speech feedback
- Structuring a modular codebase by separating concerns (auth, commands, config, database, features, helpers)
- Using SQLite for lightweight local storage of user data and contacts
- Translating an accessibility research paper into a functioning application, and documenting the implementation for IRJMETS publication

## Project Structure

```
├── engine/
│   ├── auth/          # Face recognition login (Haarcascade, training, recognition)
│   ├── command.py     # Command parsing and execution
│   ├── config.py       # App configuration
│   ├── db.py            # SQLite database handling
│   ├── features.py     # Assistant features/skills
│   └── helper.py        # Utility functions
├── www/
│   ├── aslFingerposeGestures.js   # ASL gesture definitions
│   ├── handSign.js                # Hand sign detection logic
│   ├── controller.js              # Frontend controller
│   ├── main.js, index.html, style.css
│   └── models/asl/                # Handpose/Fingerpose model
├── jarvis.db          # SQLite database
├── contacts.csv       # Contact data
├── main.py / run.py   # App entry points
└── TODO.md
```

## Getting Started

```bash
# Clone the repository
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run the application
python run.py
```

On first run, use `engine/auth/sample.py` to capture face samples and `trainer.py` to train the face-recognition model before logging in.

## Research Paper

This project builds on:
> *AI-Based Desktop Assistant Using Hand Gesture Recognition for Accessibility Communication*, IRJMETS, Vol. 08, Issue 05, May 2026. DOI: [10.56726/IRJMETS97303](https://doi.org/10.56726/IRJMETS97303)

## Future Scope

- Expand ASL gesture vocabulary beyond basic commands
- Add support for regional sign languages
- Improve face-recognition robustness under varying lighting conditions
- Package as a standalone executable for easier distribution

## License

This project is for academic purposes as part of a final year curriculum requirement.
