import * as THREE from 'three';
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";
import { camera, renderer, scene } from "./scene.js";
import { bgMusic, startGame, stopGame, updateFeedbacks } from "./game.js";
import { fishGroup, swapBoatModel } from "./models.js";

let cameraPivot;
let isFixedCamera = false;
const fixedCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let time = 0;
let time2 = 0;
let lastCameraState = null;

let titleScreen;
let countdownText;
let selectedDifficulty = 'medium'; // default

let isDocked = false;

const DOCK_AREA = {
    minX: 300,
    maxX: 530,
    minZ: 100,
    maxZ: 350,
    minY: -10,
    maxY: 10
};

// Button to toggle between fixed and follow camera
const button = document.createElement("div");
button.innerHTML = "<strong>Hit [Space] to start playing</strong>";
button.style.color = "white";
button.style.position = "absolute";
button.style.bottom = "18%";
button.style.left = "50%";
button.style.backgroundColor = 'rgba(14, 12, 97, 0.4)';
button.style.padding = "10px 20px";
button.style.borderRadius = "10px";
button.style.zIndex = "100";
button.style.transform = "translate(-50%, 50%)";
document.body.appendChild(button);
button.style.display = "none";

// Button to visit Koi Store
const dockButton = document.createElement("div");
dockButton.innerHTML = "<strong>Press [E] to visit Koi Store</strong>";
dockButton.style.color = "white";
dockButton.style.position = "absolute";
dockButton.style.bottom = "25%";
dockButton.style.left = "50%";
dockButton.style.backgroundColor = 'rgba(14, 12, 97, 0.4)';
dockButton.style.padding = "10px 20px";
dockButton.style.borderRadius = "10px";
dockButton.style.zIndex = "100";
dockButton.style.transform = "translate(-50%, 50%)";
dockButton.style.display = "none";
document.body.appendChild(dockButton);

const controls = document.createElement("div");
controls.innerHTML = "<strong>Use [A, W, S, D] to control the boat</strong>";
controls.style.position = "absolute";
controls.style.bottom = "20px";
controls.style.right = "30px";
controls.style.color = "white";
controls.style.zIndex = "9";
controls.style.display = "none";
document.body.appendChild(controls);

const escapeText = document.createElement('p');
escapeText.innerHTML = '<strong>Press [Esc] to pause the game</strong>';
escapeText.style.position = 'absolute';
escapeText.style.bottom = '20px';
escapeText.style.left = '30px';
escapeText.style.margin = '0';
escapeText.style.fontSize = '16px';
escapeText.style.color = 'white';
escapeText.style.zIndex = '9';
document.body.appendChild(escapeText);

// Show/hide controls depending on camera mode
function updateControlsVisibility() {
    controls.style.display = isFixedCamera ? "none" : "block";
    escapeText.style.display = isFixedCamera ? "block" : "none";
}

// Call on camera toggle
window.addEventListener("keydown", (event) => {
    if (event.code === "Space" && button.style.display === "block") {
        setTimeout(updateControlsVisibility, 0); // update after camera mode changes
    }
});

const dockSound = new Audio('music/blob.mp3');

let dockedModelIndex = 0;
const dockModelsCount = 4; // Set this to the number of models you want to cycle through

window.addEventListener("keydown", (event) => {
    if (event.code === "KeyE" && dockButton.style.display === "block") {
        dockedModelIndex = (dockedModelIndex + 1) % dockModelsCount;
        swapBoatModel(dockedModelIndex);
        isDocked = dockedModelIndex !== 0;
        dockSound.play();
        if (isDocked) {
            dockButton.innerHTML = `<strong>Press [E] to visit Koi Store</strong>`;
        } else {
            dockButton.innerHTML = "<strong>Press [E] to visit Koi Store</strong>";
        }
    }
});

updateControlsVisibility();

export function initializeControls(sceneInstance) {
    cameraPivot = new THREE.Object3D();
    sceneInstance.add(cameraPivot);

    fixedCamera.position.set(0, 10, 10);
    fixedCamera.lookAt(0, 0, 50);

    camera.position.set(0, 30, 60);
    cameraPivot.add(camera);

    window.addEventListener("keydown", (event) => {
        if (event.code === "Space" && button.style.display === "block") {
            isFixedCamera = !isFixedCamera;
            button.innerHTML = isFixedCamera ? "<strong>Hit [Space] to leave</strong>" : "<strong>Hit [Space] to start playing</strong>";
            if (titleScreen) {
                titleScreen.style.display = 'none';
            }
        }
    });

    return { cameraPivot, fixedCamera, isFixedCamera };
}

function highlightSelectedDifficulty(container, selectedBtn) {
    Array.from(container.children).forEach(btn => {
        btn.style.backgroundColor = '';
        btn.style.color = '';
    });
    selectedBtn.style.backgroundColor = 'rgba(114, 230, 240, 0.83)';
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
        titleScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        titleScreen.style.display = 'flex';
        titleScreen.style.flexDirection = 'column';
        titleScreen.style.justifyContent = 'center';
        titleScreen.style.alignItems = 'center';
        titleScreen.style.zIndex = '10';
        titleScreen.style.color = 'white';
        titleScreen.style.textAlign = 'center';
        titleScreen.innerHTML = `
            <h1>Koi Story is a rhythm based game!</h1>
            <p>Hit the correct keys as notes reach the pads!</p>
            <p>Place your fingers on the following keys: <strong>D F J K</strong></p>
        `;

        const difficultyLabel = document.createElement('p');
        difficultyLabel.innerText = 'Select difficulty';
        difficultyLabel.style.margin = '0 0 8px 0';
        difficultyLabel.style.fontWeight = 'bold';
        difficultyLabel.style.fontSize = '16px';

        const difficultyContainer = document.createElement('div');
        difficultyContainer.style.position = 'absolute';
        difficultyContainer.style.top = '30px';
        difficultyContainer.style.right = '10px';
        difficultyContainer.style.display = 'flex';
        difficultyContainer.style.gap = '10px';
        difficultyContainer.style.flexDirection = 'row';

        ['Easy', 'Medium', 'Hard'].forEach(level => {
            const button = document.createElement('button');
            button.innerText = level;
            button.style.padding = '6px 12px';
            button.style.fontSize = '14px';
            button.style.borderRadius = '5px';
            button.dataset.difficulty = level.toLowerCase();
            button.style.cursor = 'pointer';

            // Highlight Medium by default
            if (level.toLowerCase() === 'medium') {
                button.style.backgroundColor = 'rgba(114, 230, 240, 0.83)';
                button.style.color = 'black';
            }

            button.addEventListener('click', () => {
                selectedDifficulty = button.dataset.difficulty;
                highlightSelectedDifficulty(difficultyContainer, button);
            });

            difficultyContainer.appendChild(button);
        });

        // Container for label and buttons
        const difficultyWrapper = document.createElement('div');
        difficultyWrapper.style.position = 'absolute';
        difficultyWrapper.style.top = '10px';
        difficultyWrapper.style.right = '10px';
        difficultyWrapper.appendChild(difficultyLabel);
        difficultyWrapper.appendChild(difficultyContainer);

        titleScreen.appendChild(difficultyWrapper);

        const startButton = document.createElement('button');
        startButton.id = 'startButton';
        startButton.innerText = 'I´m ready to rock';
        startButton.style.padding = '10px 20px';
        startButton.style.fontSize = '18px';
        startButton.style.marginTop = '20px';
        startButton.style.borderRadius = '10px';
        startButton.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        startButton.style.cursor = 'pointer';
        startButton.onmouseenter = () => startButton.style.backgroundColor = 'rgba(203, 239, 255, 0.9).9)';;
        startButton.onmouseleave = () => startButton.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';;
        titleScreen.appendChild(startButton);

        document.body.appendChild(titleScreen);

        startButton.addEventListener('click', () => {
            titleScreen.style.display = 'none';
            runCountdown();
        });

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
            startGame('medium');
    }
}


let countdownInterval = null;
let countdownStopped = false;

function runCountdown() {
    bgMusic.pause();
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

export function updateCamera(currentBoatGroup) {
    if (!currentBoatGroup) return;

    const minX = -200, maxX = 200;
    const minY = -50, maxY = 50;
    const minZ = -200, maxZ = 200;

    // Boat rocking logic
    if (currentBoatGroup.initialPosition === undefined) {
        currentBoatGroup.initialPosition = currentBoatGroup.position.clone();
        currentBoatGroup.initialRotation = currentBoatGroup.rotation.clone();
    }

    currentBoatGroup.position.y = currentBoatGroup.initialPosition.y + Math.cos(time) * 0.1;
    currentBoatGroup.rotation.x = currentBoatGroup.initialRotation.x + Math.cos(time * 0.25) * 0.02;
    currentBoatGroup.rotation.z = currentBoatGroup.initialRotation.z + Math.sin(time * 0.5) * 2 * 0.02;
    time += 0.1;

    // Fish rocking logic + circular movement
    if (fishGroup) {
        fishGroup.children.forEach((fish, i) => {
            if (fish.initialPosition === undefined) {
                fish.initialPosition = fish.position.clone();
                fish.initialRotation = fish.rotation.clone();
            }

            // Rocking animation
            fish.rotation.x = fish.initialRotation.x + Math.cos(time2 * 0.25 + i) * 0.2;
            fish.rotation.z = fish.initialRotation.z + Math.sin(time2 * 0.6 + i) * 2 * 0.05;
            fish.rotation.y = fish.initialRotation.y + Math.sin(time2 * 0.05 + i) * (-0.01);

            // Circular movement
            const radius = 5 + i * 2;
            const speed = 0.5 + i * 0.1;

            // Previous position for direction calculation
            if (!fish.prevCircularPos) {
                fish.prevCircularPos = new THREE.Vector3(
                    fish.initialPosition.x + Math.cos(time2 * speed + i) * radius,
                    fish.position.y,
                    fish.initialPosition.z + Math.sin(time2 * speed + i) * radius
                );
            }

            // Calculate new position
            const newX = fish.initialPosition.x + Math.cos(time2 * speed + i) * radius;
            const newZ = fish.initialPosition.z + Math.sin(time2 * speed + i) * radius;

            // Set position
            fish.position.x = newX;
            fish.position.z = newZ;

            // Calculate direction vector
            const dir = new THREE.Vector3(
                newX - fish.prevCircularPos.x,
                0,
                newZ - fish.prevCircularPos.z
            );
            if (dir.lengthSq() > 0.0001) {
                dir.normalize();
                const angle = Math.atan2(dir.x, dir.z);
                fish.rotation.y = angle;
            }

            // Store current position for next frame
            fish.prevCircularPos.set(newX, fish.position.y, newZ);

            time2 += 0.001;
        });
    }

    // Show button if within boundaries
    const boatPosition = currentBoatGroup.position;
    if (boatPosition.x >= minX && boatPosition.x <= maxX &&
        boatPosition.y >= minY && boatPosition.y <= maxY &&
        boatPosition.z >= minZ && boatPosition.z <= maxZ) {
        button.style.display = "block";
    } else {
        button.style.display = "none";
    }

    // Show dock button if within dock boundaries
    const inDockArea = (
        boatPosition.x >= DOCK_AREA.minX &&
        boatPosition.x <= DOCK_AREA.maxX &&
        boatPosition.z >= DOCK_AREA.minZ &&
        boatPosition.z <= DOCK_AREA.maxZ &&
        boatPosition.y >= DOCK_AREA.minY &&
        boatPosition.y <= DOCK_AREA.maxY
    );

    dockButton.style.display = inDockArea ? "block" : "none";

    // Show regular button if within regular boundaries
    const inRegularArea = (
        boatPosition.x >= minX &&
        boatPosition.x <= maxX &&
        boatPosition.z >= minZ &&
        boatPosition.z <= maxZ &&
        boatPosition.y >= minY &&
        boatPosition.y <= maxY
    );
    button.style.display = inRegularArea ? "block" : "none";

    if (isFixedCamera) {
        if (lastCameraState !== true) {
            createTitleScreen();
            lastCameraState = true;
        }

        currentBoatGroup.position.set(0, 0, 0);
        currentBoatGroup.rotation.y = 0;

        updateFeedbacks(fixedCamera, renderer);
        renderer.render(scene, fixedCamera);
    } else {
        if (lastCameraState !== false) {
            stopGame();
            lastCameraState = false;
        }

        const cameraOffset = new THREE.Vector3(0, 24, -60);
        const boatDirection = new THREE.Vector3();
        currentBoatGroup.getWorldDirection(boatDirection);
        boatDirection.y = 0;

        const behindDirection = boatDirection.clone().multiplyScalar(-cameraOffset.z);
        const finalCameraPos = currentBoatGroup.position.clone()
            .add(behindDirection)
            .add(new THREE.Vector3(0, cameraOffset.y, 0));

        camera.position.lerp(finalCameraPos, 0.1);
        camera.lookAt(currentBoatGroup.position);

        renderer.render(scene, camera);
    }
}


export { selectedDifficulty, isFixedCamera };