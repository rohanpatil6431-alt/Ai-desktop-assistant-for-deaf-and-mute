import os
import re
import time

def extract_yt_term(command):
    """Extract the search term for YouTube from a voice command.

    Supported phrases:
      - "play <term> on youtube"
      - "play <term> youtube"
      - "play <term> on youtube please" (extra trailing words allowed)

    Returns a cleaned string. If nothing can be extracted, returns "".
    """
    if not command:
        return ""

    cmd = command.strip()

    # Try: play <term> on youtube
    m = re.search(r"\bplay\s+(.+?)\s+on\s+youtube\b", cmd, flags=re.IGNORECASE)
    if m:
        term = m.group(1)
        return term.strip().strip('"\'')

    # Try: play <term> youtube (without 'on')
    m = re.search(r"\bplay\s+(.+?)\s+youtube\b", cmd, flags=re.IGNORECASE)
    if m:
        term = m.group(1)
        return term.strip().strip('"\'')

    return ""


def remove_words(input_string, words_to_remove):
    # Split the input string into words
    words = input_string.split()

    # Remove unwanted words
    filtered_words = [word for word in words if word.lower() not in words_to_remove]

    # Join the remaining words back into a string
    result_string = ' '.join(filtered_words)

    return result_string

# key events like receive call, stop call, go back
def keyEvent(key_code):
    command =  f'adb shell input keyevent {key_code}'
    os.system(command)
    time.sleep(1)

# Tap event used to tap anywhere on screen
def tapEvents(x, y):
    command =  f'adb shell input tap {x} {y}'
    os.system(command)
    time.sleep(1)

# Input Event is used to insert text in mobile
def adbInput(message):
    command =  f'adb shell input text "{message}"'
    os.system(command)
    time.sleep(1)

# to go complete back
def goback(key_code):
    for i in range(6):
        keyEvent(key_code)

# To replace space in string with %s for complete message send
def replace_spaces_with_percent_s(input_string):
    return input_string.replace(' ', '%s')

def markdown_to_text(md):
    '''Simple markdown to plain text converter.'''
    # Remove markdown symbols
    lines = md.split('\n')
    text = []
    for line in lines:
        # Remove # headings
        line = re.sub(r'^# +', '', line)
        # Remove * bold/italic
        line = line.replace('*', '').replace('**', '').replace('__', '')
        # Remove ` code
        line = line.replace('`', '')
        text.append(line.strip())
    return ' '.join(text).strip()
