import * as THREE from 'three'
import { SpotLightHelper } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default class Scene1 {
    constructor() {
        this.group = new THREE.Group();
        this.mouse = new THREE.Vector2();
        this.lastUpdateTime = 0;
        this.texts = [
            "The Daruma doll is a special symbol of good luck, happiness, and to never give up! Some people say it can even protect you from bad things and bring in lots of good things.",
            "That's why the Daruma doll was made without any eyes. You see, to give Daruma his eyes, you need to work hard and try your best.",
            "Press the arrow to the right to continue, and see what happens next!",
        ];
        this.currentTextIndex = 0;
        this.sound = null;
        this.audioLoaded = false;

        // New properties for pulsating effect
        this.pulsateTime = 0;
        this.pulsateSpeed = 2; // Adjust this to change the speed of pulsation
        this.pulsateAmount = 0.1; // Adjust this to change the amount of pulsation

        this.init();
    }

    init() {
        this.createLights();
        this.load3DModels();
        this.createStars();
        this.createTypewriterText();
        this.updateUserData();
        this.setupEventListeners();
        this.setupAudio();
    }

    setupAudio() {
        const listener = new THREE.AudioListener();
        this.group.add(listener);

        this.sound = new THREE.Audio(listener);

        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('public/audio/daruma4.mp3', (buffer) => {
            this.sound.setBuffer(buffer);
            this.sound.setLoop(false);
            this.sound.setVolume(0.5);
            this.audioLoaded = true;
            console.log('Audio loaded and ready to play');
        });

        window.addEventListener('keydown', (event) => {
            if (event.key === 'm' || event.key === 'M') {
                this.playAudio();
            }
        });
    }

    playAudio() {
        if (this.audioLoaded && this.sound) {
            if (this.sound.isPlaying) {
                this.sound.stop();
            }
            this.sound.play();
            console.log('Audio playing');
        }
    }

    createLights() {
        const ambientLight = new THREE.AmbientLight(0x999999, 0.5);
        this.group.add(ambientLight);

        this.spotLight = new THREE.SpotLight(0xffffff, 8, 20, Math.PI / 4, 0.1, 2);
        this.spotLight.position.set(0, 5, 5);
        this.group.add(this.spotLight);
    }

    load3DModels() {
        const loader = new GLTFLoader();

        loader.load('src/3D/oneeye.glb', (gltf) => {
            this._3dmodel = gltf.scene;
            this._3dmodel.scale.set(0.1, 0.1, 0.1);
            this._3dmodel.position.set(2, -2, 0);
            this._3dmodel.rotation.set(0, -0.5, 0);
            this.group.add(this._3dmodel);
        }, undefined, (error) => {
            console.error('Error loading oneeye.glb:', error);
        });

        loader.load('src/3D/bridge.glb', (gltf) => {
            this._bridgeModel = gltf.scene;
            this._bridgeModel.scale.set(10, 10, 1);
            this._bridgeModel.position.set(-10, -1, -3);
            this._bridgeModel.rotation.set(0, Math.PI / -10, 0);
            this.group.add(this._bridgeModel);
            this.createTreeSpotlight();
        }, undefined, (error) => {
            console.error('Error loading bridge.glb:', error);
        });

        loader.load('src/3D/start4.glb', (gltf) => {
            this._startModel = gltf.scene;
            this._startModel.scale.set(4, 4, 4);
            this._startModel.position.set(28, 10.5, -5);
            this._startModel.rotation.set(0.2, Math.PI / -8 - 0.7, 0);
            this.group.add(this._startModel);
        }, undefined, (error) => {
            console.error('Error loading start4.glb:', error);
        });
    }

    createTreeSpotlight() {
        if (this._bridgeModel) {
            const treeSpotLight = new THREE.SpotLight(0xffffff, 5, 10, Math.PI / 6, 0.5, 2);
            treeSpotLight.position.set(0, 5, 5);
            treeSpotLight.target = this._bridgeModel;
            this.group.add(treeSpotLight);
        }
    }

    createStars() {
        const radius = 500;
        const starCount = 1000;
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2,
            sizeAttenuation: false
        });

        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);
            const randomRadius = radius + (Math.random() - 0.5) * 50;

            positions[i3] = randomRadius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = randomRadius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = randomRadius * Math.cos(phi);
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.stars = new THREE.Points(starGeometry, starMaterial);
        this.group.add(this.stars);
    }

    createTypewriterText() {
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 220;
        this.ctx = canvas.getContext('2d');
        
        this.textTexture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: this.textTexture });
        this.textSprite = new THREE.Sprite(material);
        
        this.textSprite.scale.set(5, 2.5, 0.5);
        this.textSprite.position.set(-6.7, 0.2, 6);
        
        this.group.add(this.textSprite);
        
        this.fullText = this.texts[this.currentTextIndex];
        this.currentText = "";
        this.textIndex = 0;
        this.updateInterval = 50;
        this.isTextComplete = false;
        this.fadeStartTime = 0;
        this.isFading = false;
    }

    updateTypewriterText() {
        const currentTime = performance.now();

        if (this.isFading) {
            const fadeProgress = (currentTime - this.fadeStartTime) / 1000;
            if (fadeProgress >= 1) {
                this.isFading = false;
                this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
                this.fullText = this.texts[this.currentTextIndex];
                this.currentText = "";
                this.textIndex = 0;
                this.isTextComplete = false;
            } else {
                this.drawFadingText(1 - fadeProgress);
            }
        } else if (currentTime - this.lastUpdateTime > this.updateInterval && this.textIndex < this.fullText.length) {
            this.currentText += this.fullText[this.textIndex];
            this.textIndex++;
            this.lastUpdateTime = currentTime;
            this.drawText();
        } else if (this.textIndex === this.fullText.length && !this.isTextComplete) {
            this.isTextComplete = true;
            this.fadeStartTime = currentTime + 3000;
        } else if (this.isTextComplete && currentTime > this.fadeStartTime) {
            this.isFading = true;
        }
    }

    drawText() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = 'white';
        this.wrapText(this.ctx, this.currentText, 20, 50, this.ctx.canvas.width - 40, 40);
        this.textTexture.needsUpdate = true;
    }

    drawFadingText(opacity) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        this.wrapText(this.ctx, this.currentText, 20, 50, this.ctx.canvas.width - 40, 40);
        this.textTexture.needsUpdate = true;
    }

    wrapText(context, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        context.fillText(line, x, y);
    }

    updateUserData() {
        this.group.userData = {
            mountFromPosition: new THREE.Vector3(10, 0, 0),
            unmountToPosition: new THREE.Vector3(-10, 0, 0)
        };
    }

    setupEventListeners() {
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    adjustModel() {
        if (this._3dmodel) {
            const maxRotation = Math.PI / 6; // 30 degrees
            const rotationY = THREE.MathUtils.clamp(
                this.mouse.x * Math.PI / 2,
                -maxRotation,
                maxRotation
            );
            this._3dmodel.rotation.y = -0.5 + rotationY;

            const maxVerticalRotation = Math.PI / 12; // 15 degrees
            const rotationX = THREE.MathUtils.clamp(
                this.mouse.y * Math.PI / 4,
                -maxVerticalRotation,
                maxVerticalRotation
            );
            this._3dmodel.rotation.x = rotationX;
        }
    }

    pulsateStartModel() {
        if (this._startModel) {
            this.pulsateTime += 0.016; // Assuming 60fps, adjust if using a different frame rate
            const scale = 1 + Math.sin(this.pulsateTime * this.pulsateSpeed) * this.pulsateAmount;
            this._startModel.scale.set(4 * scale, 4 * scale, 4 * scale);
        }
    }

    update() {
        this.adjustModel();
        if (this.stars) {
            this.stars.rotation.y += 0.0001;
        }
        if (this.spotLightHelper) {
            this.spotLightHelper.update();
        }
        this.updateTypewriterText();
        this.pulsateStartModel(); // New line to update the pulsating effect
    }
}