import * as THREE from 'three';
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";
import { camera, renderer, scene } from "./scene.js"; 

let cameraPivot;  
let isFixedCamera = false;
const fixedCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Button to toggle between fixed and follow camera
const button = document.createElement("button");
button.textContent = "Switch to Game Mode";
button.style.position = "absolute";
button.style.top = "50px";
button.style.left = "10px";
document.body.appendChild(button);
button.style.display = "none"; // Initially hide the button

export function initializeControls(sceneInstance) {
    cameraPivot = new THREE.Object3D();
    sceneInstance.add(cameraPivot);  

    fixedCamera.position.set(0, 10, 10);  // Initial fixed camera position
    fixedCamera.lookAt(0, 0, 50);  // Change the target position here

    camera.position.set(0, 27, 60); // Set follow camera position
    cameraPivot.add(camera);  

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.target.set(0, 0, 0);  // Change the target position here

    button.addEventListener("click", () => {
        isFixedCamera = !isFixedCamera;
        button.textContent = isFixedCamera ? "Switch to Free Mode" : "Switch to Game Mode";
    });

    return { cameraPivot, fixedCamera, controls, isFixedCamera };
}

export function updateCamera(group, controls) {
    if (!group) return;

    // Define the coordinates range where the button should be visible
    const minX = -150, maxX = 150;
    const minY = -50, maxY = 50;
    const minZ = -150, maxZ = 150;

    // Check if the boat is within the specified coordinates
    const boatPosition = group.position;
    if (boatPosition.x >= minX && boatPosition.x <= maxX &&
        boatPosition.y >= minY && boatPosition.y <= maxY &&
        boatPosition.z >= minZ && boatPosition.z <= maxZ) {
        button.style.display = "block"; // Show the button
    } else {
        button.style.display = "none"; // Hide the button
    }

    if (isFixedCamera) {
        // Update fixed camera position to be at the back of the boat
        // const offset = new THREE.Vector3(0, 8, 15); // Adjust offset as needed
        // const backPosition = group.position.clone().add(offset);
        // fixedCamera.position.copy(backPosition);
        group.position.y = 0;
        group.position.x = 0;
        group.position.z = 0;
        group.rotation.y = 0;

        renderer.render(scene, fixedCamera);
    } else {
        cameraPivot.position.copy(group.position);

        controls.target.copy(group.position);  // Change the target position here
        controls.update();

        renderer.render(scene, camera);
    }
}
