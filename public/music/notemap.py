import librosa
import json
import random

y, sr = librosa.load("song.mp3")
tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
beat_times = librosa.frames_to_time(beat_frames, sr=sr)

note_map = []

for t in beat_times:
    note_map.append({
        "time": t,
        "lane": random.randint(0, 3),
        #"length": random.choice([0, 0, 0, 0, 0, 20, 30])
    })

with open("note_map.json", "w") as f:
    json.dump(note_map, f)
    
print("Note map generated and saved to note_map.json")
