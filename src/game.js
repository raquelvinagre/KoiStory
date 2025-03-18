import * as THREE from 'three';
import { scene } from './scene.js';

// Create a group for notes
const notesGroup = new THREE.Group();
scene.add(notesGroup);

let notes = [];
let isRunning = false;

// Create or reuse the game status text
let gameStatusText = document.getElementById('gameStatusText');

if (!gameStatusText) {
  gameStatusText = document.createElement('div');
  gameStatusText.id = 'gameStatusText';
  gameStatusText.style.position = 'absolute';
  gameStatusText.style.top = '100px';
  gameStatusText.style.left = '10px';
  gameStatusText.style.color = 'white';
  gameStatusText.style.fontSize = '24px';
  gameStatusText.innerHTML = 'Press Start to Play';
  document.body.appendChild(gameStatusText);
}

function createLines() {
  const linesGroup = new THREE.Group();
  scene.add(linesGroup);
  linesGroup.name = 'linesGroup';

  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const positions = [-9, -3, 3, 9];

  positions.forEach((xPosition) => {
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(xPosition, 3, 80),
      new THREE.Vector3(xPosition, 3, 15)
    ]);
    const line = new THREE.Line(lineGeometry, lineMaterial);
    linesGroup.add(line);
  });
}

// Function to create a note
function createNote(color, xPosition) {
  const geometry = new THREE.SphereGeometry(2, 30, 30);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const note = new THREE.Mesh(geometry, material);

  // Set initial position (ensuring visibility)
  note.position.set(xPosition, 3, 80);  
  notesGroup.add(note);
  notes.push(note);
}

// Function to update notes in the animation loop
function updateNotes() {
  if (!isRunning) return;

  notes.forEach((note) => {
    note.position.z -= 0.5;  // Move towards the camera
    // note.position.y -= 0.23;  // Move downwards
    if (note.position.z <= 20) {  
      // Respawn the note when it passes the camera
      note.position.set(note.position.x, 3, 80);
    }
  });
}

// Start game function
function startGame() {
  if (isRunning) return;
  isRunning = true;
  gameStatusText.innerHTML = 'Game is Running!';

  createLines();

  // Spawn initial notes with different colors and positions
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
  const positions = [-9, -3, 3, 9];
  for (let i = 0; i < 4; i++) {
    createNote(colors[i], positions[i]);
  }
}

// Stop game function
function stopGame() {
  scene.remove(scene.getObjectByName('linesGroup'));
  isRunning = false;
  gameStatusText.innerHTML = 'Game is Stopped!';
  notes.forEach(note => notesGroup.remove(note));
  notes = [];
}

export { startGame, stopGame, updateNotes };
