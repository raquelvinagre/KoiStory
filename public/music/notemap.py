import librosa
import json
import numpy as np

# Load audio
y, sr = librosa.load("song.mp3")

# Detect onsets (note starts)
onset_frames = librosa.onset.onset_detect(y=y, sr=sr, backtrack=True, units='frames')
onset_times = librosa.frames_to_time(onset_frames, sr=sr)

# Compute pitches and magnitudes using harmonic-percussive source separation
y_harmonic, _ = librosa.effects.hpss(y)
pitches, magnitudes = librosa.piptrack(y=y_harmonic, sr=sr)

note_map = []

for onset_idx, onset_frame in enumerate(onset_frames):
    time = onset_times[onset_idx]

    # Pitch estimation at this frame
    pitch_slice = pitches[:, onset_frame]
    mag_slice = magnitudes[:, onset_frame]
    if mag_slice.any():
        index = mag_slice.argmax()
        pitch = pitch_slice[index]
    else:
        pitch = 0

    # Lane assignment based on pitch (MIDI range ~21-108)
    if pitch < 60:
        lane = 0
    elif pitch < 80:
        lane = 1
    elif pitch < 100:
        lane = 2
    else:
        lane = 3

    # Estimate note length by looking for silence or next onset
    if onset_idx < len(onset_frames) - 1:
        next_time = onset_times[onset_idx + 1]
    else:
        next_time = time + 0.3  # pad final note

    # Optional: Refine using signal energy to detect end
    segment = y[int(sr * time):int(sr * next_time)]
    energy = librosa.feature.rms(y=segment)[0]
    threshold = np.max(energy) * 0.2
    end_offset = next_time
    for i, e in enumerate(energy):
        if e < threshold:
            end_offset = time + i * (len(segment)/sr) / len(energy)
            break

    length = max(0, end_offset - time)

    note_map.append({
        "time": round(time, 3),
        "lane": lane,
        "length": round(length, 3)
    })

# Save as JSON
with open("note_map.json", "w") as f:
    json.dump(note_map, f, indent=2)

print("🎵 Note map generated and saved to note_map.json")
