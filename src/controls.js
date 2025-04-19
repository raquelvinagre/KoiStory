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
button.textContent = "Start Playing";
button.style.position = "absolute";
button.style.top = "10%";
button.style.left = "5%";
button.style.transform = "translate(-50%, 50%)"; // Center the button on the screen
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
        button.textContent = isFixedCamera ? "Switch to Free Mode" : "Start Playing";
    });

    return { cameraPivot, fixedCamera, controls, isFixedCamera };
}

export function updateCamera(group, controls) {
    if (!group) return;

    // Define the coordinates range where the button should be visible
    const minX = -200, maxX = 200;
    const minY = -50, maxY = 50;
    const minZ = -200, maxZ = 200;

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
        group.position.y = 0;
        group.position.x = 0;
        group.position.z = 0;
        group.rotation.y = 0;

        //start the game
        // Title Screen
        let titleScreen = document.getElementById('titleScreen');
        if (!titleScreen) {
          titleScreen = document.createElement('div');
          titleScreen.id = 'titleScreen';
          titleScreen.style.position = 'absolute';
          titleScreen.style.top = '0';
          titleScreen.style.left = '0';
          titleScreen.style.width = '100%';
          titleScreen.style.height = '100%';
          titleScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
          titleScreen.style.display = 'flex';
          titleScreen.style.flexDirection = 'column';
          titleScreen.style.justifyContent = 'center';
          titleScreen.style.alignItems = 'center';
          titleScreen.style.zIndex = '10';
          titleScreen.style.color = 'white';
          titleScreen.style.textAlign = 'center';
          titleScreen.innerHTML = `
            <h1>🎸 Koy Story is rhythm based game!</h1>
            <p>Use headphones for a better experience.</p>
            <p>Hit the correct keys as notes cross the line!</p>
            <p>Place your fingers on the following keys: <strong>D F J K</strong></p>
          `;
        
          const startButton = document.createElement('button');
          startButton.id = 'startButton';
          startButton.innerText = 'I´m Ready to rock';
          startButton.style.padding = '10px 20px';
          startButton.style.fontSize = '18px';
          startButton.style.marginTop = '20px';
          startButton.style.borderRadius = '10px';
          titleScreen.appendChild(startButton);
        
          document.body.appendChild(titleScreen);
        
          startButton.addEventListener('click', () => {
            titleScreen.style.display = 'none';
            runCountdown(() => startGame());
          });
        }
        
        // Countdown text
        let countdownText = document.getElementById('countdownText');
        if (!countdownText) {
          countdownText = document.createElement('div');
          countdownText.id = 'countdownText';
          countdownText.style.position = 'absolute';
          countdownText.style.top = '50%';
          countdownText.style.left = '50%';
          countdownText.style.transform = 'translate(-50%, -50%)';
          countdownText.style.fontSize = '48px';
          countdownText.style.color = 'white';
          countdownText.style.zIndex = '9';
          document.body.appendChild(countdownText);
        }
        
        function runCountdown() {
          let count = 3;
          countdownText.innerText = count;
        
          const countdownInterval = setInterval(() => {
            count--;
            if (count === 0) {
              countdownText.innerText = 'GO!';
            } else if (count < 0) {
              clearInterval(countdownInterval);
              countdownText.innerText = '';
              startGame();
            } else {
              countdownText.innerText = count;
            }
          }, 1000);
        }

        renderer.render(scene, fixedCamera);
    } else {
        stopGame(); // Stop the game if the camera is not fixed
        cameraPivot.position.copy(group.position);

        controls.target.copy(group.position); 
        controls.update();

        renderer.render(scene, camera);

    }
}
