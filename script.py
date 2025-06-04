import json

with open("NoArrowsHard.dat", "r", encoding="utf-8") as f:
    data = json.load(f)

# Extract just the "_time" and "_lineIndex", renaming "_lineIndex" to "lane"
simplified_notes = [
    {"time": note["_time"], "lane": note["_lineIndex"]}
    for note in data["_notes"]
]

with open("simplified_note_map_normal.json", "w", encoding="utf-8") as f:
    json.dump(simplified_notes, f, indent=2)
