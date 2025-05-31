import * as THREE from 'three';
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";
import { camera, renderer, scene } from "./scene.js"; 
import { startGame, stopGame, updateFeedbacks } from "./game.js";
import { fishGroup } from "./models.js";    

let cameraPivot;  
let isFixedCamera = false;
const fixedCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let time = 0;
let time2 = 0;
let lastCameraState = null;

let titleScreen;
let countdownText;
let selectedDifficulty = 'hard'; // default

// Button to toggle between fixed and follow camera
const button = document.createElement("div");
button.innerHTML = "<strong>Hit Space to Start Playing</strong>";
button.style.color = "white";
button.style.position = "absolute";
button.style.bottom = "20%";
button.style.left = "50%";
button.style.transform = "translate(-50%, 50%)";
document.body.appendChild(button);
button.style.display = "none";

export function initializeControls(sceneInstance) {
    cameraPivot = new THREE.Object3D();
    sceneInstance.add(cameraPivot);  

    fixedCamera.position.set(0, 10, 10);
    fixedCamera.lookAt(0, 0, 50);

    camera.position.set(0, 30, 60);
    cameraPivot.add(camera);  

    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.1;

    window.addEventListener("keydown", (event) => {
        if (event.code === "Space" && button.style.display === "block") {
            isFixedCamera = !isFixedCamera;
            button.innerHTML = isFixedCamera ? "<strong>Hit Space to Leave</strong>" : "<strong>Hit Space to Start Playing</strong>";
            titleScreen.style.display = 'none';
        }
    });

    return { cameraPivot, fixedCamera, isFixedCamera };
}

function highlightSelectedDifficulty(container, selectedBtn) {
    Array.from(container.children).forEach(btn => {
        btn.style.backgroundColor = '';
        btn.style.color = '';
    });
    selectedBtn.style.backgroundColor = '#afd2dc';
    selectedBtn.style.color = 'black';
}

function createTitleScreen() {
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
            <h1>🎸 Koy Story is a rhythm based game!</h1>
            <p>Use headphones for a better experience.</p>
            <p>Hit the correct keys as notes cross the line!</p>
            <p>Place your fingers on the following keys: <strong>D F J K</strong></p>
        `;

        const difficultyContainer = document.createElement('div');
        difficultyContainer.style.position = 'absolute';
        difficultyContainer.style.top = '10px';
        difficultyContainer.style.right = '10px';
        difficultyContainer.style.display = 'flex';
        difficultyContainer.style.gap = '10px';

        ['Easy', 'Medium', 'Hard'].forEach(level => {
            const button = document.createElement('button');
            button.innerText = level;
            button.style.padding = '6px 12px';
            button.style.fontSize = '14px';
            button.style.borderRadius = '5px';
            button.dataset.difficulty = level.toLowerCase();

            button.addEventListener('click', () => {
                selectedDifficulty = button.dataset.difficulty;
                highlightSelectedDifficulty(difficultyContainer, button);
            });

            difficultyContainer.appendChild(button);
        });

        titleScreen.appendChild(difficultyContainer);


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
            runCountdown();
        });
        // window.addEventListener('keydown', (event) => {
        // if (event.code === 'Space' && titleScreen.style.display !== 'none') {
        //     titleScreen.style.display = 'none';
        //     runCountdown();
        // }
        // });

    } else {
        titleScreen.style.display = 'flex';
    }
}

function createCountdownText() {
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
}

function startGameWithDifficulty(difficulty) {
    switch (difficulty) {
        case 'easy':
            startGame('easy');
            break;
        case 'medium':
            startGame('medium');
            break;
        case 'hard':
            startGame('hard');
            break;
        default:
            startGame('hard');
    }
}


let countdownInterval = null;
let countdownStopped = false;

function runCountdown() {
    createCountdownText();
    let count = 3;
    countdownStopped = false;
    countdownText.innerText = count;

    // Listen for space to stop countdown
    function onSpaceDown(event) {
        if (event.code === "Space") {
            countdownStopped = true;
            clearInterval(countdownInterval);
            countdownText.innerText = '';
            window.removeEventListener("keydown", onSpaceDown);
        }
    }
    window.addEventListener("keydown", onSpaceDown);

    countdownInterval = setInterval(() => {
        if (countdownStopped) {
            clearInterval(countdownInterval);
            return;
        }
        count--;
        if (count === 0) {
            countdownText.innerText = 'GO!';
        } else if (count < 0) {
            clearInterval(countdownInterval);
            countdownText.innerText = '';
            window.removeEventListener("keydown", onSpaceDown);
            startGameWithDifficulty(selectedDifficulty);
        } else {
            countdownText.innerText = count;
        }
    }, 1000);
}

export function updateCamera(group) {
    if (!group) return;

    const minX = -200, maxX = 200;
    const minY = -50, maxY = 50;
    const minZ = -200, maxZ = 200;

    // Boat rocking logic
    if (group.initialPosition === undefined) {
        group.initialPosition = group.position.clone();
        group.initialRotation = group.rotation.clone();
    }

    group.position.y = group.initialPosition.y + Math.cos(time) * 0.1;
    group.rotation.x = group.initialRotation.x + Math.cos(time * 0.25) * 0.02;
    group.rotation.z = group.initialRotation.z + Math.sin(time * 0.5) * 2 * 0.02;
    time += 0.1;

    // Fish rocking logic
    if (fishGroup) {
        fishGroup.children.forEach((fish) => {
            if (fish.initialPosition === undefined) {
                fish.initialPosition = fish.position.clone();
                fish.initialRotation = fish.rotation.clone();
            }

            fish.rotation.x = fish.initialRotation.x + Math.cos(time2 * 0.25) * 0.2;
            fish.rotation.z = fish.initialRotation.z + Math.sin(time2 * 0.6) * 2 * 0.05;
            fish.rotation.y = fish.initialRotation.y + Math.sin(time2 * 0.25) * (-0.1); 
            time2 += 0.005;
        });
    }

    // Show button if within boundaries
    const boatPosition = group.position;
    if (boatPosition.x >= minX && boatPosition.x <= maxX &&
        boatPosition.y >= minY && boatPosition.y <= maxY &&
        boatPosition.z >= minZ && boatPosition.z <= maxZ) {
        button.style.display = "block";
    } else {
        button.style.display = "none";
    }

    if (isFixedCamera) {
        if (lastCameraState !== true) {
            createTitleScreen();
            lastCameraState = true;
        }

        group.position.set(0, 0, 0);
        group.rotation.y = 0;

        updateFeedbacks(fixedCamera, renderer);
        renderer.render(scene, fixedCamera);
    } else {
        if (lastCameraState !== false) {
            stopGame();
            lastCameraState = false;
        }

        // 🚨 Replace orbit controls with directional camera logic
        const cameraOffset = new THREE.Vector3(0, 27, -70); // Above and behind the boat
        const boatDirection = new THREE.Vector3();
        group.getWorldDirection(boatDirection);
        boatDirection.y = 0;

        const behindDirection = boatDirection.clone().multiplyScalar(-cameraOffset.z);
        const finalCameraPos = group.position.clone()
            .add(behindDirection)
            .add(new THREE.Vector3(0, cameraOffset.y, 0));

        camera.position.lerp(finalCameraPos, 0.1); // Smooth camera follow
        camera.lookAt(group.position);

        renderer.render(scene, camera);
    }
}


export { selectedDifficulty };