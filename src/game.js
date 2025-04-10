import * as THREE from 'three';
import { scene } from './scene.js';

const notesGroup = new THREE.Group();
const fretsGroup = new THREE.Group();
scene.add(notesGroup);
scene.add(fretsGroup);

let notes = [];
let frets = [];
let noteSpawnTimeouts = [];
let isRunning = false;

const laneData = [
  { x: -9, color:  0x0000ff }, // Blue
  { x: -3, color:  0x00ff00 }, // Green
  { x: 3,  color:  0xffff00 }, // Yellow  
  { x: 9,  color:  0xff0000 }  // Red
];

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

  laneData.forEach((lane) => {
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(lane.x, 3, 80),
      new THREE.Vector3(lane.x, 3, 15)
    ]);
    const line = new THREE.Line(lineGeometry, lineMaterial);
    linesGroup.add(line);
  });
}

function createFretLine() {
  const material = new THREE.LineBasicMaterial({ color: 0xffffff });
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-9, 3, 0),
    new THREE.Vector3(9, 3, 0)
  ]);
  const fret = new THREE.Line(geometry, material);
  fret.position.z = 80; // start far away like notes
  fretsGroup.add(fret);
  frets.push(fret);
}

function createNote(laneIndex) {
  const { x, color } = laneData[laneIndex];
  const geometry = new THREE.SphereGeometry(2, 30, 30);
  const material = new THREE.MeshBasicMaterial({ color });
  const note = new THREE.Mesh(geometry, material);
  note.position.set(x, 3, 80);
  notesGroup.add(note);
  notes.push(note);

  // Add a fret line when a note is created
  createFretLine();
}

function updateNotes() {
  if (!isRunning) return;

  // Move notes
  for (let i = notes.length - 1; i >= 0; i--) {
    const note = notes[i];
    note.position.z -= 0.5;

    if (note.position.z <= 18) {
      notesGroup.remove(note);
      notes.splice(i, 1);
    }
  }

  // Move fret lines
  for (let i = frets.length - 1; i >= 0; i--) {
    const fret = frets[i];
    fret.position.z -= 0.5;

    if (fret.position.z <= 18) {
      fretsGroup.remove(fret);
      frets.splice(i, 1);
    }
  }
}

function startNoteSpawning() {
  function spawnNoteLoop() {
    if (!isRunning) return;

    const laneIndex = Math.floor(Math.random() * laneData.length);
    createNote(laneIndex);

    const delay = 300 + Math.random() * 1200;
    const timeoutId = setTimeout(spawnNoteLoop, delay);
    noteSpawnTimeouts.push(timeoutId);
  }

  spawnNoteLoop();
}

function startGame() {
  if (isRunning) return;
  isRunning = true;
  gameStatusText.innerHTML = 'Game is Running!';
  createLines();
  startNoteSpawning();
}

function stopGame() {
  scene.remove(scene.getObjectByName('linesGroup'));
  isRunning = false;
  gameStatusText.innerHTML = 'Game is Stopped!';

  noteSpawnTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
  noteSpawnTimeouts = [];

  notes.forEach(note => notesGroup.remove(note));
  notes = [];

  frets.forEach(fret => fretsGroup.remove(fret));
  frets = [];
}

export { startGame, stopGame, updateNotes };
