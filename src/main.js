import { scene, camera, renderer } from "./scene.js";
import { initializeControls, updateCamera } from "./controls.js";
import { loadEnvironment } from "./environment.js";
import { loadModels, group } from "./models.js";
import { moveBoat } from "./movement.js";
import { updateWater } from "./shaders.js";
import { updateNotes } from "./game.js";

const stats = new Stats();
document.body.appendChild(stats.dom);

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

    // Update FPS
    stats.update();

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
