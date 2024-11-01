import * as THREE from 'three';

export default class Skybox {
    constructor(scene) {
        this.scene = scene;
        this.createSkybox();
    }

    createSkybox() {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            'path/to/right.jpg',
            'path/to/left.jpg',
            'path/to/top.jpg',
            'path/to/bottom.jpg',
            'path/to/front.jpg',
            'path/to/back.jpg'
        ]);
        
        this.scene.background = texture;
    }

    update() {
        // Add any update logic if needed
    }
}