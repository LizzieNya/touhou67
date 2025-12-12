const fs = require('fs');
const { Midi } = require('@tonejs/midi');

const midiPath = 'C:\\Users\\Notebook\\Desktop\\Code\\coded\\touhou67\\midi\\TH07__Perfect_Cherry_Blossom.mid';

try {
    const midiData = fs.readFileSync(midiPath);
    const midi = new Midi(midiData);

    console.log(`MIDI Name: ${midi.name}`);
    console.log(`Duration: ${midi.duration} seconds`);
    console.log(`Track Count: ${midi.tracks.length}`);
    console.log('--- Tracks ---');

    midi.tracks.forEach((track, index) => {
        // Only show tracks that have notes
        if (track.notes.length > 0) {
            console.log(`Track ${index}: "${track.name}" (Instrument: ${track.instrument.name}, Notes: ${track.notes.length})`);
        }
    });

    // Segment detection logic
    let allNotes = [];
    midi.tracks.forEach(track => {
        track.notes.forEach(note => {
            allNotes.push({
                time: note.time,
                endTime: note.time + note.duration
            });
        });
    });
    allNotes.sort((a, b) => a.time - b.time);

    if (allNotes.length > 0) {
        const segments = [];
        let currentSegmentStart = allNotes[0].time;
        let lastNoteEnd = allNotes[0].endTime;

        for (let i = 1; i < allNotes.length; i++) {
            const note = allNotes[i];
            if (note.time - lastNoteEnd > 2.0) {
                segments.push({
                    start: currentSegmentStart,
                    end: lastNoteEnd
                });
                currentSegmentStart = note.time;
            }
            if (note.endTime > lastNoteEnd) lastNoteEnd = note.endTime;
        }
        segments.push({
            start: currentSegmentStart,
            end: lastNoteEnd
        });

        console.log(`Detected Segments: ${segments.length}`);
        segments.forEach((seg, i) => {
            console.log(`Segment ${i + 1}: Start ${seg.start.toFixed(2)}, End ${seg.end.toFixed(2)}, Duration ${(seg.end - seg.start).toFixed(2)}`);
        });
    }

} catch (e) {
    console.error("Error reading MIDI:", e.message);
}
