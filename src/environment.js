import * as THREE from "three";
import { scene } from "./scene.js"; 
import { RGBELoader } from "../node_modules/three/examples/jsm/loaders/RGBELoader.js";
import { createWater } from "./shaders.js";
import { renderer } from "./scene.js";

const textureLoader = new THREE.TextureLoader();
const hdrLoader = new RGBELoader();

const textures = {
    ground: null,
    torus: null,
    hdr: null
};


async function loadEnvironment() {
    // Set up shadow properties once
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);


    // Lighting setup
    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(300, 250, 300);
    light.castShadow = true;
    light.shadow.mapSize.set(2048, 2048);
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 1000;
    light.shadow.camera.left = -600;
    light.shadow.camera.right = 600;
    light.shadow.camera.top = 600;
    light.shadow.camera.bottom = -600;
    scene.add(light);

    // Load textures in parallel
    try {
        const [groundTexture, torusTexture, hdrTexture] = await Promise.all([
            loadTexture('textures/sand.jpg', { repeat: [16, 16] }),
            loadTexture('textures/stacked-stones.jpg', { repeat: [8, 2] }),
            loadHDRTexture('textures/chinese_garden.hdr')
        ]);

        textures.ground = groundTexture;
        textures.torus = torusTexture;
        textures.hdr = hdrTexture;

        const ground = createGround(groundTexture);
        scene.add(ground);

        const torus = createTorus(torusTexture);
        scene.add(torus);

        const gameArea = createGameArea();
        scene.add(gameArea);

        scene.background = hdrTexture;
        scene.environment = hdrTexture;

    } catch (error) {
        console.error('Error loading textures:', error);
        // Fallback to basic materials if texture loading fails
        createFallbackScene();
    }
}

function loadTexture(path, options = {}) {
    return new Promise((resolve, reject) => {
        textureLoader.load(path, 
            (texture) => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                if (options.repeat) {
                    texture.repeat.set(options.repeat[0], options.repeat[1]);
                }
                resolve(texture);
            },
            undefined,
            (error) => reject(error)
        );
    });
}

function loadHDRTexture(path) {
    return new Promise((resolve, reject) => {
        hdrLoader.load(path, 
            (texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                scene.environment = texture;
                scene.environmentIntensity = 0.5;
                resolve(texture);
                createWater();

            },
            undefined,
            (error) => reject(error)
        );
    });
}

function createGround(texture) {
    const ground = new THREE.Mesh(
        new THREE.CircleGeometry(800, 64),
        new THREE.MeshPhongMaterial({ 
            map: texture,
            shininess: 30,
            specular: 0x888888
        })
    );
    
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -30; 
    ground.receiveShadow = true;
    return ground;
}

function createTorus(texture) {
    const torus = new THREE.Mesh(
        new THREE.TorusGeometry(800, 20, 20, 100),
        new THREE.MeshStandardMaterial({ 
            map: texture,
            roughness: 0.7,
            metalness: 0.3
        })
    );
    
    torus.rotation.x = Math.PI / 2;
    torus.position.set(0, -10, 0);
    torus.castShadow = true;
    torus.receiveShadow = true;
    return torus;
}

function createGameArea() {
    const gameArea = new THREE.Mesh(
        new THREE.CircleGeometry(200, 64),
        new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            transparent: true, 
            opacity: 0.15 
        })
    );
    gameArea.rotation.x = -Math.PI / 2;
    gameArea.position.y = -3;
    gameArea.receiveShadow = true;
    return gameArea;
}

function createFallbackScene() {
    // Basic fallback materials if texture loading fails
    const ground = createGround(null);
    ground.material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    scene.add(ground);

    const torus = createTorus(null);
    torus.material = new THREE.MeshStandardMaterial({ color: 0x999999 });
    scene.add(torus);

    createGameArea();
}

export { loadEnvironment, textures };