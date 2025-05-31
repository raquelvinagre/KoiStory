import * as THREE from "three";
import { group } from "./models.js";

const moveSpeed = 0.08;
const turnSpeed = 0.003;
const keys = { w: false, s: false, a: false, d: false };

document.addEventListener("keydown", (event) => {
    if (keys.hasOwnProperty(event.key)) keys[event.key] = true;
});

document.addEventListener("keyup", (event) => {
    if (keys.hasOwnProperty(event.key)) keys[event.key] = false;
});

const velocity = new THREE.Vector3();
const angularVelocity = { y: 0 };
const drag = 0.96; // Lower = more sliding
const angularDrag = 0.88;

const maxTilt = 0.2; // radians (~11 degrees)
const tiltSpeed = 0.05; // how fast the tilt happens
let currentTilt = 0;

function moveBoat() {
    if (!group) return;

    const thrust = new THREE.Vector3();
    group.getWorldDirection(thrust);
    thrust.y = 0;

    if (keys.w) {
        thrust.multiplyScalar(-moveSpeed);
        velocity.add(thrust);
    }
    if (keys.s) {
        thrust.multiplyScalar(moveSpeed);
        velocity.add(thrust);
    }

    let tilting = 0;

    if (keys.a) {
        angularVelocity.y += turnSpeed;
        tilting = maxTilt; // Tilt left
    }
    if (keys.d) {
        angularVelocity.y -= turnSpeed;
        tilting = -maxTilt; // Tilt right
    }

    // Smooth tilt transition
    currentTilt += (tilting - currentTilt) * tiltSpeed;
    group.rotation.z = currentTilt;

    // Apply damping
    velocity.multiplyScalar(drag);
    angularVelocity.y *= angularDrag;

    // Apply movement
    group.position.add(velocity);
    group.rotation.y += angularVelocity.y;
}



export { moveBoat };
