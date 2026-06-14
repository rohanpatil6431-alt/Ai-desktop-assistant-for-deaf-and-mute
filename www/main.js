$(document).ready(function () {

    eel.init()()

    $('.text').textillate({
        loop: true,
        in: {
            effect: 'bounceIn',
            delayScale: 1.2,
            delay: 50,
            sync: false
        },
        out: {
            effect: 'bounceOut',
            delayScale: 1.2,
            delay: 50,
            sync: true
        }
    });

    function createSiriWave() {
        var container = document.getElementById("siri-container");
        if (!container || typeof SiriWave === "undefined") {
            return;
        }
        container.innerHTML = "";
        var width = Math.min(880, Math.max(320, window.innerWidth - 120));
        window.siriWave = new SiriWave({
            container: container,
            width: width,
            height: 220,
            style: "ios9",
            amplitude: 1.55,
            speed: 0.17,
            autostart: true,
            cover: true,
            globalCompositeOperation: "lighter",
            curveDefinition: [
                { color: "0, 200, 255", supportLine: true },
                { color: "0, 130, 255" },
                { color: "70, 170, 255" },
                { color: "0, 220, 255" }
            ]
        });
    }

    function ensureSiriWave() {
        if (window.siriWave && typeof window.siriWave.dispose === "function") {
            try {
                window.siriWave.dispose();
            } catch (e) {}
        }
        createSiriWave();
    }

    window.ensureSiriWave = ensureSiriWave;
    createSiriWave();

    $(window).on("resize", function () {
        if (!$("#SiriWave").attr("hidden")) {
            ensureSiriWave();
        }
    });


    // Siri message animation
    $('.siri-message').textillate({
        loop: true,
        sync: true,
        in: {
            effect: "fadeInUp",
            sync: true,
        },
        out: {
            effect: "fadeOutUp",
            sync: true,
        },
    });

    // 🎤 Mic button handler
    $("#MicBtn").click(function () {
        eel.playAssistantSound()
        $("#Oval").attr("hidden", true);
        ensureSiriWave();
        if (window.siriWave && typeof window.siriWave.start === "function") {
            window.siriWave.start();
        }
        $("#SiriWave").attr("hidden", false);
        $("#app-card").attr("hidden", true);

        // mic mode (no args)
        eel.allCommands()()
    });

      // 🎤 Mic button handler
    $("#SettingBtn").click(function () {
        eel.playAssistantSound()
        $("#Oval").attr("hidden", true);
        $("#SiriWave").attr("hidden", true);
        $("#app-card").attr("hidden", false);
    });

      // 🎤 Mic button handler
    $("#backBtn").click(function () {
        eel.playAssistantSound()
        $("#Oval").attr("hidden", false);
        $("#SiriWave").attr("hidden", true);
        $("#app-card").attr("hidden", true);
    });



  

    // ⌨️ Typed input
    function PlayAssistant(message) {
        if (message.trim() !== "") {
            $("#Oval").attr("hidden", true);
            ensureSiriWave();
            if (window.siriWave && typeof window.siriWave.start === "function") {
                window.siriWave.start();
            }
            $("#SiriWave").attr("hidden", false);
            $("#app-card").attr("hidden", true);

            // send typed command to python
            eel.process_text_command(message);

            $("#chatbox").val("")
            $("#userInput").val("")
            $("#MicBtn").attr('hidden', false);
            $("#SendBtn").attr('hidden', true);
            $("#sendBtn").hide();
        }
    }

    // toggle mic/send button
    function ShowHideButton(message) {
        if (message.length == 0) {
            $("#MicBtn").attr('hidden', false);
            $("#SendBtn").attr('hidden', true);
        }
        else {
            $("#MicBtn").attr('hidden', true);
            $("#SendBtn").attr('hidden', false);
        }
    }

    // key up event handler on chat box
    $("#chatbox").keyup(function () {
        let message = $("#chatbox").val();
        ShowHideButton(message)
    });

    // send button event handler
    $("#SendBtn").click(function () {
        let message = $("#chatbox").val()
        PlayAssistant(message)
    });

    // enter press event handler on chat box
    $("#chatbox").keypress(function (e) {
        if (e.which === 13) {
            e.preventDefault(); // prevent newline
            let message = $("#chatbox").val()
            PlayAssistant(message)
        }
    });

    // NEW: key up event handler on app-card userInput
    $("#userInput").keyup(function () {
        let message = $("#userInput").val();
        if (message.length == 0) {
            $("#sendBtn").hide();
        } else {
            $("#sendBtn").show();
        }
    });

    // NEW: send button event handler for app-card
    $("#sendBtn").click(function () {
        let message = $("#userInput").val();
        if (message.trim() !== "") {
            PlayAssistant(message);
            $("#userInput").val("");
            $("#sendBtn").hide();
        }
    });

    // NEW: enter press event handler on app-card userInput
    $("#userInput").keypress(function (e) {
        if (e.which === 13) {
            e.preventDefault();
            let message = $("#userInput").val();
            if (message.trim() !== "") {
                PlayAssistant(message);
                $("#userInput").val("");
                $("#sendBtn").hide();
            }
        }
    });
    // Expose a stop function to Python so shutdown doesn't leave SiriWave running.
    eel.expose(stopSiriWave);
    function stopSiriWave() {
        try {
            if (window.siriWave && typeof window.siriWave.stop === 'function') {
                window.siriWave.stop();
            }
        } catch (e) {}

        try {
            $("#SiriWave").attr("hidden", true);
        } catch (e) {}

        try {
            $("#Oval").attr("hidden", true);
        } catch (e) {}
    }


    eel.expose(close_window);
    function close_window() {
        window.close(); // closes the browser window
    }

    // Hand Sign Overlay
const overlay = document.getElementById('handSignOverlay');
overlay.style.display = 'none';

document.getElementById('handSignBtn').addEventListener('click', () => {
    overlay.style.display = 'flex';
});

document.getElementById('handSignCloseBtn').addEventListener('click', () => {
    overlay.style.display = 'none';
});

overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
        overlay.style.display = 'none';
    }
});

});

