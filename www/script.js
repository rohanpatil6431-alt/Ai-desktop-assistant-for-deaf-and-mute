window.addEventListener("load", windowLoadHandler, false);
var sphereRad = 155;
var radius_sp = 1;
//for debug messages
var Debugger = function () { };
Debugger.log = function (message) {
	try {
		console.log(message);
	}
	catch (exception) {
		return;
	}
}

function windowLoadHandler() {
	requestAnimationFrame(function () {
		canvasApp();
	});
}

function canvasSupport() {
	return Modernizr.canvas;
}

function canvasApp() {
	if (!canvasSupport()) {
		return;
	}

	var theCanvas = document.getElementById("canvasOne");
	var context = theCanvas.getContext("2d");

	var displayWidth;
	var displayHeight;
	var timer;
	var wait;
	var count;
	var numToAddEachFrame;
	var particleList;
	var recycleBin;
	var particleAlpha;
	var r, g, b;
	var fLen;
	var m;
	var projCenterX;
	var projCenterY;
	var zMax;
	var turnAngle;
	var turnSpeed;
	var sphereCenterX, sphereCenterY, sphereCenterZ;
	var particleRad;
	var zeroAlphaDepth;
	var randAccelX, randAccelY, randAccelZ;
	var gravity;
	var rgbString;
	//we are defining a lot of variables used in the screen update functions globally so that they don't have to be redefined every frame.
	var p;
	var outsideTest;
	var nextParticle;
	var sinAngle;
	var cosAngle;
	var rotX, rotZ;
	var depthAlphaFactor;
	var i;
	var theta, phi;
	var x0, y0, z0;

	init();

	function syncCanvasSize() {
		var rect = theCanvas.getBoundingClientRect();
		var size = Math.min(rect.width, rect.height);
		if (size < 1) {
			size = 500;
		}
		var dpr = window.devicePixelRatio || 1;
		theCanvas.width = Math.round(size * dpr);
		theCanvas.height = Math.round(size * dpr);
		context.setTransform(dpr, 0, 0, dpr, 0, 0);
		displayWidth = size;
		displayHeight = size;
		projCenterX = displayWidth / 2;
		projCenterY = displayHeight / 2;
		fLen = size * 0.72;
		zMax = fLen - 2;
		sphereRad = size * 0.31;
		sphereCenterZ = -3 - sphereRad;
		zeroAlphaDepth = -(size * 1.5);
	}

	// eel.expose(init)
	function init() {
		wait = 1;
		count = wait - 1;
		numToAddEachFrame = 8;

		r = 30;
		g = 170;
		b = 255;

		rgbString = "rgba(" + r + "," + g + "," + b + ",";
		particleAlpha = 0.68;

		syncCanvasSize();

		particleList = {};
		recycleBin = {};

		//random acceleration factors - causes some random motion
		randAccelX = 0.04;
		randAccelY = 0.04;
		randAccelZ = 0.04;

		gravity = -0; //try changing to a positive number (not too large, for example 0.3), or negative for floating upwards.

		particleRad = 1.2;

		sphereCenterX = 0;
		sphereCenterY = 0;

		turnSpeed = 2 * Math.PI / 1400;
		turnAngle = 0; //initial angle

		window.addEventListener("resize", syncCanvasSize);
		timer = setInterval(onTimer, 10 / 24);
	}

	function drawOrbBackdrop() {
		var cx = projCenterX;
		var cy = projCenterY;
		var edge = displayWidth * 0.52;
		var bg = context.createRadialGradient(cx, cy, 0, cx, cy, edge);
		bg.addColorStop(0, "rgba(10, 40, 90, 0.9)");
		bg.addColorStop(0.5, "rgba(6, 28, 65, 0.88)");
		bg.addColorStop(0.82, "rgba(5, 22, 55, 0.85)");
		bg.addColorStop(1, "rgba(8, 30, 70, 0.82)");
		context.fillStyle = bg;
		context.fillRect(0, 0, displayWidth, displayHeight);

		var shell = sphereRad * (fLen / (fLen - sphereCenterZ));
		var aura = context.createRadialGradient(cx, cy, shell * 0.35, cx, cy, shell * 1.15);
		aura.addColorStop(0, "rgba(0, 200, 255, 0)");
		aura.addColorStop(0.55, "rgba(0, 160, 255, 0.1)");
		aura.addColorStop(0.82, "rgba(0, 120, 255, 0.16)");
		aura.addColorStop(1, "rgba(0, 80, 220, 0)");
		context.fillStyle = aura;
		context.beginPath();
		context.arc(cx, cy, shell * 1.15, 0, 2 * Math.PI, false);
		context.closePath();
		context.fill();

		var coreR = displayWidth * 0.18;
		var core = context.createRadialGradient(cx, cy, 0, cx, cy, coreR * 1.8);
		core.addColorStop(0, "rgba(0, 180, 255, 0.38)");
		core.addColorStop(0.45, "rgba(0, 120, 220, 0.16)");
		core.addColorStop(1, "rgba(0, 0, 0, 0)");
		context.fillStyle = core;
		context.beginPath();
		context.arc(cx, cy, coreR * 1.8, 0, 2 * Math.PI, false);
		context.closePath();
		context.fill();
	}

	function onTimer() {
		//if enough time has elapsed, we will add new particles.		
		count++;
		if (count >= wait) {

			count = 0;
			for (i = 0; i < numToAddEachFrame; i++) {
				theta = Math.random() * 2 * Math.PI;
				phi = Math.acos(Math.random() * 2 - 1);
				x0 = sphereRad * Math.sin(phi) * Math.cos(theta);
				y0 = sphereRad * Math.sin(phi) * Math.sin(theta);
				z0 = sphereRad * Math.cos(phi);

				//We use the addParticle function to add a new particle. The parameters set the position and velocity components.
				//Note that the velocity parameters will cause the particle to initially fly outwards away from the sphere center (after
				//it becomes unstuck).
				var p = addParticle(x0, sphereCenterY + y0, sphereCenterZ + z0, 0.0008 * x0, 0.0008 * y0, 0.0008 * z0);

				//we set some "envelope" parameters which will control the evolving alpha of the particles.
				p.attack = 40;
				p.hold = 80;
				p.decay = 120;
				p.initValue = 0;
				p.holdValue = particleAlpha;
				p.lastValue = 0;

				//the particle will be stuck in one place until this time has elapsed:
				p.stuckTime = 120 + Math.random() * 30;

				var roll = Math.random();
				if (roll < 0.35) {
					p.tintR = 60;
					p.tintG = 200;
					p.tintB = 255;
				} else if (roll < 0.7) {
					p.tintR = 20;
					p.tintG = 160;
					p.tintB = 255;
				} else {
					p.tintR = 100;
					p.tintG = 220;
					p.tintB = 255;
				}

				p.accelX = 0;
				p.accelY = gravity;
				p.accelZ = 0;
			}
		}

		//update viewing angle
		turnAngle = (turnAngle + turnSpeed) % (2 * Math.PI);
		sinAngle = Math.sin(turnAngle);
		cosAngle = Math.cos(turnAngle);

		context.clearRect(0, 0, displayWidth, displayHeight);
		drawOrbBackdrop();

		//update and draw particles
		p = particleList.first;
		while (p != null) {
			//before list is altered record next particle
			nextParticle = p.next;

			//update age
			p.age++;

			//if the particle is past its "stuck" time, it will begin to move.
			if (p.age > p.stuckTime) {
				p.velX += p.accelX + randAccelX * (Math.random() * 2 - 1);
				p.velY += p.accelY + randAccelY * (Math.random() * 2 - 1);
				p.velZ += p.accelZ + randAccelZ * (Math.random() * 2 - 1);

				p.x += p.velX;
				p.y += p.velY;
				p.z += p.velZ;
			}

			/*
			We are doing two things here to calculate display coordinates.
			The whole display is being rotated around a vertical axis, so we first calculate rotated coordinates for
			x and z (but the y coordinate will not change).
			Then, we take the new coordinates (rotX, y, rotZ), and project these onto the 2D view plane.
			*/
			rotX = cosAngle * p.x + sinAngle * (p.z - sphereCenterZ);
			rotZ = -sinAngle * p.x + cosAngle * (p.z - sphereCenterZ) + sphereCenterZ;
			m = radius_sp * fLen / (fLen - rotZ);
			p.projX = rotX * m + projCenterX;
			p.projY = p.y * m + projCenterY;

			//update alpha according to envelope parameters.
			if (p.age < p.attack + p.hold + p.decay) {
				if (p.age < p.attack) {
					p.alpha = (p.holdValue - p.initValue) / p.attack * p.age + p.initValue;
				}
				else if (p.age < p.attack + p.hold) {
					p.alpha = p.holdValue;
				}
				else if (p.age < p.attack + p.hold + p.decay) {
					p.alpha = (p.lastValue - p.holdValue) / p.decay * (p.age - p.attack - p.hold) + p.holdValue;
				}
			}
			else {
				p.dead = true;
			}

			//see if the particle is still within the viewable range.
			if ((p.projX > displayWidth) || (p.projX < 0) || (p.projY < 0) || (p.projY > displayHeight) || (rotZ > zMax)) {
				outsideTest = true;
			}
			else {
				outsideTest = false;
			}

			if (outsideTest || p.dead) {
				recycle(p);
			}

			else {
				//depth-dependent darkening
				depthAlphaFactor = (1 - rotZ / zeroAlphaDepth);
				depthAlphaFactor = (depthAlphaFactor > 1) ? 1 : ((depthAlphaFactor < 0) ? 0 : depthAlphaFactor);
				var pr = p.tintR != null ? p.tintR : r;
				var pg = p.tintG != null ? p.tintG : g;
				var pb = p.tintB != null ? p.tintB : b;
				context.fillStyle = "rgba(" + pr + "," + pg + "," + pb + "," + depthAlphaFactor * p.alpha + ")";

				//draw
				context.beginPath();
				context.arc(p.projX, p.projY, m * particleRad, 0, 2 * Math.PI, false);
				context.closePath();
				context.fill();
			}

			p = nextParticle;
		}
	}

	function addParticle(x0, y0, z0, vx0, vy0, vz0) {
		var newParticle;
		var color;

		//check recycle bin for available drop:
		if (recycleBin.first != null) {
			newParticle = recycleBin.first;
			//remove from bin
			if (newParticle.next != null) {
				recycleBin.first = newParticle.next;
				newParticle.next.prev = null;
			}
			else {
				recycleBin.first = null;
			}
		}
		//if the recycle bin is empty, create a new particle (a new ampty object):
		else {
			newParticle = {};
		}

		//add to beginning of particle list
		if (particleList.first == null) {
			particleList.first = newParticle;
			newParticle.prev = null;
			newParticle.next = null;
		}
		else {
			newParticle.next = particleList.first;
			particleList.first.prev = newParticle;
			particleList.first = newParticle;
			newParticle.prev = null;
		}

		//initialize
		newParticle.x = x0;
		newParticle.y = y0;
		newParticle.z = z0;
		newParticle.velX = vx0;
		newParticle.velY = vy0;
		newParticle.velZ = vz0;
		newParticle.age = 0;
		newParticle.dead = false;
		if (Math.random() < 0.5) {
			newParticle.right = true;
		}
		else {
			newParticle.right = false;
		}
		return newParticle;
	}

	function recycle(p) {
		//remove from particleList
		if (particleList.first == p) {
			if (p.next != null) {
				p.next.prev = null;
				particleList.first = p.next;
			}
			else {
				particleList.first = null;
			}
		}
		else {
			if (p.next == null) {
				p.prev.next = null;
			}
			else {
				p.prev.next = p.next;
				p.next.prev = p.prev;
			}
		}
		//add to recycle bin
		if (recycleBin.first == null) {
			recycleBin.first = p;
			p.prev = null;
			p.next = null;
		}
		else {
			p.next = recycleBin.first;
			recycleBin.first.prev = p;
			recycleBin.first = p;
			p.prev = null;
		}
	}
}


$(function () {
	$("#slider-range").slider({
		range: false,
		min: 20,
		max: 500,
		value: 280,
		slide: function (event, ui) {
			console.log(ui.value);
			sphereRad = ui.value;
		}
	});
});

$(function () {
	$("#slider-test").slider({
		range: false,
		min: 1.0,
		max: 2.0,
		value: 1,
		step: 0.01,
		slide: function (event, ui) {
			radius_sp = ui.value;
		}
	});
});