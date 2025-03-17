import * as THREE from "three";
import { group } from "./models.js";

const moveSpeed = 5;
const turnSpeed = 0.05;
const keys = { w: false, s: false, a: false, d: false };

document.addEventListener("keydown", (event) => {
    if (keys.hasOwnProperty(event.key)) keys[event.key] = true;
});

document.addEventListener("keyup", (event) => {
    if (keys.hasOwnProperty(event.key)) keys[event.key] = false;
});

function moveBoat() {
    if (!group) return;
    const direction = new THREE.Vector3();
    group.getWorldDirection(direction);
    if (keys.w) group.position.addScaledVector(direction, -moveSpeed);
    if (keys.s) group.position.addScaledVector(direction, moveSpeed);
    if (keys.a) group.rotation.y += turnSpeed;
    if (keys.d) group.rotation.y -= turnSpeed;
}

export { moveBoat };
