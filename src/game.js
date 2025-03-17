import * as THREE from 'three';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
// import { songNotes, beatsPerMeasure } from './song';
//import ViewControls from './view_controls';

class FishGame {
  constructor(renderer, camera, scene, key, musicDelay) {
    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;
    this.key = key;
    this.musicDelay = musicDelay;

    this.fishModels = [];
    this.fishSpeed = 1.5;  // Adjust for realistic movement
    this.loader = new GLTFLoader();

    this.fishPositions = [-50, -25, 0, 25, 50]; // Fish spawn points
  }

  setup() {
    this.setWindowResizer();
    this.loadFishModels();
    //this.controls = new ViewControls(this.camera, this.renderer);
    this.gameLoop();
  }

  setWindowResizer() {
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });
  }

  loadFishModels() {
    for (let i = 0; i < 5; i++) {
      this.loader.load('models/fish.glb', (gltf) => {
        let fish = gltf.scene;
        fish.scale.set(0.5, 0.5, 0.5);
        fish.position.set(this.fishPositions[i], 0, -500); // Start far away
        this.scene.add(fish);
        this.fishModels.push(fish);
      });
    }
  }

  moveFish() {
    this.fishModels.forEach((fish) => {
      fish.position.z += this.fishSpeed; // Move toward the player
      if (fish.position.z > 10) {
        fish.position.z = -500; // Reset position when too close
      }
    });
  }

  sceneUpdate() {
    this.moveFish();
  }

  sceneRender() {
    this.renderer.render(this.scene, this.camera);
  }

  gameLoop() {
    requestAnimationFrame(this.gameLoop.bind(this));
    this.sceneUpdate();
    this.sceneRender();
  }
}

export default FishGame;
