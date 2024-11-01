import * as THREE from 'three'
import { SpotLightHelper } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default class Scene3 {
    constructor() {
        this.group = new THREE.Group()
        this.mouse = new THREE.Vector2()
        this.lastUpdateTime = 0
        this.texts = [
            "So, Lucky Cat gave Daruma one eye to explore the world! ",
            "Press the letter 'e' to help Daruma see the world!",
            "Daruma went on to share a very special message: if you work hard and do your best, you can earn good luck, happiness, and even share it with others!",
            "Press the arrow to the right to continue, and see what happens next!",
        ]
        this.currentTextIndex = 0

        // New properties for cat swaying
        this.catSwayTime = 0
        this.catSwaySpeed = 0.5 // Adjust this to change the speed of swaying
        this.catSwayAmount = 0.5 // Adjust this to change the amount of swaying

        this.init()
    }

    init() {
        this.createLights()
        this.load3DModels()
        this.createStars()
        this.createTypewriterText()
        this.updateUserData()
        this.setupEventListeners()
    }

    createLights() {
        const ambientLight = new THREE.AmbientLight(0x999999, 0.5)
        this.group.add(ambientLight)

        this.spotLight = new THREE.SpotLight(0xffffff, 8, 20, Math.PI / 4, 0.1, 2)
        this.spotLight.position.set(0, 5, 5)
        this.group.add(this.spotLight)

        // Uncomment the next line if you want to add the spotlight helper to the scene
        // this.spotLightHelper = new SpotLightHelper(this.spotLight)
        // this.group.add(this.spotLightHelper)
    }

    load3DModels() {
        const loader = new GLTFLoader()

        // Load both Daruma models
        loader.load('src/3D /DarumaNoEye.glb', (gltf) => {
            this.darumaNoEye = gltf.scene
            this.darumaNoEye.scale.set(0.1, 0.1, 0.1)
            this.darumaNoEye.position.set(0, 1, 0)
            this.darumaNoEye.rotation.set(0, -0.2, 0)
            this.group.add(this.darumaNoEye)
        }, undefined, (error) => {
            console.error('Error loading DarumaNoEye model:', error)
        })

        loader.load('src/3D /DarumaOneEye.glb', (gltf) => {
            this.darumaOneEye = gltf.scene
            this.darumaOneEye.scale.set(0.1, 0.1, 0.1)
            this.darumaOneEye.position.set(0, 1, 0)
            this.darumaOneEye.rotation.set(0, -0.2, 0)
            this.darumaOneEye.visible = false // Initially hidden
            this.group.add(this.darumaOneEye)
        }, undefined, (error) => {
            console.error('Error loading DarumaOneEye model:', error)
        })

        loader.load('src/3D /open.glb', (gltf) => {
            this._cherryBlossomsModel = gltf.scene
            this._cherryBlossomsModel.scale.set(1, 1, 1)
            this._cherryBlossomsModel.position.set(-5, -1, -3)
            this._cherryBlossomsModel.rotation.set(0, Math.PI / -10, 0)
            this.group.add(this._cherryBlossomsModel)
            this.createTreeSpotlight()
        }, undefined, (error) => {
            console.error('Error loading open.glb:', error)
        })

        loader.load('src/3D /cat.glb', (gltf) => {
            this.catModel = gltf.scene
            this.catModel.scale.set(3, 3, 3)
            this.catModel.position.set(15, 8, -10)
            this.catModel.rotation.set(1, -0.5, 0)
            this.group.add(this.catModel)
        }, undefined, (error) => {
            console.error('Error loading cat.glb:', error)
        })
    }

    createTreeSpotlight() {
        if (this._cherryBlossomsModel) {
            const treeSpotLight = new THREE.SpotLight(0xffffff, 5, 10, Math.PI / 6, 0.5, 2)
            treeSpotLight.position.set(0, 5, 5)
            treeSpotLight.target = this._cherryBlossomsModel
            this.group.add(treeSpotLight)
        }
    }

    createStars() {
        const radius = 500
        const starCount = 1000
        const starGeometry = new THREE.BufferGeometry()
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2,
            sizeAttenuation: false
        })

        const positions = new Float32Array(starCount * 3)

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3
            const theta = 2 * Math.PI * Math.random()
            const phi = Math.acos(2 * Math.random() - 1)
            const randomRadius = radius + (Math.random() - 0.5) * 50

            positions[i3] = randomRadius * Math.sin(phi) * Math.cos(theta)
            positions[i3 + 1] = randomRadius * Math.sin(phi) * Math.sin(theta)
            positions[i3 + 2] = randomRadius * Math.cos(phi)
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        this.stars = new THREE.Points(starGeometry, starMaterial)
        this.group.add(this.stars)
    }

    createTypewriterText() {
        const canvas = document.createElement('canvas')
        canvas.width = 500
        canvas.height = 220
        this.ctx = canvas.getContext('2d')

        this.textTexture = new THREE.CanvasTexture(canvas)
        const material = new THREE.SpriteMaterial({ map: this.textTexture })
        this.textSprite = new THREE.Sprite(material)

        this.textSprite.scale.set(5, 2.5, 0.5)
        this.textSprite.position.set(-6.7, 0.2, 6)

        this.group.add(this.textSprite)

        this.fullText = this.texts[this.currentTextIndex]
        this.currentText = ""
        this.textIndex = 0
        this.updateInterval = 50 // milliseconds between each character
        this.isTextComplete = false
        this.fadeStartTime = 0
        this.isFading = false
    }

    updateTypewriterText() {
        const currentTime = performance.now()
        
        if (this.isFading) {
            const fadeProgress = (currentTime - this.fadeStartTime) / 1000 // 1 second fade
            if (fadeProgress >= 1) {
                this.isFading = false
                this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length
                this.fullText = this.texts[this.currentTextIndex]
                this.currentText = ""
                this.textIndex = 0
                this.isTextComplete = false
            } else {
                this.drawFadingText(1 - fadeProgress)
            }
        } else if (currentTime - this.lastUpdateTime > this.updateInterval && this.textIndex < this.fullText.length) {
            this.currentText += this.fullText[this.textIndex]
            this.textIndex++
            this.lastUpdateTime = currentTime
            this.drawText()
        } else if (this.textIndex === this.fullText.length && !this.isTextComplete) {
            this.isTextComplete = true
            this.fadeStartTime = currentTime + 3000 // Start fading after 3 seconds
        } else if (this.isTextComplete && currentTime > this.fadeStartTime) {
            this.isFading = true
        }
    }

    drawText() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
        this.ctx.font = '20px Arial'
        this.ctx.fillStyle = 'white'
        this.wrapText(this.ctx, this.currentText, 20, 50, this.ctx.canvas.width - 40, 40)
        this.textTexture.needsUpdate = true
    }

    drawFadingText(opacity) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
        this.ctx.font = '20px Arial'
        this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        this.wrapText(this.ctx, this.currentText, 20, 50, this.ctx.canvas.width - 40, 40)
        this.textTexture.needsUpdate = true
    }

    wrapText(context, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ')
        let line = ''

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' '
            const metrics = context.measureText(testLine)
            const testWidth = metrics.width
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y)
                line = words[n] + ' '
                y += lineHeight
            } else {
                line = testLine
            }
        }
        context.fillText(line, x, y)
    }

    updateUserData() {
        this.group.userData = {
            mountFromPosition: new THREE.Vector3(10, 0, 0),
            unmountToPosition: new THREE.Vector3(-20, 0, 0)
        }
    }

    setupEventListeners() {
        window.addEventListener('mousemove', this.onMouseMove.bind(this))
        window.addEventListener('keydown', this.onKeyDown.bind(this))
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    onKeyDown(event) {
        if (event.key === 'e' || event.key === 'E') {
            this.toggleDarumaModel()
        }
    }

    toggleDarumaModel() {
        if (this.darumaNoEye && this.darumaOneEye) {
            this.darumaNoEye.visible = !this.darumaNoEye.visible
            this.darumaOneEye.visible = !this.darumaOneEye.visible
        }
    }

    adjustModel() {
        if (this.darumaOneEye && this.darumaNoEye) {
            // Limit the rotation range for the Y-axis
            const maxRotation = Math.PI / 6; // 30 degrees
            const rotationY = THREE.MathUtils.clamp(
                this.mouse.x * Math.PI / 2,
                -maxRotation,
                maxRotation
            );
            
            // Limit the rotation range for the X-axis
            const maxVerticalRotation = Math.PI / 12; // 15 degrees
            const rotationX = THREE.MathUtils.clamp(
                this.mouse.y * Math.PI / 4,
                -maxVerticalRotation,
                maxVerticalRotation
            );

            // Apply rotations to both Daruma models
            this.darumaOneEye.rotation.set(rotationX, -0.2 + rotationY, 0);
            this.darumaNoEye.rotation.set(rotationX, -0.2 + rotationY, 0);
        }
    }

    swayCatModel() {
        if (this.catModel) {
            this.catSwayTime += 0.016 // Assuming 60fps, adjust if using a different frame rate
            const swayOffset = Math.sin(this.catSwayTime * this.catSwaySpeed) * this.catSwayAmount
            this.catModel.position.x = 15 + swayOffset // 15 is the initial X position
        }
    }

    update() {
        this.adjustModel()
        if (this.stars) {
            this.stars.rotation.y += 0.0001
        }
        if (this.spotLightHelper) {
            this.spotLightHelper.update()
        }
        this.updateTypewriterText()
        this.swayCatModel() // New line to update the cat's position
    }
}