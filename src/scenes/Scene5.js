import * as THREE from 'three'
import { SpotLightHelper } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Petals from '../objects/Petals.js'

export default class Scene4 {
    constructor() {
        this.group = new THREE.Group()
        this.mouse = new THREE.Vector2()
        this.lastUpdateTime = 0
    
   //TEXT
   this.texts = [
    " That was the story of Daruma, the one-eyed doll who brought good luck and happiness to the world!",
    "The Daruma doll is a special symbol of good luck, happiness, and never giving up! Some people say it can even protect you from bad things and bring in lots of good things."         
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
        this.createPetals()
        this.createTypewriterText()
        this.createSkybox()
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
        // Uncomment the next line if you want to add the spotlight helper to the scene
        // this.group.add(this.spotLightHelper)
    }


    load3DModels() {
        const loader = new GLTFLoader()

        // Load Daruma model
        loader.load('src/3D /Darumasmil.glb', (gltf) => {
            this._3dmodel = gltf.scene
            this._3dmodel.scale.set(0.1, 0.1, 0.1)
            this._3dmodel.position.set(-4, 1, 0)
            this._3dmodel.rotation.set(0, -0.2, 0)
            this.group.add(this._3dmodel)
        }, undefined, (error) => {
            console.error('Error loading Daruma model:', error)
        })

        // Load Cherry Blossoms models
        this.loadCherryBlossoms(loader, 3, 3, 3, 4, -1.2, -6, Math.PI / -9)
        this.loadCherryBlossoms(loader, 4, 4, 4, 8, -2, -6, Math.PI / -9)
        
        // Load flower model
        this.loadFlower(loader)
    }

    loadCherryBlossoms(loader, scaleX, scaleY, scaleZ, posX, posY, posZ, rotY) {
        loader.load('src/3D /tree3.glb', (gltf) => {
            const cherryBlossoms = gltf.scene
            cherryBlossoms.scale.set(scaleX, scaleY, scaleZ)
            cherryBlossoms.position.set(posX, posY, posZ)
            cherryBlossoms.rotation.set(0, rotY, 0)
            this.group.add(cherryBlossoms)
            this.createTreeSpotlight(cherryBlossoms)
        }, undefined, (error) => {
            console.error('Error loading Cherry Blossoms model:', error)
        })
    }

    loadFlower(loader) {
        loader.load('src/3D /flower.glb', (gltf) => {
            const flower = gltf.scene
            flower.scale.set(26, 26, 26)
            flower.position.set(0, 1, 0)
            flower.rotation.set(0, Math.PI / -9, 0)
            this.group.add(flower)
        }, undefined, (error) => {
            console.error('Error loading Flower model:', error)
        })
    }

    createTreeSpotlight(target) {
        const treeSpotLight = new THREE.SpotLight(0xffffff, 5, 10, Math.PI / 6, 0.5, 2)
        treeSpotLight.position.set(0, 5, 5)
        treeSpotLight.target = target
        this.group.add(treeSpotLight)
    }

    createPetals() {
        this.petals = new Petals(this.group)
    }

    createSkybox() {
        const textureLoader = new THREE.TextureLoader()
        const backgroundTexture = textureLoader.load('public/texture/clouds4.png')
        const backgroundGeometry = new THREE.SphereGeometry(100, 60, 40)
        backgroundGeometry.scale(-1, 1, 1)
        const backgroundMaterial = new THREE.MeshBasicMaterial({ map: backgroundTexture })
        this.skybox = new THREE.Mesh(backgroundGeometry, backgroundMaterial)
        this.group.add(this.skybox)
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
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    adjustModel() {
        if (this._3dmodel) {
            // Limit the rotation range
            const maxRotation = Math.PI / 4; // 45 degrees
            
            // Calculate the new rotation, clamped between -maxRotation and maxRotation
            const newRotationY = Math.max(-maxRotation, Math.min(maxRotation, this.mouse.x * Math.PI / 2));
            
            // Apply the new rotation
            this._3dmodel.rotation.y = newRotationY;
            
            // Optionally, add some vertical rotation based on mouse Y position
            const maxVerticalRotation = Math.PI / 6; // 30 degrees
            const newRotationX = Math.max(-maxVerticalRotation, Math.min(maxVerticalRotation, this.mouse.y * Math.PI / 4));
            this._3dmodel.rotation.x = newRotationX;
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
    }
}