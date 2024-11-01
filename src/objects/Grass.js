import * as THREE from 'three';

export default class Grass {
    constructor(scene) {
        this.scene = scene;
        this.textureLoader = new THREE.TextureLoader();
        this.grassTexture = null;
        this.grassMesh = null;

        this.GRASS_CONFIG = {
            SPHERE_RADIUS: 14.9,
            BLADE_COUNT: 999999,
            BLADE_WIDTH: 0.4,
            BLADE_HEIGHT: 0.2,
            BLADE_HEIGHT_VARIATION: 0.6
        };

        this.loadTexture();
    }

    loadTexture() {
        this.textureLoader.load(
            'public/Texture/grass.jpg',
            (texture) => {
                console.log('Grass texture loaded successfully');
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);
                this.grassTexture = texture;
                this.createGrass();
            },
            undefined,
            (error) => console.error('Error loading grass texture:', error)
        );
    }

    generateBlade(center, normal, vertexOffset, uv) {
        const { BLADE_WIDTH, BLADE_HEIGHT, BLADE_HEIGHT_VARIATION } = this.GRASS_CONFIG;
        const MID_WIDTH = BLADE_WIDTH * 0.5;
        const height = BLADE_HEIGHT + (Math.random() * BLADE_HEIGHT_VARIATION);

        const tangent = new THREE.Vector3(normal.y, normal.z, -normal.x).normalize();
        const bitangent = new THREE.Vector3().crossVectors(normal, tangent);
        
        const yaw = Math.random() * Math.PI * 2;
        const yawUnitVec = new THREE.Vector3().addScaledVector(tangent, Math.cos(yaw)).addScaledVector(bitangent, Math.sin(yaw));

        const bl = new THREE.Vector3().addVectors(center, yawUnitVec.clone().multiplyScalar(BLADE_WIDTH / 2));
        const br = new THREE.Vector3().addVectors(center, yawUnitVec.clone().multiplyScalar(-BLADE_WIDTH / 2));
        const tl = new THREE.Vector3().addVectors(center, yawUnitVec.clone().multiplyScalar(MID_WIDTH / 2).add(normal.clone().multiplyScalar(height / 2)));
        const tr = new THREE.Vector3().addVectors(center, yawUnitVec.clone().multiplyScalar(-MID_WIDTH / 2).add(normal.clone().multiplyScalar(height / 2)));
        const tc = new THREE.Vector3().addVectors(center, normal.clone().multiplyScalar(height));

        const black = [0, 0, 0];
        const gray = [0.5, 0.5, 0.5];
        const white = [1.0, 1.0, 1.0];

        const vertices = [
            { pos: bl.toArray(), uv: uv, color: black },
            { pos: br.toArray(), uv: uv, color: black },
            { pos: tr.toArray(), uv: uv, color: gray },
            { pos: tl.toArray(), uv: uv, color: gray },
            { pos: tc.toArray(), uv: uv, color: white }
        ];

        const indices = [
            vertexOffset, vertexOffset + 1, vertexOffset + 2,
            vertexOffset + 2, vertexOffset + 4, vertexOffset + 3,
            vertexOffset + 3, vertexOffset, vertexOffset + 2
        ];

        return { vertices, indices };
    }

    generateField() {
        const { SPHERE_RADIUS, BLADE_COUNT } = this.GRASS_CONFIG;
        const positions = [];
        const uvs = [];
        const indices = [];
        const colors = [];

        for (let i = 0; i < BLADE_COUNT; i++) {
            const VERTEX_COUNT = 5;

            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const x = SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta);
            const y = SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta);
            const z = SPHERE_RADIUS * Math.cos(phi);

            const pos = new THREE.Vector3(x, y, z);
            const normal = pos.clone().normalize();
            const uv = [theta / (Math.PI * 2), phi / Math.PI];

            const blade = this.generateBlade(pos, normal, i * VERTEX_COUNT, uv);
            
            blade.vertices.forEach(vertex => {
                positions.push(...vertex.pos);
                uvs.push(...vertex.uv);
                colors.push(...vertex.color);
            });
            
            indices.push(...blade.indices);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        return geometry;
    }

    createGrass() {
        if (!this.grassTexture) return;

        const grassVertexShader = `
            varying vec2 vUv;
            varying vec3 vColor;
            uniform float uTime;

            void main() {
                vUv = uv;
                vColor = color;
                
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vec3 worldNormal = normalize(mat3(modelMatrix) * normal);

                float wind = sin(uTime * 1.0 + worldPosition.x * 0.5 + worldPosition.z * 0.5) * 0.2;
                vec3 windOffset = vec3(wind * worldNormal.y, wind * -worldNormal.x, wind * worldNormal.z) * position.y;
                worldPosition.xyz += windOffset * 0.1;

                gl_Position = projectionMatrix * viewMatrix * worldPosition;
            }
        `;

        const grassFragmentShader = `
            varying vec2 vUv;
            varying vec3 vColor;
            uniform sampler2D grassTexture;

            void main() {
                vec4 grassColor = texture2D(grassTexture, vUv * 5.0);
                vec3 finalColor = mix(grassColor.rgb, vColor, 0.5);
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

        const grassUniforms = {
            grassTexture: { value: this.grassTexture },
            uTime: { value: 0.0 }
        };

        const grassMaterial = new THREE.ShaderMaterial({
            uniforms: grassUniforms,
            vertexShader: grassVertexShader,
            fragmentShader: grassFragmentShader,
            vertexColors: true,
            side: THREE.DoubleSide
        });

        const grassGeometry = this.generateField();
        this.grassMesh = new THREE.Mesh(grassGeometry, grassMaterial);
        this.grassMesh.name = 'GrassMesh';
        this.scene.add(this.grassMesh);
    }

    updateGrass(time) {
        if (this.grassMesh && this.grassMesh.material.uniforms) {
            this.grassMesh.material.uniforms.uTime.value = time;
        }
    }
}