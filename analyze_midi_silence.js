const fs = require('fs');
const { Midi } = require('@tonejs/midi');

const midiPath = 'C:\\Users\\Notebook\\Desktop\\Code\\coded\\touhou67\\midi\\Touhou_6_EoSD_Complete_OST.mid';

try {
    const midiData = fs.readFileSync(midiPath);
    const midi = new Midi(midiData);

    // Merge notes from all tracks to find global silence
    let allNotes = [];
    midi.tracks.forEach(track => {
        track.notes.forEach(note => {
            allNotes.push({
                time: note.time,
                duration: note.duration,
                endTime: note.time + note.duration
            });
        });
    });

    // Sort by start time
    allNotes.sort((a, b) => a.time - b.time);

    const segments = [];
    let currentSegmentStart = allNotes[0].time;
    let lastNoteEnd = allNotes[0].endTime;

    // Threshold for silence to consider it a new song (in seconds)
    const SILENCE_THRESHOLD = 2.0;

    for (let i = 1; i < allNotes.length; i++) {
        const note = allNotes[i];

        // If the gap between the last note ending and this note starting is large
        if (note.time - lastNoteEnd > SILENCE_THRESHOLD) {
            // End of previous segment
            segments.push({
                start: currentSegmentStart,
                end: lastNoteEnd,
                duration: lastNoteEnd - currentSegmentStart
            });

            // Start of new segment
            currentSegmentStart = note.time;
        }

        // Update lastNoteEnd (only if this note ends later than what we've seen)
        if (note.endTime > lastNoteEnd) {
            lastNoteEnd = note.endTime;
        }
    }

    // Push the final segment
    segments.push({
        start: currentSegmentStart,
        end: lastNoteEnd,
        duration: lastNoteEnd - currentSegmentStart
    });

    console.log(`Found ${segments.length} distinct musical segments (Songs):`);
    segments.forEach((seg, index) => {
        const minutes = Math.floor(seg.duration / 60);
        const seconds = Math.floor(seg.duration % 60);
        console.log(`Song ${index + 1}: Start ${seg.start.toFixed(2)}s, Duration: ${minutes}m ${seconds}s`);
    });

} catch (e) {
    console.error("Error:", e.message);
}
