import * as THREE from 'three';
import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { scene } from "./scene.js";

const loader = new GLTFLoader();
const fishGroup = new THREE.Group();
const fishGroup2 = new THREE.Group();
scene.add(fishGroup);

const boatGroup1 = new THREE.Group();
const boatGroup2 = new THREE.Group();
const boatGroup3 = new THREE.Group();
const boatGroup4 = new THREE.Group();
scene.add(boatGroup1);
scene.add(boatGroup2);
scene.add(boatGroup3);
scene.add(boatGroup4);

let currentBoatGroup = boatGroup1;
const modelCache = new Map(); // For reusable models
let boatModel1, boatModel2, boatModel3, boatModel4;

// Environment containers
const environmentGroup = new THREE.Group();
const decorativeGroup = new THREE.Group();
scene.add(environmentGroup);
scene.add(decorativeGroup);

function enableShadowCasting(model) {
    model.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });
}

async function loadModel(path, position, scale, rotation = [0, 0, 0], parent = scene, cloneable = false) {
    if (modelCache.has(path)) {
        const cached = modelCache.get(path);
        if (cloneable) {
            const instance = cached.clone();
            instance.position.set(...position);
            instance.scale.set(...scale);
            instance.rotation.set(...rotation);
            parent.add(instance);
            return instance;
        }
        return cached;
    }

    return new Promise((resolve) => {
        loader.load(path, (gltf) => {
            const model = gltf.scene;
            model.position.set(...position);
            model.scale.set(...scale);
            model.rotation.set(...rotation);
            enableShadowCasting(model);
            parent.add(model);
            
            // Cache the model if it's reusable
            if (cloneable) {
                modelCache.set(path, model);
            }
            
            resolve(model);
        }, undefined, (error) => console.error(`Error loading ${path}:`, error));
    });
}

async function createInstancesFromCache(path, count, positions, scales, rotations = [], parent = scene) {
    if (!modelCache.has(path)) {
        await new Promise((resolve) => {
            loader.load(path, (gltf) => {
                modelCache.set(path, gltf.scene);
                resolve();
            });
        });
    }

    const sourceModel = modelCache.get(path);
    for (let i = 0; i < count; i++) {
        const instance = sourceModel.clone();
        instance.position.set(...positions[i]);
        instance.scale.set(...(scales[i] || [1, 1, 1]));
        instance.rotation.set(...(rotations[i] || [0, 0, 0]));
        enableShadowCasting(instance);
        parent.add(instance);
    }
}

function createCircularInstances(path, count, radius, scale, yPos = 0, rotation = [0, 0, 0], parent = scene) {
    if (!Array.isArray(rotation)) {
        rotation = [0, 0, 0];
    }
    const positions = [];
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        positions.push([
            radius * Math.cos(angle),
            yPos-30,
            radius * Math.sin(angle)
        ]);
    }
    createInstancesFromCache(path, count, positions, Array(count).fill(scale), Array(count).fill(rotation), parent);
}

export async function swapBoatModel(boatIndex) {
    const boatGroups = [boatGroup1, boatGroup2, boatGroup3, boatGroup4];
    if (boatIndex < 0 || boatIndex >= boatGroups.length) return;

    const currentPosition = currentBoatGroup.position.clone();
    const currentRotation = currentBoatGroup.rotation.clone();

    currentBoatGroup.visible = false;
    currentBoatGroup = boatGroups[boatIndex];
    currentBoatGroup.position.copy(currentPosition);
    currentBoatGroup.rotation.copy(currentRotation);
    currentBoatGroup.visible = true;
}

async function loadBoatAttachments(boatGroup, bugcatPos, ukelelePos, ukeleleRot) { //reusable attachments
    const bugcat = await loadModel("models/bugcat.glb", bugcatPos, [0.1, 0.1, 0.1], [0, 0, 0], boatGroup, true);
    const ukelele = await loadModel("models/ukelele.glb", ukelelePos, [0.1, 0.1, 0.1], ukeleleRot, boatGroup, true);
    return { bugcat, ukelele };
}

async function loadModels() {
    // Load boats (unique models)
    boatModel1 = await loadModel("models/boat1.glb", [0, 3.2, 0], [5, 5, 5], [0, 0, 0], boatGroup1);
    await loadBoatAttachments(boatGroup1, [0, 3.5, 7.5], [-1.25, 4.55, 9.55], [0, 0, -Math.PI/4]);
    
    boatModel2 = await loadModel("models/boat2.glb", [0.5, -1, 6], [15, 15, 15], [0, Math.PI/2, 0], boatGroup2);
    await loadBoatAttachments(boatGroup2, [0, -0.5, 7.5], [-1.25, 0.75, 9.55], [0, 0, -Math.PI/4]);

    boatModel3 = await loadModel("models/boat3.glb", [0, -1.8, -5], [1.3, 1.3, 1.3], [0, 0, 0], boatGroup3);
    await loadBoatAttachments(boatGroup3, [0, 2, 7.5], [-1.25, 3.05, 9.55], [0, 0, -Math.PI/4]);

    boatModel4 = await loadModel("models/boat4.glb", [0, -1, 7], [6, 6, 6], [0, 0, 0], boatGroup4);
    await loadBoatAttachments(boatGroup4, [0, -0.5, 7.5], [-1.25, 0.55, 9.55], [0, 0, -Math.PI/4]);

    boatGroup2.visible = false;
    boatGroup2.position.copy(boatGroup1.position);
    boatGroup2.rotation.copy(boatGroup1.rotation);

    boatGroup3.visible = false;
    boatGroup3.position.copy(boatGroup1.position);
    boatGroup3.rotation.copy(boatGroup1.rotation);

    boatGroup4.visible = false;
    boatGroup4.position.copy(boatGroup1.position);
    boatGroup4.rotation.copy(boatGroup1.rotation);

    // Load environment models (unique structures)
    await Promise.all([
        loadModel("models/bridge.glb", [-480, 15, -175], [150, 150, 150], [0, Math.PI, 0], environmentGroup),
        loadModel("models/dock.glb", [470, 5, 275], [30, 30, 30], [0, Math.PI, 0], environmentGroup),
        loadModel("models/gate.glb", [10, -30, -75], [15, 15, 15], [0, 0, 0], environmentGroup),
    ]);

    // Load reusable decorative elements
    const lilypadPositions = [
        [-200, 0, 0], [350, 0, 0], [-250, 0, 300], [200, 0, -250]
    ];
    await createInstancesFromCache("models/lilypad2.glb", 4, lilypadPositions, Array(4).fill([10, 10, 10]), [], decorativeGroup);

    // Fish with different loading approaches
    const fishPositions = [
        [-100, -10, 0], [150, -4, 50], [140, -2, 200],
        [100, -4, -300], [300, -10, 400], [400, -10, 0],
        [-280, -10, -300], [-250, -7, 400], [50, -10, -400],
        [-330, -10, 120], [-70, -7, 350]
    ];
    const fishScales = [
        [0.05, 0.05, 0.05], [50, 50, 50], [50, 50, 50],
        [50, 50, 50], [0.05, 0.05, 0.05], [0.05, 0.05, 0.05],
        [0.05, 0.05, 0.05], [50, 50, 50], [0.05, 0.05, 0.05],
        [0.05, 0.05, 0.05], [50, 50, 50]
    ];
    const fishModels = [
        "models/koi.glb", "models/koi2.glb", "models/koi2.glb",
        "models/koi2.glb", "models/koi.glb", "models/koi.glb",
        "models/koi.glb", "models/koi2.glb", "models/koi.glb",
        "models/koi.glb", "models/koi2.glb"
    ];
    
    // Batch load fish models
    await Promise.all(fishModels.map((path, i) => 
        loadModel(path, fishPositions[i], fishScales[i], [0, 0, 0], fishGroup, true)
    ));


    function loadFish(path, position, scale, rotation = [0, 0, 0], parent = scene) {
    return new Promise((resolve) => {
        loader.load(path, (gltf) => {
            const model = gltf.scene;
            model.position.set(...position);
            model.scale.set(...scale);
            model.rotation.set(...rotation);
            enableShadowCasting(model);
            parent.add(model);
            resolve(model);
        }, undefined, (error) => console.error(`Error loading ${path}:`, error));
    });
}
    //this sort of fish only loads with the loadFish function
    loadFish("models/koi2.glb", [-60, -2, 80], [50, 50, 50], [0, Math.PI, 0], fishGroup2);
    loadFish("models/koi2.glb", [30, -2, 50], [50, 50, 50], [0, Math.PI, 0], fishGroup2);
    loadFish("models/koi2.glb", [-40, -2, 60], [50, 50, 50], [0, Math.PI, 0], fishGroup2);
    loadFish("models/koi2.glb", [50, -2, 110], [50, 50, 50], [0, Math.PI, 0], fishGroup2);
    loadFish("models/koi2.glb", [-30, -2, 90], [50, 50, 50], [0, Math.PI, 0], fishGroup2);
    loadFish("models/koi2.glb", [60, -2, 80], [50, 50, 50], [0, Math.PI, 0], fishGroup2);

    // Trees and flowers
    const sakuraPositions = [
        [730, -40, -70], [-500, -40, -500], [-545, -40, 520]
    ];
    await createInstancesFromCache("models/sakura.glb", 3, sakuraPositions, Array(3).fill([100, 100, 100]), [], environmentGroup);

    const flowerPositions = [
        [0, -25, -250], [450, -25, 0], [-350, -25, 0]
    ];
    await createInstancesFromCache("models/flower.glb", 3, flowerPositions, Array(3).fill([200, 200, 200]), [], decorativeGroup);

    const toroPositions = [
        [530, -30, -230], [260, -30, 500], [-500, -30, 300], [-300, -30, -380]
    ];
    await createInstancesFromCache("models/toro.glb", 4, toroPositions, Array(4).fill([100, 100, 100]), [], decorativeGroup);

    // Mass vegetation
    createCircularInstances("models/cattail.glb", 10, 700, [30, 30, 30], 0, [0,0,0], decorativeGroup);
    createCircularInstances("models/plant.glb", 8, 600, [50, 50, 50], 0, [0,0,0], decorativeGroup);
}

export { loadModels, fishGroup, fishGroup2, currentBoatGroup };