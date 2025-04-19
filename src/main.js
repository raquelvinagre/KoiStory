import { scene, camera, renderer } from "./scene.js";
import { initializeControls, updateCamera } from "./controls.js";
import { loadEnvironment } from "./environment.js";
import { loadModels, group } from "./models.js";
import { moveBoat } from "./movement.js";
import { updateWater } from "./shaders.js";
import { updateNotes } from "./game.js";

//const stats = new Stats();
//document.body.appendChild(stats.dom);

// Title screen container with transparent background
const titleScreen = document.createElement('div');
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
titleScreen.style.zIndex = '999';

// Title container with logo and title side by side
const titleContainer = document.createElement('div');
titleContainer.style.display = 'flex';
titleContainer.style.flexDirection = 'row';
titleContainer.style.alignItems = 'center';
titleContainer.style.backgroundColor = 'rgba(0, 14, 39, 0.9)';
titleContainer.style.padding = '20px 40px';
titleContainer.style.borderRadius = '40px';
titleContainer.style.marginBottom = '20px';
titleContainer.style.gap = '20px'; // spacing between logo and title

const logo = document.createElement('img');
logo.src = 'icons/koi.png';
logo.style.width = '100px';
logo.style.height = '100px';
logo.style.borderRadius = '20px';
logo.style.transition = 'transform 0.3s';
logo.onmouseenter = () => logo.style.transform = 'scale(1.05)';
logo.onmouseleave = () => logo.style.transform = 'scale(1)';

const titleText = document.createElement('h1');
titleText.textContent = 'Koi Story';
titleText.style.color = 'white';
titleText.style.fontSize = '48px';
titleText.style.margin = '0';

titleContainer.appendChild(logo);
titleContainer.appendChild(titleText);
titleScreen.appendChild(titleContainer);

const startButton = document.createElement('button');
startButton.textContent = 'Start Game';
startButton.style.padding = '12px 24px';
startButton.style.fontSize = '20px';
startButton.style.cursor = 'pointer';
startButton.style.borderRadius = '10px';
startButton.style.marginBottom = '20px';
startButton.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
startButton.style.transition = 'background-color 0.3s';

startButton.onmouseenter = () => startButton.style.backgroundColor = 'rgba(203, 239, 255, 0.9).9)';;
startButton.onmouseleave = () => startButton.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';;

titleScreen.appendChild(startButton);

const instructions = document.createElement('p');
instructions.textContent = 'Use the A,W,S,D keys to control the boat, and the mouse to rotate the camera.';
instructions.style.color = 'white';
instructions.style.fontSize = '20px';
instructions.style.marginTop = '10px';
instructions.style.textAlign = 'center';
instructions.style.maxWidth = '600px';
instructions.style.lineHeight = '1.5';
instructions.style.opacity = '0.8';
instructions.style.transition = 'opacity 0.3s';
instructions.onmouseenter = () => instructions.style.opacity = '1';
instructions.onmouseleave = () => instructions.style.opacity = '0.8'; 

titleScreen.appendChild(instructions);

document.body.appendChild(titleScreen);

startButton.addEventListener('click', () => {
  titleScreen.style.display = 'none';
});

// Display coordinates
const infoDiv = document.createElement('div');
infoDiv.style.position = 'absolute';
infoDiv.style.top = '80px';
infoDiv.style.left = '10px';
infoDiv.style.color = 'white';
document.body.appendChild(infoDiv);

let time = 0;

const { controls } = initializeControls(scene);

function animate() {
  requestAnimationFrame(animate);

  moveBoat();
  updateCamera(group, controls);
  updateWater(time);
  updateNotes();  

  //stats.update();

  const groupPosition = group.position;
  infoDiv.innerHTML = `Boat Position: X: ${groupPosition.x.toFixed(2)} Y: ${groupPosition.y.toFixed(2)} Z: ${groupPosition.z.toFixed(2)}`;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize);

// Initialize scene
loadEnvironment();
loadModels();
animate();
