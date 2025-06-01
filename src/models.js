import * as THREE from 'three';
import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { scene } from "./scene.js";

const loader = new GLTFLoader();
const group = new THREE.Group();
const fishGroup = new THREE.Group();
const fishGroup2 = new THREE.Group();
scene.add(group);
scene.add(fishGroup);

function enableShadowCasting(model) {
    model.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });
}

function loadModel(path, position, scale, parent = scene) {
    loader.load(path, (gltf) => {
        const model = gltf.scene;
        model.position.set(...position);
        model.scale.set(...scale);
        enableShadowCasting(model);
        parent.add(model);
    }, undefined, (error) => console.error(`Error loading ${path}:`, error));
}

function loadFish(path, position, scale, parent = scene) { //the fish from the concert need to be rotated
    loader.load(path, (gltf) => {
        const model = gltf.scene;
        model.position.set(...position);
        model.scale.set(...scale);
        model.rotation.y = Math.PI; 
        enableShadowCasting(model);
        parent.add(model);
    }, undefined, (error) => console.error(`Error loading ${path}:`, error));
}

function loadBridge(path, position, scale, parent = scene) { //the fish from the concert need to be rotated
    loader.load(path, (gltf) => {
        const model = gltf.scene;
        model.position.set(...position);
        model.scale.set(...scale);
        model.rotation.y = Math.PI; 
        enableShadowCasting(model);
        parent.add(model);
    }, undefined, (error) => console.error(`Error loading ${path}:`, error));
}

function loadDock(path, position, scale, parent = scene) { //the fish from the concert need to be rotated
    loader.load(path, (gltf) => {
        const model = gltf.scene;
        model.position.set(...position);
        model.scale.set(...scale);
        model.rotation.y = Math.PI; 
        enableShadowCasting(model);
        parent.add(model);
    }, undefined, (error) => console.error(`Error loading ${path}:`, error));
}


function createMultipleInstances(path, count, radius, scale, parent = scene) {
    loader.load(path, (gltf) => {
        for (let i = 0; i < count; i++) {
            const instance = gltf.scene.clone();
            const angle = (i / count) * Math.PI * 2;
            instance.position.set(
                radius * Math.cos(angle),
                -30,
                radius * Math.sin(angle)
            );
            instance.scale.set(...scale);
            enableShadowCasting(instance);
            parent.add(instance);
        }
    }, undefined, (error) => console.error(`Error loading ${path}:`, error));
}

function loadModels() {
    loadModel("models/boat.glb", [0, 3.2, 0], [5, 5, 5], group);
    loadModel("models/bugcat.glb", [0, 3.5, 7.5], [0.1, 0.1, 0.1], group);
    loader.load("models/ukelele.glb", (gltf) => {
        const model = gltf.scene;
        model.position.set(-1.25, 4.55, 9.55);
        model.scale.set(0.1, 0.1, 0.1);
        model.rotation.set(0, 0, -Math.PI/4);
        enableShadowCasting(model);
        group.add(model);
    }, undefined, (error) => console.error('Error loading models/ukelele.glb:', error));

    loadBridge("models/bridge.glb", [-480, 15, -175], [150, 150, 150]);

    loadDock("models/dock.glb", [470, 5, 275], [30, 30, 30]);
 
    loadModel("models/lilypad2.glb", [-200, 0, 0], [10, 10, 10]);
    loadModel("models/lilypad2.glb", [350, 0, 0], [10, 10, 10]);
    loadModel("models/lilypad2.glb", [-250, 0, 300], [10, 10, 10]);
    loadModel("models/lilypad2.glb", [200, 0, -250], [10, 10, 10]);

    loadModel("models/koi.glb", [-100, -10, 0], [0.05, 0.05, 0.05], fishGroup);
    loadModel("models/koi2.glb", [150, -4, 50], [50, 50, 50], fishGroup);
    loadModel("models/koi2.glb", [140, -2, 200], [50, 50, 50], fishGroup);
    loadModel("models/koi2.glb", [100, -4, -300], [50, 50, 50], fishGroup);
    loadModel("models/koi.glb", [300, -10, 400], [0.05, 0.05, 0.05], fishGroup);
    loadModel("models/koi.glb", [400, -10, 0], [0.05, 0.05, 0.05], fishGroup);
    loadModel("models/koi.glb", [-280, -10, -300], [0.05, 0.05, 0.05], fishGroup);
    loadModel("models/koi2.glb", [-250, -7, 400], [50, 50, 50], fishGroup);
    loadModel("models/koi.glb", [50, -10, -400], [0.05, 0.05, 0.05], fishGroup);
    loadModel("models/koi.glb", [-330, -10, 120], [0.05, 0.05, 0.05], fishGroup);
    loadModel("models/koi2.glb", [-70, -7, 350], [50, 50, 50], fishGroup);

    loadFish("models/koi2.glb", [-60, -2, 80], [50, 50, 50], fishGroup2);
    loadFish("models/koi2.glb", [30, -2, 50], [50, 50, 50], fishGroup2);
    loadFish("models/koi2.glb", [-40, -2, 60], [50, 50, 50], fishGroup2);
    loadFish("models/koi2.glb", [50, -2, 110], [50, 50, 50], fishGroup2);
    loadFish("models/koi2.glb", [-30, -2, 90], [50, 50, 50], fishGroup2);
    loadFish("models/koi2.glb", [60, -2, 80], [50, 50, 50], fishGroup2);
    
    loadModel("models/gate.glb", [10, -30, -75], [15, 15, 15]);

    loadModel("models/sakura.glb", [730, -40, -70], [100, 100, 100]);
    loadModel("models/sakura.glb", [-500, -40, -500], [100, 100, 100]);
    loadModel("models/sakura.glb", [-545, -40, 520], [100, 100, 100]);

    loadModel("models/flower.glb", [0, -25, -250], [200, 200, 200]);
    loadModel("models/flower.glb", [450, -25, 0], [200, 200, 200]);
    loadModel("models/flower.glb", [-350, -25, 0], [200, 200, 200]);

    createMultipleInstances("models/cattail.glb", 15, 700, [30, 30, 30]);
    createMultipleInstances("models/plant.glb", 8, 600, [50, 50, 50]);

}

export { loadModels, group, fishGroup, fishGroup2 };
