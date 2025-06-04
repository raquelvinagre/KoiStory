import * as THREE from "three";
import { currentBoatGroup } from "./models.js";

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

const GAME_AREA_RADIUS = 770;
const CENTER = new THREE.Vector3(0, 0, 0);

function moveBoat() {
    if (!currentBoatGroup) return;

    const thrust = new THREE.Vector3();
    currentBoatGroup.getWorldDirection(thrust);
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
        tilting = maxTilt;
    }
    if (keys.d) {
        angularVelocity.y -= turnSpeed;
        tilting = -maxTilt;
    }

    // Apply damping
    velocity.multiplyScalar(drag);
    angularVelocity.y *= angularDrag;

    // Calculate proposed new position
    const newPosition = currentBoatGroup.position.clone().add(velocity);

    // Boundary check - distance from center
    const distanceFromCenter = newPosition.distanceTo(CENTER);
    
    if (distanceFromCenter > GAME_AREA_RADIUS) {
        const pushDirection = CENTER.clone().sub(currentBoatGroup.position).normalize();
        
        const pushStrength = (distanceFromCenter - GAME_AREA_RADIUS) * 0.1;
        velocity.add(pushDirection.multiplyScalar(pushStrength));
        
        velocity.multiplyScalar(0.8);
    } else {
        currentBoatGroup.position.add(velocity);
    }

    // Apply rotation and tilt
    currentBoatGroup.rotation.y += angularVelocity.y;
    currentTilt += (tilting - currentTilt) * tiltSpeed;
    currentBoatGroup.rotation.z = currentTilt;
}

export { moveBoat };
