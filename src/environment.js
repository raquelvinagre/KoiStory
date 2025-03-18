import * as THREE from "three";
import {scene} from "./scene.js"; 
import { RGBELoader } from "../node_modules/three/examples/jsm/loaders/RGBELoader.js"; // Loader for HDR images
import { createWater } from "./shaders.js";
import { renderer } from "./scene.js";  

function loadEnvironment() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 4);
    spotLight.position.set(0, 50, 0);

    spotLight.decay = 1; 
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.castShadow = true;
    scene.add(spotLight);

    scene.renderer = renderer;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const ground = new THREE.Mesh(
        new THREE.CircleGeometry(800, 64),
        new THREE.MeshBasicMaterial({ color: 0x7ACA3D })
    );
    
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -30; 
    scene.add(ground);
    ground.receiveShadow = true;

    const geometry = new THREE.TorusGeometry(800, 20, 20, 100);
    const material = new THREE.MeshBasicMaterial({ color: 0x808080 });
    
    const torus = new THREE.Mesh(geometry, material);
    torus.rotation.x = Math.PI / 2; // Make the torus horizontal (along the XZ plane)
    torus.position.set(0,-10,0);
    torus.castShadow = true;
    torus.receiveShadow = true;
    
    scene.add(torus);

    const gameArea = new THREE.Mesh(
        new THREE.PlaneGeometry(300, 300, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
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
