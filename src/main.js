import { scene, camera, renderer } from "./scene.js";
import { initializeControls, updateCamera } from "./controls.js";
import { loadEnvironment } from "./environment.js";
import { loadModels, group, fishGroup } from "./models.js";
import { moveBoat } from "./movement.js";
import { updateWater } from "./shaders.js";

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
let time2 = 0;

const { isFixedCamera, controls } = initializeControls(scene);

function animate() {
    requestAnimationFrame(animate);

    moveBoat();

    updateCamera(group, controls);
    updateWater(time);

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
