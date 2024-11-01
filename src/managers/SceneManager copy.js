import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GSAP from 'gsap'

import Scene1 from '../scenes/Scene2'
import Scene2 from '../scenes/Scene3'

/**
 * SceneManager klasse til at håndtere flere scener i en Three.js applikation.
 */
export default class SceneManager {

    stage = null        // Reference til hovedscenen
    scenes = []         // Array til at gemme scenerne
    currentScene = 0    // Indeks for den nuværende scene

    constructor(stageRef) {
        this.stage = stageRef
        this.initScenes()
    }

    

    // Initialiserer scenerne og tilføjer dem til scenes arrayet.
    initScenes() {
        this.scenes.push(
            new Scene1(), 
            new Scene2()
        )
    }

    /**
     * Monterer en scene på stage.
     * @param {number} sceneId - Indeks for scenen der skal monteres.
     */
    mountScene(sceneId) {
        // console.log(this.scenes[this.currentScene])
        if (this.scenes[this.currentScene].hasFog == true) {
            this.scenes[this.currentScene].createFog(this.stage)
        }
        const scene = this.scenes[sceneId]
        scene.group.position.copy(scene.group.userData.mountFromPosition)
        this.stage.add(scene.group)
        
        // Instantly set the position to (0, 0, 0) without animation
        scene.group.position.set(0, 0, 0)
    }

    /**
     * Afmonterer en scene fra stage.
     * @param {number} sceneId - Indeks for scenen der skal afmonteres.
     */
    unmountScene(sceneId) {
        const scene = this.scenes[sceneId]

        this.stage.fog.near = 0.1;
        this.stage.fog.far = 0;

        
        // Instantly set the position to unmountToPosition without animation
        scene.group.position.copy(scene.group.userData.unmountToPosition)
        
        // Immediately remove the scene from the stage
        this.stage.remove(scene.group)
    }

    // Skifter til den næste scene.
    nextScene() {
        this.unmountScene(this.currentScene)
        if (this.scenes[this.currentScene].hasFog === true) {
            this.scenes[this.currentScene].createFog(this.stage)
        }
        this.currentScene = (this.currentScene + 1) % this.scenes.length
        this.mountScene(this.currentScene)
    }

    // Skifter til den forrige scene.
    previousScene() {
        this.unmountScene(this.currentScene)
        if (this.scenes[this.currentScene].hasFog === true) {
            this.scenes[this.currentScene].createFog(this.stage)
        }
        this.currentScene = (this.currentScene - 1 + this.scenes.length) % this.scenes.length
        this.mountScene(this.currentScene)
    }

    // Opdaterer den nuværende scene.
    updateScene() {
        this.scenes[this.currentScene].update()
    }

}