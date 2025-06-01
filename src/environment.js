import * as THREE from "three";
import {scene} from "./scene.js"; 
import { RGBELoader } from "../node_modules/three/examples/jsm/loaders/RGBELoader.js"; // Loader for HDR images
import { createWater } from "./shaders.js";
import { renderer } from "./scene.js";  


function loadEnvironment() {
    // const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    // scene.add(ambientLight);

    // const spotLight = new THREE.SpotLight(0xffffff, 4);
    // spotLight.position.set(0, 50, 0);

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

    // const helper = new THREE.CameraHelper(light.shadow.camera);
    // scene.add(helper);

    scene.renderer = renderer;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const groundTexture = new THREE.TextureLoader().load('textures/sand.jpg');
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(16, 16);

    const ground = new THREE.Mesh(
        new THREE.CircleGeometry(800, 64),
        new THREE.MeshPhongMaterial({ map: groundTexture })
    );
    
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -30; 
    ground.receiveShadow = true;
    scene.add(ground);

    const geometry = new THREE.TorusGeometry(800, 20, 20, 100);
    const torusTexture = new THREE.TextureLoader().load('textures/stone.jpg');
    torusTexture.wrapS = THREE.RepeatWrapping;
    torusTexture.wrapT = THREE.RepeatWrapping;
    torusTexture.repeat.set(8, 2);

    const material = new THREE.MeshPhongMaterial({ map: torusTexture });
    
    const torus = new THREE.Mesh(geometry, material);
    torus.rotation.x = Math.PI / 2; // Make the torus horizontal (along the XZ plane)
    torus.position.set(0,-10,0);
    torus.castShadow = true;
    torus.receiveShadow = true;
    
    scene.add(torus);   

    const gameArea = new THREE.Mesh(
        new THREE.CircleGeometry(200, 64),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 })
    );
    gameArea.rotation.x = -Math.PI / 2;
    gameArea.position.y = -3;
    scene.add(gameArea);
    gameArea.receiveShadow = true;

    const hdrLoader = new RGBELoader();
    hdrLoader.load('textures/chinese_garden.hdr', function (texture) {

        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture; 
        scene.environment = texture; 

        scene.background.encoding = THREE.RGBEEncoding;
        scene.environment.encoding = THREE.RGBEEncoding;
        texture.needsUpdate = true;

        createWater();
    }, undefined, function (error) {
        console.error('Error loading HDR texture:', error);
    });
}

export { loadEnvironment };
