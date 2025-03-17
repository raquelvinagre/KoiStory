import * as THREE from "three";
import {scene} from "./scene.js"; 
import { RGBELoader } from "../node_modules/three/examples/jsm/loaders/RGBELoader.js"; // Loader for HDR images
import { createWater } from "./shaders.js";

function loadEnvironment() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(-5, 8, 0); // Position it above the scene, angled to simulate sunlight
    //scene.add(spotLight);

    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(2000, 2000),
        new THREE.MeshBasicMaterial({ color: 0x7ACA3D })
    );
    ground.rotation.x = -Math.PI / 2; // Rotate it to lie flat on the XZ plane
    ground.position.y = -30; // Lower the ground so that it's beneath objects
    scene.add(ground);

    const gameArea = new THREE.Mesh(
        new THREE.PlaneGeometry(300, 300, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
    );
    gameArea.rotation.x = -Math.PI / 2; // Rotate it to lie flat on the XZ plane
    gameArea.position.y = -3; // Lower the ground so that it's beneath objects
    scene.add(gameArea);

    // Load HDR texture using RGBELoader
    const hdrLoader = new RGBELoader();
    hdrLoader.load('textures/chinese_garden.hdr', function (texture) {
        // Set the environment map
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture; // Set the background to the HDR image
        scene.environment = texture; // Set the environment map (for reflections, lighting, etc.)

        // Optional: You can tone map the HDR image for better lighting
        scene.background.encoding = THREE.RGBEEncoding;
        scene.environment.encoding = THREE.RGBEEncoding;
        texture.needsUpdate = true;

        // After loading the HDR texture, create water
        createWater();
    }, undefined, function (error) {
        console.error('Error loading HDR texture:', error);
    });
}

export { loadEnvironment };
