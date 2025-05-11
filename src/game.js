import * as THREE from 'three';
import { scene } from './scene.js';
import { fishGroup2 } from './models.js';

const notesGroup = new THREE.Group();
const fretsGroup = new THREE.Group();
const hitPadsGroup = new THREE.Group();
const feedbackGroup = new THREE.Group();

scene.add(notesGroup);
scene.add(fretsGroup);
scene.add(hitPadsGroup);
scene.add(feedbackGroup);

let time2 = 0;
let notes = [];
let frets = [];
let hitPads = [];
let noteSpawnTimeouts = [];
let isRunning = false;
let score = 0;
const heldKeys = new Set();
const feedbacks = [];
const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');

const HIT_ZONE_Z = 21;
const HIT_THRESHOLD = 5;

const laneData = [
  { x: 9, color: 0x588af9, key: 'd' },
  { x: 3, color: 0x60d25d, key: 'f' },
  { x: -3,  color: 0xfcac5d, key: 'j' }, 
  { x: -9,  color: 0xf48197, key: 'k' }
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

let leaderboardDiv = document.getElementById('leaderboard');
if (!leaderboardDiv) {
  leaderboardDiv = document.createElement('div');
  leaderboardDiv.id = 'leaderboard';
  leaderboardDiv.style.position = 'absolute';
  leaderboardDiv.style.top = '160px';
  leaderboardDiv.style.left = '10px';
  leaderboardDiv.style.color = 'white';
  leaderboardDiv.style.fontSize = '18px';
  leaderboardDiv.innerHTML = '<strong>Leaderboard:</strong>';
  document.body.appendChild(leaderboardDiv);
}

function updateLeaderboard() {
  leaderboardDiv.innerHTML = '<strong>Leaderboard:</strong><br>' + leaderboard
    .map((s, i) => `${i + 1}. ${s}`)
    .join('<br>');
}

updateLeaderboard();

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

function showFeedback(text, position, color = 'white') {
  const div = document.createElement('div');
  div.innerText = text;
  div.style.position = 'absolute';
  div.style.color = color;
  div.style.fontSize = '20px';
  div.style.fontWeight = 'bold';
  div.style.pointerEvents = 'none';
  div.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
  div.style.opacity = 1;
  div.style.transform = 'translateY(0px)';
  document.body.appendChild(div);

  const feedback = { div, position, time: performance.now() };
  feedbacks.push(feedback);
}

function updateFeedbacks(camera, renderer) {
  const now = performance.now();
  for (let i = feedbacks.length - 1; i >= 0; i--) {
    const fb = feedbacks[i];
    const elapsed = now - fb.time;

    if (elapsed > 800) {
      fb.div.remove();
      feedbacks.splice(i, 1);
      continue;
    }

    const screenPos = fb.position.clone().project(camera);
    const x = (screenPos.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
    const y = (-screenPos.y * 0.5 + 0.5) * renderer.domElement.clientHeight;

    fb.div.style.left = `${x}px`;
    fb.div.style.top = `${y}px`;
    fb.div.style.opacity = `${1 - elapsed / 800}`;
    fb.div.style.transform = `translateY(${-elapsed / 20}px)`;
  }
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

function addFishGroup() {
  scene.add(fishGroup2);  
}

function updateFishAnimation() {
  if (fishGroup2) {
    fishGroup2.children.forEach((fish) => {
        if (fish.initialPosition === undefined) {
            fish.initialPosition = fish.position.clone();
            fish.initialRotation = fish.rotation.clone();
        }

        // Bobbing up and down
        fish.position.y = fish.initialPosition.y + Math.sin(time2 * 2) * 0.08;

        // Nodding (head tilt forward/back)
        fish.rotation.x = fish.initialRotation.x + Math.sin(time2 * 4) * 0.08;

        // Swaying side to side
        fish.rotation.y = fish.initialRotation.y + Math.sin(time2 * 1.5) * 0.05;

        // Slight rolling for vibe
        fish.rotation.z = fish.initialRotation.z + Math.sin(time2 * 3) * 0.1;
        time2 += 0.01;
    });
  }
}

function updateNotes() {
  if (!isRunning) return;

  updateFishAnimation();
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
          const distance = Math.abs(z - HIT_ZONE_Z);
          let feedback = '';
          let feedbackColor = 'white';
          let points = 0;

          if (distance <= 1) {
            feedback = 'Perfect!';
            feedbackColor = 'gold';
            points = 150;
          } else if (distance <= 2) {
            feedback = 'Great!';
            feedbackColor = '#339bc2';
            points = 100;
          } else if (distance <= 3) {
            feedback = 'Good';
            feedbackColor = '#008b0d';
            points = 50;
          } else {
            feedback = 'Miss';
            feedbackColor = 'gray';
            points = 0;
          }

          score += points;
          scoreText.innerHTML = `Score: ${score}`;
          showFeedback(feedback, note.position.clone(), feedbackColor);

          notesGroup.remove(note);
          notes.splice(i, 1);
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
      noteMap.sort((a, b) => a.time - b.time);

      const startTime = performance.now();

      noteMap.forEach(note => {
        const delay = note.time * 500;

        const timeoutId = setTimeout(() => {
          createNote(note.lane, note.length || 0);
        }, delay);
        noteSpawnTimeouts.push(timeoutId);
      });

      setTimeout(() => {
        audio.currentTime = 0;
        audio.play();
      }, 1);
    })
    .catch(err => console.error("Error loading note map:", err));
}

function removeFishGroup() {
  if (fishGroup2.parent) {
    fishGroup2.parent.remove(fishGroup2);
  }
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
  addFishGroup();
  document.addEventListener('keydown', handleKeyPress);
  document.addEventListener('keyup', handleKeyUp);
}

function stopGame() {
  scene.remove(scene.getObjectByName('linesGroup'));
  removeFishGroup();
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

  leaderboard.push(score);
  leaderboard.sort((a, b) => b - a);
  while (leaderboard.length > 5) leaderboard.pop();
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  updateLeaderboard();
}

export { startGame, stopGame, updateNotes, updateFeedbacks };