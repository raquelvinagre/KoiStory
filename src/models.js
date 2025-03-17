import * as THREE from 'three';
import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { scene } from "./scene.js";

const loader = new GLTFLoader();
const group = new THREE.Group();
const fishGroup = new THREE.Group();
scene.add(group);
scene.add(fishGroup);

function loadModel(path, position, scale, parent = scene) {
    loader.load(path, (gltf) => {
        const model = gltf.scene;
        model.position.set(...position);
        model.scale.set(...scale);
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
                -20,
                radius * Math.sin(angle)
            );
            instance.scale.set(...scale);
            parent.add(instance);
        }
    }, undefined, (error) => console.error(`Error loading ${path}:`, error));
}

function loadModels() {
    loadModel("models/boat.glb", [0, 3.5, 0], [5, 5, 5], group);
    loadModel("models/bugcat.glb", [0, 3.5, 7.5], [0.1, 0.1, 0.1], group);
    loader.load("models/ukelele.glb", (gltf) => {
        const model = gltf.scene;
        model.position.set(-1.25, 4.55, 9.55);
        model.scale.set(0.1, 0.1, 0.1);
        model.rotation.set(0, 0, -Math.PI/4);
        group.add(model);
    }, undefined, (error) => console.error('Error loading models/ukelele.glb:', error));

    loadModel("models/lilypad2.glb", [-200, 0, 0], [25, 25, 25]);
    loadModel("models/lilypad2.glb", [350, 0, 0], [25, 25, 25]);
    loadModel("models/lilypad2.glb", [-250, 0, 300], [25, 25, 25]);
    loadModel("models/lilypad2.glb", [200, 0, -250], [25, 25, 25]);

    loadModel("models/koi.glb", [-100, -4, 0], [0.05, 0.05, 0.05], fishGroup);
    loadModel("models/koi.glb", [75, -2, 50], [0.05, 0.05, 0.05], fishGroup);
    loadModel("models/koi.glb", [0, -4, 300], [0.05, 0.05, 0.05], fishGroup);
    loadModel("models/koi.glb", [100, 0, -300], [0.05, 0.05, 0.05], fishGroup);
    loadModel("models/koi.glb", [300, -5, 400], [0.05, 0.05, 0.05], fishGroup);
    loadModel("models/koi.glb", [400, 0, 0], [0.05, 0.05, 0.05], fishGroup);
    loadModel("models/koi.glb", [-280, -8, -300], [0.05, 0.05, 0.05], fishGroup);
    loadModel("models/koi.glb", [-250, -7, 400], [0.05, 0.05, 0.05], fishGroup);
    loadModel("models/koi.glb", [50, -5, -400], [0.05, 0.05, 0.05], fishGroup);
    loadModel("models/koi.glb", [-330, 0, 120], [0.05, 0.05, 0.05], fishGroup);
    loadModel("models/koi.glb", [-70, -7, 350], [0.05, 0.05, 0.05], fishGroup);

    loadModel("models/gate.glb", [0, -30, -75], [15, 15, 15]);

    loadModel("models/rock.glb", [200, -30, 200], [20, 20, 20]);
    loadModel("models/rock.glb", [-400, -30, 300], [20, 20, 20]);
    loadModel("models/rock.glb", [600, -30, -100], [20, 20, 20]);
    loadModel("models/rock.glb", [-400, -30, -100], [20, 20, 20]);

    loadModel("models/flower.glb", [50, -1, 300], [150, 150, 150]);
    loadModel("models/flower.glb", [0, -1, -250], [150, 150, 150]);
    loadModel("models/flower.glb", [450, -1, 0], [150, 150, 150]);
    loadModel("models/flower.glb", [-350, -1, 0], [150, 150, 150]);

    createMultipleInstances("models/cattail.glb", 15, 700, [30, 30, 30]);
    createMultipleInstances("models/rock.glb", 10, 600, [20, 20, 20]);

}

export { loadModels, group, fishGroup };
