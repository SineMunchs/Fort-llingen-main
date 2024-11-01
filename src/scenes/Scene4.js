import * as THREE from 'three'
import { SpotLightHelper } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Petals from '../objects/Petals.js'

export default class Scene4 {
    constructor() {
        this.group = new THREE.Group()
        this.mouse = new THREE.Vector2()
        this.flowerPosition = 0
        this.lastUpdateTime = 0
        

        //TEXT
        this.texts = [
            "One quiet day, Daruma noticed a little flower drooping from thirst. Its petals hung limply, too weak to stand tall. Daruma smiled and rolled over to the flower.",
            "Press the letter 'R' to make Daruma roll towards the flower!",
            "With a gentle nudge, Daruma helped the flower sit up straight again. The flower perked up, happy and full of color.", 
            "Press the arrow to the right to continue, and see what happens next!",
        ]
        this.currentTextIndex = 0
        
        this.isRolling = false
        this.rollStartPosition = new THREE.Vector3()
        this.rollEndPosition = new THREE.Vector3()
        this.rollProgress = 0
        this.rollDuration = 5000 // 5 seconds for rolling animation
        this.rollStartTime = 0
        
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

        this.spotLightHelper = new SpotLightHelper(this.spotLight)
        // Uncomment the next line to add the spotlight helper to the scene
        // this.group.add(this.spotLightHelper)
    }

    load3DModels() {
        const loader = new GLTFLoader()

        loader.load('src/3D/DarumaOneEye.glb', (gltf) => {
            this._3dmodel = gltf.scene
            this._3dmodel.scale.set(0.1, 0.1, 0.1)
            this._3dmodel.position.set(-3, 1, 0)
            this._3dmodel.rotation.set(0, -0.2, 0)
            this.group.add(this._3dmodel)
            this.checkModelsLoaded()
        }, undefined, (error) => {
            console.error('Error loading Daruma model:', error)
        })

        loader.load('src/3D/open.glb', (gltf) => {
            this._cherryBlossomsModel = gltf.scene
            this._cherryBlossomsModel.scale.set(1, 1, 1)
            this._cherryBlossomsModel.position.set(-5, -1, -3)
            this._cherryBlossomsModel.rotation.set(0, Math.PI / -10, 0)
            this.group.add(this._cherryBlossomsModel)
            this.createTreeSpotlight()
        }, undefined, (error) => {
            console.error('Error loading open.glb:', error)
        })

        loader.load('src/3D/drop.glb', (gltf) => {
            this._cherryBlossomsModel = gltf.scene
            this._cherryBlossomsModel.scale.set(1, 1, 1)
            this._cherryBlossomsModel.position.set(9, -8, 5)
            this._cherryBlossomsModel.rotation.set(0, Math.PI / -5, 0)
            this.group.add(this._cherryBlossomsModel)
            this.createTreeSpotlight()
        }, undefined, (error) => {
            console.error('Error loading open.glb:', error)
        })

        loader.load('src/3D/flower.glb', (gltf) => {
            this._flowerModel = gltf.scene
            this._flowerModel.scale.set(20, 20, 20)
            this._flowerModel.position.set(0, 0, 0)
            this._flowerModel.rotation.set(0, Math.PI / -9, 0)
            this.group.add(this._flowerModel)
            this.createTreeSpotlight()
            this.animateFlower()
            this.checkModelsLoaded()
        }, undefined, (error) => {
            console.error('Error loading flower model:', error)
        })
    }

    createTreeSpotlight() {
        if (this._flowerModel) {
            const treeSpotLight = new THREE.SpotLight(0xffffff, 5, 10, Math.PI / 6, 0.5, 2)
            treeSpotLight.position.set(0, 5, 5)
            treeSpotLight.target = this._flowerModel
            this.group.add(treeSpotLight)
        }
    }

    animateFlower() {
        if (this._flowerModel) {
            this.flowerPosition += 0.01
            this._flowerModel.position.y = Math.sin(this.flowerPosition) * 0.5
        }
        requestAnimationFrame(() => this.animateFlower())
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
        this.updateInterval = 50
        this.isTextComplete = false
        this.fadeStartTime = 0
        this.isFading = false
    }

    updateTypewriterText() {
        const currentTime = performance.now()
        
        if (this.isFading) {
            const fadeProgress = (currentTime - this.fadeStartTime) / 1000
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
            this.fadeStartTime = currentTime + 3000
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
            unmountToPosition: new THREE.Vector3(-10, 0, 0)
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
        if (event.key.toLowerCase() === 'r' && !this.isRolling) {
            this.setupRollAnimation()
            this.startRolling()
        }
    }

    adjustModel() {
        if (this._3dmodel && !this.isRolling) {
            const maxRotation = Math.PI / 5 // 36 degrees
            const maxVerticalRotation = Math.PI / 12 // 15 degrees

            const rotationY = THREE.MathUtils.clamp(
                this.mouse.x * Math.PI / 2,
                -maxRotation,
                maxRotation
            )
            this._3dmodel.rotation.y = -0.2 + rotationY
            
            const rotationX = THREE.MathUtils.clamp(
                this.mouse.y * Math.PI / 4,
                -maxVerticalRotation,
                maxVerticalRotation
            )
            this._3dmodel.rotation.x = rotationX
        }
    }

    checkModelsLoaded() {
        if (this._3dmodel && this._flowerModel && !this.isRolling) {
            console.log("Models loaded. Press 'R' to start rolling.")
        }
    }

    setupRollAnimation() {
        if (!this._3dmodel || !this._flowerModel) return
        this.rollStartPosition.copy(this._3dmodel.position)
        this.rollEndPosition.copy(this._flowerModel.position)
        this.rollEndPosition.y = this._3dmodel.position.y
    }

    startRolling() {
        this.isRolling = true
        this.rollProgress = 0
        this.rollStartTime = performance.now()
    }

    updateRolling() {
        if (!this.isRolling || !this._3dmodel || !this._flowerModel) return

        const currentTime = performance.now()
        this.rollProgress = Math.min((currentTime - this.rollStartTime) / this.rollDuration, 1)

        if (this.rollProgress < 1) {
            this._3dmodel.position.lerpVectors(this.rollStartPosition, this.rollEndPosition, this.rollProgress)

            const rollAngle = this.rollProgress * Math.PI * 2
            this._3dmodel.rotation.z = rollAngle

            const bobHeight = Math.sin(this.rollProgress * Math.PI) * 0.2
            this._3dmodel.position.y = this.rollStartPosition.y + bobHeight

            // Reset x and y rotation during rolling
            this._3dmodel.rotation.y = 0
            this._3dmodel.rotation.x = -0.2
        } else {
            this.isRolling = false
            this._3dmodel.position.copy(this.rollEndPosition)
            this._3dmodel.rotation.z = 0
            // Reset to initial rotation after rolling
            this._3dmodel.rotation.x = 0
            this._3dmodel.rotation.y = -0.2
        }
    }

    update() {
        this.adjustModel()
        if (this.petals) {
            this.petals.updatePetals()
        }
        if (this.spotLightHelper) {
            this.spotLightHelper.update()
        }
        this.updateTypewriterText()
        this.updateRolling()
    }
}