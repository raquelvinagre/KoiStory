import * as THREE from 'three';
import { scene } from './scene.js';

const notesGroup = new THREE.Group();
const fretsGroup = new THREE.Group();
const hitPadsGroup = new THREE.Group();

scene.add(notesGroup);
scene.add(fretsGroup);
scene.add(hitPadsGroup);

let notes = [];
let frets = [];
let hitPads = [];
let noteSpawnTimeouts = [];
let isRunning = false;
let score = 0;
const heldKeys = new Set();

const HIT_ZONE_Z = 21;
const HIT_THRESHOLD = 5;

const laneData = [
  { x: 9, color: 0x588af9, key: 'd' },
  { x: 3, color: 0x48cd74, key: 'f' },
  { x: -3,  color: 0xffbeee, key: 'j' }, 
  { x: -9,  color: 0xbb5324, key: 'k' }
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
  document.body.appendChild(gameStatusText);
}

let scoreText = document.getElementById('scoreText');
if (!scoreText) {
  scoreText = document.createElement('div');
  scoreText.id = 'scoreText';
  scoreText.style.position = 'absolute';
  scoreText.style.top = '130px';
  scoreText.style.left = '10px';
  scoreText.style.color = 'white';
  scoreText.style.fontSize = '20px';
  scoreText.innerHTML = `Score: ${score}`;
  document.body.appendChild(scoreText);
}

let audio = document.getElementById('bgAudio');
if (!audio) {
  audio = document.createElement('audio');
  audio.id = 'bgAudio';
  audio.src = 'music/song.mp3';
  audio.preload = 'auto';
  audio.style.display = 'none';
  document.body.appendChild(audio);
}

function createLines() {
  const linesGroup = new THREE.Group();
  scene.add(linesGroup);
  linesGroup.name = 'linesGroup';

  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

  laneData.forEach((lane) => {
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(lane.x, 3, 80),
      new THREE.Vector3(lane.x, 3, 20)
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
  fret.position.z = 80;
  fretsGroup.add(fret);
  frets.push(fret);
}

function createHitPads() {
  hitPads = [];

  laneData.forEach(({ x, color }) => {
    const geometry = new THREE.CylinderGeometry(2, 2, 0.5, 32);
    const material = new THREE.MeshBasicMaterial({ color });
    const pad = new THREE.Mesh(geometry, material);

    pad.position.set(x, 3, HIT_ZONE_Z);
    hitPadsGroup.add(pad);
    hitPads.push(pad);
  });
}

function animateHitPad(laneIndex) {
  const pad = hitPads[laneIndex];
  if (!pad) return;

  const jumpHeight = 1;
  const jumpSpeed = 0.1;
  let goingUp = true;

  function jump() {
    if (goingUp) {
      pad.position.y += jumpSpeed;
      if (pad.position.y >= 3 + jumpHeight) goingUp = false;
    } else {
      pad.position.y -= jumpSpeed;
      if (pad.position.y <= 3) {
        pad.position.y = 3;
        return;
      }
    }
    requestAnimationFrame(jump);
  }

  jump();
}

function createNote(laneIndex, length = 0) {
  const { x, color } = laneData[laneIndex];

  const headGeometry = new THREE.SphereGeometry(2, 30, 30);
  const headMaterial = new THREE.MeshBasicMaterial({ color });
  const note = new THREE.Mesh(headGeometry, headMaterial);
  note.position.set(x, 3, 80);
  note.userData = { laneIndex, length, holding: false, heldScore: 0 };

  if (length > 0) {
    const tailGeometry = new THREE.BoxGeometry(2, 0.8, length);
    const tailMaterial = new THREE.MeshBasicMaterial({ color, opacity: 0.8, transparent: true });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, 0, length / 2);
    note.add(tail);
  }

  notesGroup.add(note);
  notes.push(note);
  createFretLine();
}

function updateNotes() {
  if (!isRunning) return;

  for (let i = notes.length - 1; i >= 0; i--) {
    const note = notes[i];
    note.position.z -= 0.5;

    const laneIndex = note.userData.laneIndex;
    const length = note.userData.length;
    const endZ = HIT_ZONE_Z - length;

    if (length > 0 && heldKeys.has(laneData[laneIndex].key)) {
      if (note.position.z <= HIT_ZONE_Z && note.position.z >= endZ) {
        note.userData.heldScore += 1;
      }
    }

    if (note.position.z <= 20 - length) {
      score += note.userData.heldScore;
      notesGroup.remove(note);
      notes.splice(i, 1);
      scoreText.innerHTML = `Score: ${score}`;
    }
  }

  for (let i = frets.length - 1; i >= 0; i--) {
    const fret = frets[i];
    fret.position.z -= 0.5;
    if (fret.position.z <= 20) {
      fretsGroup.remove(fret);
      frets.splice(i, 1);
    }
  }
}

function handleKeyPress(event) {
  if (!isRunning) return;
  const key = event.key.toLowerCase();
  heldKeys.add(key);

  const laneIndex = laneData.findIndex(lane => lane.key === key);
  if (laneIndex === -1) return;

  for (let i = 0; i < notes.length; i++) {
    const note = notes[i];
    if (note.userData.laneIndex === laneIndex) {
      const z = note.position.z;
      if (Math.abs(z - HIT_ZONE_Z) <= HIT_THRESHOLD) {
        if (note.userData.length === 0) {
          notesGroup.remove(note);
          notes.splice(i, 1);
          score += 100;
          scoreText.innerHTML = `Score: ${score}`;
        } else {
          note.userData.holding = true;
        }
        break;
      }
    }
  }
  animateHitPad(laneIndex);
}

function handleKeyUp(event) {
  const key = event.key.toLowerCase();
  heldKeys.delete(key);
}

let currentTime = 0;

function loadNoteMapAndStart(filePath = 'music/note_map.json') {
  fetch(filePath)
    .then(response => response.json())
    .then(noteMap => {
      noteMap.sort((a, b) => a.time - b.time);  // Ensure notes are in time order
      let currentNoteIndex = 0;

      const intervalId = setInterval(() => {
        // Get the next note to be played
        const note = noteMap[currentNoteIndex];
        if (note) {
          const delay = note.time * 500;
          
          if (currentTime >= note.time) {
            createNote(note.lane, note.length || 0);
            currentNoteIndex++;  // Move to next note in the array
          }
        } else {
          // If there are no more notes to process, clear the interval
          clearInterval(intervalId);
        }
        currentTime += 0.1;  // Increment current time
      }, 100);  // Check every 100ms

      setTimeout(() => {
        audio.currentTime = 0;
        audio.play();
      }, 1);
    })
    .catch(err => console.error("Error loading note map:", err));
}



function startGame() {
  if (isRunning) return;
  isRunning = true;
  score = 0;
  scoreText.innerHTML = `Score: ${score}`;
  createLines();
  createFretLine();
  createHitPads();
  loadNoteMapAndStart();
  document.addEventListener('keydown', handleKeyPress);
  document.addEventListener('keyup', handleKeyUp);
}

function stopGame() {
  scene.remove(scene.getObjectByName('linesGroup'));
  isRunning = false;
  audio.pause();
  audio.currentTime = 0;
  noteSpawnTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
  noteSpawnTimeouts = [];
  notes.forEach(note => notesGroup.remove(note));
  frets.forEach(fret => fretsGroup.remove(fret));
  notes = [];
  frets = [];
  hitPads.forEach(pad => hitPadsGroup.remove(pad));
  hitPads = [];
  heldKeys.clear();
  document.removeEventListener('keydown', handleKeyPress);
  document.removeEventListener('keyup', handleKeyUp);
}

export { startGame, stopGame, updateNotes };
