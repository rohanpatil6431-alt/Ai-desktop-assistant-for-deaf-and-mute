(() => {
  // No local model files needed.
  // We use TFJS Handpose (auto-downloads) + Fingerpose gestures A-Z.

  const els = {
    openBtn: document.getElementById("handSignBtn"),
    overlay: document.getElementById("handSignOverlay"),
    closeBtn: document.getElementById("handSignCloseBtn"),
    startBtn: document.getElementById("handSignStartBtn"),
    stopBtn: document.getElementById("handSignStopBtn"),
    clearBtn: document.getElementById("handSignClearBtn"),
    status: document.getElementById("handSignStatus"),
    detected: document.getElementById("handSignDetected"),
    video: document.getElementById("handSignVideo"),
    canvas: document.getElementById("handSignCanvas"),
    userInput: document.getElementById("userInput"),
  };

  const ctx = els.canvas.getContext("2d");

  let stream = null;
  let net = null;
  let isRunning = false;
  let rafId = null;
  let gestureEstimator = null;

  // Debounce so we don't spam the input with the same letter
  let lastCommitted = { value: "", at: 0 };
  let stable = { value: "", count: 0 };

  function setStatus(text) {
    els.status.textContent = text;
  }

  function setDetected(text) {
    els.detected.textContent = text;
  }

  function showOverlay() {
    els.overlay.hidden = false;
  }

  function hideOverlay() {
    els.overlay.hidden = true;
  }

  function appendToInput(text) {
    if (!els.userInput) return;
    els.userInput.value = (els.userInput.value || "") + text;
    els.userInput.focus();
  }

  function clearInput() {
    if (!els.userInput) return;
    els.userInput.value = "";
    els.userInput.focus();
  }

  function resizeCanvasToVideo() {
    const w = els.video.videoWidth || 1280;
    const h = els.video.videoHeight || 720;
    if (els.canvas.width !== w) els.canvas.width = w;
    if (els.canvas.height !== h) els.canvas.height = h;
  }

  function drawLandmarks(landmarks) {
    // landmarks: array of [x,y,z] in pixel coordinates
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#7b8cff";
    ctx.lineWidth = 2;

    // Basic connections
    const chains = [
      [0, 1, 2, 3, 4],
      [0, 5, 6, 7, 8],
      [0, 9, 10, 11, 12],
      [0, 13, 14, 15, 16],
      [0, 17, 18, 19, 20],
    ];
    for (const chain of chains) {
      ctx.beginPath();
      for (let i = 0; i < chain.length; i++) {
        const [x, y] = landmarks[chain[i]];
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    for (const [x, y] of landmarks) {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function commitIfStable(value) {
    const now = Date.now();
    if (value !== stable.value) {
      stable.value = value;
      stable.count = 1;
      return;
    }

    stable.count += 1;

    // Require ~10 consistent frames, plus cooldown between commits
    const stableEnough = stable.count >= 10;
    const cooldownOk = now - lastCommitted.at > 650;
    const notSameAsLast = value && value !== lastCommitted.value;

    if (stableEnough && cooldownOk && notSameAsLast) {
      lastCommitted = { value, at: now };
      appendToInput(value);
    }
  }

  function classifyFingerpose(handposeLandmarks) {
    if (!gestureEstimator) return null;
    const estimation = gestureEstimator.estimate(handposeLandmarks, 6.5);
    const gs = estimation.gestures || [];
    if (!gs.length) return null;

    // Pick best score
    let best = gs[0];
    for (let i = 1; i < gs.length; i++) {
      if (gs[i].score > best.score) best = gs[i];
    }
    return best.name || null;
  }

  async function loop() {
    if (!isRunning) return;
    resizeCanvasToVideo();

    ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);
    ctx.drawImage(els.video, 0, 0, els.canvas.width, els.canvas.height);

    try {
      const hands = await net.estimateHands(els.video, true);
      const hand = hands?.[0];
      if (hand?.landmarks?.length) {
        // hand.landmarks are in pixels: [x,y,z]
        drawLandmarks(hand.landmarks);

        const letter = classifyFingerpose(hand.landmarks);
        if (letter) {
          setDetected(letter);
          if (/^[A-Z]$/.test(letter)) commitIfStable(letter);
        } else {
          setDetected("-");
        }
      } else {
        setDetected("-");
      }
    } catch (e) {
      console.warn(e);
      setDetected("-");
    }

    rafId = requestAnimationFrame(loop);
  }

  async function start() {
    if (isRunning) return;
    showOverlay();
    setStatus("Requesting camera…");
    setDetected("-");

    if (!window.tf || !window.handpose) throw new Error("TFJS/handpose not loaded");
    if (!window.fp) throw new Error("fingerpose not loaded");

    if (!gestureEstimator) {
      const gestures = window.ASL_FINGERPOSE_GESTURES || [];
      gestureEstimator = new window.fp.GestureEstimator(gestures);
    }
    if (!net) {
      setStatus("Loading handpose model…");
      net = await window.handpose.load();
    }

    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    els.video.srcObject = stream;

    await els.video.play();
    resizeCanvasToVideo();

    isRunning = true;
    stable = { value: "", count: 0 };
    lastCommitted = { value: "", at: 0 };

    els.startBtn.disabled = true;
    els.stopBtn.disabled = false;
    setStatus("Running (A–Z via fingerpose)");
    rafId = requestAnimationFrame(loop);
  }

  async function stop() {
    isRunning = false;
    els.startBtn.disabled = false;
    els.stopBtn.disabled = true;
    setStatus("Stopped");
    setDetected("-");

    try {
      if (rafId) cancelAnimationFrame(rafId);
    } catch (_) {}
    rafId = null;

    try {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    } catch (_) {}
    stream = null;

    try {
      els.video.pause();
      els.video.srcObject = null;
    } catch (_) {}

    ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);
  }

  function init() {
    if (!els.openBtn || !els.overlay) return;

    els.openBtn.addEventListener("click", () => {
      showOverlay();
    });

    els.closeBtn?.addEventListener("click", async () => {
      await stop();
      hideOverlay();
    });

    els.startBtn?.addEventListener("click", () => void start());
    els.stopBtn?.addEventListener("click", () => void stop());
    els.clearBtn?.addEventListener("click", () => clearInput());

    // Close overlay on ESC
    window.addEventListener("keydown", async (e) => {
      if (e.key !== "Escape") return;
      if (els.overlay.hidden) return;
      await stop();
      hideOverlay();
    });
  }

  init();
})();

