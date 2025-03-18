import * as THREE from 'three';
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";
import { camera, renderer, scene } from "./scene.js"; 
import { startGame, stopGame } from "./game.js";
import { fishGroup } from "./models.js";    

let cameraPivot;  
let isFixedCamera = false;
const fixedCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let time = 0;
let time2 = 0;

// Button to toggle between fixed and follow camera
const button = document.createElement("button");
button.textContent = "Switch to Game Mode";
button.style.position = "absolute";
button.style.top = "50px";
button.style.left = "10px";
document.body.appendChild(button);
button.style.display = "none";

export function initializeControls(sceneInstance) {
    cameraPivot = new THREE.Object3D();
    sceneInstance.add(cameraPivot);  

    fixedCamera.position.set(0, 10, 10);  // Initial fixed camera position
    fixedCamera.lookAt(0, 0, 50);  // Change the target position here

    camera.position.set(0, 30, 60); // Set follow camera position
    cameraPivot.add(camera);  

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    //controls.target.set(0, 0, 0);  // Change the target position here

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

    if (group) {
        if (group.initialPosition === undefined) {
            group.initialPosition = group.position.clone();
            group.initialRotation = group.rotation.clone();
        }

        group.position.y = group.initialPosition.y + Math.cos(time) * 0.1;
        group.rotation.x = group.initialRotation.x + Math.cos(time * 0.25) * 0.02;
        group.rotation.z = group.initialRotation.z + Math.sin(time * 0.5) * 2 * 0.02;
        time += 0.1;
    }

    if (fishGroup) {
        fishGroup.children.forEach((fish) => {
            if (fish.initialPosition === undefined) {
                fish.initialPosition = fish.position.clone();
                fish.initialRotation = fish.rotation.clone();
            }

            //fish.position.y = fish.initialPosition.y + Math.cos(time2) * 0.1;
            fish.rotation.x = fish.initialRotation.x + Math.cos(time2 * 0.25) * 0.02;
            fish.rotation.z = fish.initialRotation.z + Math.sin(time2 * 0.5) * 2 * 0.02;
            fish.rotation.y = fish.initialRotation.y + Math.sin(time2 * 0.25) * (-0.1); 
            time2 += 0.005;
        });
    }

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

        //start the game
        startGame();

        renderer.render(scene, fixedCamera);
    } else {
        stopGame(); // Stop the game if the camera is not fixed
        cameraPivot.position.copy(group.position);

        controls.target.copy(group.position); 
        controls.update();

        renderer.render(scene, camera);

    }
}
