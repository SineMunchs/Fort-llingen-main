import * as THREE from 'three';

export default class Petals {

    dummy = new THREE.Object3D();
    petalCount = 9000;
    petalPositions = [];
    petalVelocities = [];
    textureLoader = new THREE.TextureLoader();

    constructor(scene) {
        this.scene = scene;

        this.petalGeometry = new THREE.PlaneGeometry(0.2, 0.2);
        this.petalTexture = this.textureLoader.load('public/texture/cherry_blossom_petal.png');
        this.petalMaterial = new THREE.MeshBasicMaterial({
            map: this.petalTexture,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        this.petalMesh = new THREE.InstancedMesh(this.petalGeometry, this.petalMaterial, this.petalCount);
        this.scene.add(this.petalMesh);

        this.createPetals();
    }

    createPetals() {
        for (let i = 0; i < this.petalCount; i++) {
            this.petalPositions.push(
                Math.random() * 40 - 20,
                Math.random() * 40 + 10,
                Math.random() * 40 - 20
            );
            this.petalVelocities.push(
                (Math.random() - 0.5) * 0.01,
                -Math.random() * 0.02 - 0.01,
                (Math.random() - 0.5) * 0.01
            );
            this.dummy.position.set(this.petalPositions[i*3], this.petalPositions[i*3+1], this.petalPositions[i*3+2]);
            this.dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            this.dummy.scale.setScalar(0.5 + Math.random() * 0.5);
            this.dummy.updateMatrix();
            this.petalMesh.setMatrixAt(i, this.dummy.matrix);
        }

        this.petalMesh.instanceMatrix.needsUpdate = true;
    }

    updatePetals() {
        for (let i = 0; i < this.petalCount; i++) {
            this.petalPositions[i*3] += this.petalVelocities[i*3];
            this.petalPositions[i*3+1] += this.petalVelocities[i*3+1];
            this.petalPositions[i*3+2] += this.petalVelocities[i*3+2];
    
            if (this.petalPositions[i*3+1] < 0) {
                this.petalPositions[i*3] = Math.random() * 40 - 20;
                this.petalPositions[i*3+1] = Math.random() * 40 + 10;
                this.petalPositions[i*3+2] = Math.random() * 40 - 20;
            }
    
            this.dummy.position.set(this.petalPositions[i*3], this.petalPositions[i*3+1], this.petalPositions[i*3+2]);
            this.dummy.rotation.x += 0.01;
            this.dummy.rotation.y += 0.01;
            this.dummy.updateMatrix();
            this.petalMesh.setMatrixAt(i, this.dummy.matrix);
        }
        this.petalMesh.instanceMatrix.needsUpdate = true;
    }

    resetPetals() {
        // this.petalPositions = [];
        for (let i = 0; i < this.petalCount; i++) {
        this.petalPositions[i](
            Math.random() * 40 - 20,
            Math.random() * 40 + 10,
            Math.random() * 40 - 20
            
        );
    }
    }
}