const fs = require('fs');
const { Midi } = require('@tonejs/midi');

const midiPath = 'C:\\Users\\Notebook\\Desktop\\Code\\coded\\touhou67\\midi\\Touhou_6_EoSD_Complete_OST.mid';
const th7Path = 'C:\\Users\\Notebook\\Desktop\\Code\\coded\\touhou67\\midi\\TH07__Perfect_Cherry_Blossom.mid';
const megalovaniaPath = 'C:\\Users\\Notebook\\Desktop\\Code\\coded\\touhou67\\midi\\Megalovania_-_Toby_Fox_Piano_Solo.mid';
const outputPath = 'C:\\Users\\Notebook\\Desktop\\Code\\coded\\touhou67\\js\\game\\LeitmotifManager.js';

const TRACK_MAPPING = {
    1: 'menu',      // Title
    2: 'stage1',    // Stage 1 Theme
    3: 'rumia',     // Boss 1
    4: 'stage2',    // Stage 2 Theme
    5: 'cirno',     // Boss 2
    6: 'stage3',    // Stage 3 Theme
    7: 'meiling',   // Boss 3
    8: 'stage4',    // Stage 4 Theme
    9: 'patchouli', // Boss 4
    10: 'stage5',   // Stage 5 Theme
    11: 'sakuya',   // Boss 5
    12: 'stage6',   // Stage 6 Theme
    13: 'remilia',  // Boss 6
    14: 'stage_extra', // Extra Stage Theme
    15: 'flandre'   // Extra Boss
};

const TH7_TRACK_MAPPING = {
    1: 'th7_menu',
    2: 'th7_stage1',
    3: 'th7_letty',
    4: 'th7_stage2',
    5: 'th7_chen',
    6: 'th7_stage3',
    7: 'th7_alice',
    8: 'th7_stage4',
    9: 'th7_prismriver',
    10: 'th7_stage5',
    11: 'th7_youmu',
    12: 'th7_stage6',
    13: 'th7_yuyuko',
    14: 'th7_stage_extra',
    15: 'th7_ran',
    16: 'th7_stage_phantasm',
    17: 'th7_yukari'
};

// Instrument logic
function getInstrument(noteNumber, bossId) {
    // Touhou 7 is a piano arrangement
    if (bossId && bossId.startsWith('th7_')) {
        if (noteNumber < 48) return 'bass';
        if (noteNumber < 60) return 'guitar'; // Using guitar for mid-low piano texture
        if (noteNumber < 72) return 'violin'; // Using violin for mid-high piano texture
        return 'piano';
    }

    if (bossId === 'sakuya') {
        if (noteNumber < 48) return 'bass';
        if (noteNumber < 60) return 'guitar';
        if (noteNumber < 72) return 'violin';
        return 'piano';
    }
    if (noteNumber < 48) return 'bass'; // Below C3
    if (noteNumber < 72) return 'guitar'; // C3 - C5 (Mid range / Chords)
    return 'zunpet'; // C5+ (Melody)
}

function noteToNoteName(midi) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midi / 12) - 1;
    const key = notes[midi % 12];
    return `${key}${octave}`;
}

function processMidi(path, mapping) {
    console.log(`Processing MIDI: ${path}`);
    const midiData = fs.readFileSync(path);
    const midi = new Midi(midiData);

    // 1. Flatten all notes
    let allNotes = [];
    midi.tracks.forEach(track => {
        track.notes.forEach(note => {
            allNotes.push({
                midi: note.midi,
                time: note.time,
                duration: note.duration,
                endTime: note.time + note.duration,
                velocity: note.velocity
            });
        });
    });
    allNotes.sort((a, b) => a.time - b.time);

    // 2. Detect Segments (Silence > 2s)
    const segments = [];
    if (allNotes.length > 0) {
        let currentSegmentStart = allNotes[0].time;
        let lastNoteEnd = allNotes[0].endTime;
        let segmentNotes = [];

        segmentNotes.push(allNotes[0]);

        for (let i = 1; i < allNotes.length; i++) {
            const note = allNotes[i];
            if (note.time - lastNoteEnd > 2.0) {
                segments.push({
                    start: currentSegmentStart,
                    end: lastNoteEnd,
                    notes: segmentNotes
                });
                segmentNotes = [];
                currentSegmentStart = note.time;
            }
            segmentNotes.push(note);
            if (note.endTime > lastNoteEnd) lastNoteEnd = note.endTime;
        }
        segments.push({
            start: currentSegmentStart,
            end: lastNoteEnd,
            notes: segmentNotes
        });
    }
    console.log(`Identified ${segments.length} segments.`);

    // 3. Generate Code
    let themesCode = '';

    for (let i = 0; i < segments.length; i++) {
        const segIndex = i + 1;
        const bossId = mapping[segIndex];

        if (!bossId) continue;

        console.log(`Processing ${bossId} (Segment ${segIndex})...`);

        const seg = segments[i];

        // 1. Detect Tempo
        let segmentTempo = 120;
        if (midi.header.tempos.length > 0) {
            const tempoEvent = midi.header.tempos.filter(t => t.time <= seg.start).pop();
            if (tempoEvent) {
                segmentTempo = Math.round(tempoEvent.bpm);
            } else {
                segmentTempo = Math.round(midi.header.tempos[0].bpm);
            }
        }
        console.log(`  > Detected Tempo: ${segmentTempo} BPM`);

        const secondsPerBeat = 60 / segmentTempo;
        const QUANTIZE = 0.0625;

        const notes = seg.notes.map(n => ({
            ...n,
            relTime: n.time - seg.start
        })).sort((a, b) => a.relTime - b.relTime);

        if (notes.length === 0) continue;

        const grid = {};

        notes.forEach(note => {
            const beat = note.relTime / secondsPerBeat;
            const quantizedBeat = Math.round(beat / QUANTIZE) * QUANTIZE;
            const durationBeats = Math.max(QUANTIZE, Math.round((note.duration / secondsPerBeat) / QUANTIZE) * QUANTIZE);

            const key = quantizedBeat.toFixed(4);
            if (!grid[key]) grid[key] = [];

            grid[key].push({
                note: noteToNoteName(note.midi),
                inst: getInstrument(note.midi, bossId),
                dur: durationBeats,
                midi: note.midi
            });
        });

        const sortedBeats = Object.keys(grid).map(parseFloat).sort((a, b) => a - b);
        let sequenceCode = [];

        if (sortedBeats.length > 0 && sortedBeats[0] > 0.01) {
            sequenceCode.push(`s([], ${sortedBeats[0].toFixed(3)})`);
        }

        for (let b = 0; b < sortedBeats.length; b++) {
            const beat = sortedBeats[b];
            let notesAtBeat = grid[beat.toFixed(4)];

            notesAtBeat.sort((n1, n2) => n2.midi - n1.midi);
            let maxNotes = 4;
            if (bossId === 'sakuya' || bossId.startsWith('th7_')) maxNotes = 6;
            if (notesAtBeat.length > maxNotes) {
                notesAtBeat = notesAtBeat.slice(0, maxNotes);
            }

            let timeToNextEvent = 0;
            if (b < sortedBeats.length - 1) {
                timeToNextEvent = sortedBeats[b + 1] - beat;
            } else {
                timeToNextEvent = 1.0;
            }

            const maxNoteDur = Math.max(...notesAtBeat.map(n => n.dur));
            let stepDuration = timeToNextEvent;
            let restDuration = 0;

            if (maxNoteDur < timeToNextEvent - 0.01) {
                stepDuration = maxNoteDur;
                restDuration = timeToNextEvent - maxNoteDur;
            }

            const noteStrings = notesAtBeat.map(n => `${n.inst}('${n.note}')`);
            let stepStr = '';
            if (noteStrings.length === 1) {
                stepStr = `s(${noteStrings[0]}, ${stepDuration.toFixed(3)})`;
            } else {
                stepStr = `s([${noteStrings.join(', ')}], ${stepDuration.toFixed(3)})`;
            }
            sequenceCode.push(stepStr);

            if (restDuration > 0.001) {
                sequenceCode.push(`s([], ${restDuration.toFixed(3)})`);
            }
        }

        const slicedSequence = sequenceCode.slice(0, 4000);

        themesCode += `
            '${bossId}': {
                tempo: ${segmentTempo},
                sequence: [
                    ${slicedSequence.join(', ')}
                ]
            },`;
    }
    return themesCode;
}

try {
    let allThemesCode = '';

    // Process Touhou 6
    allThemesCode += processMidi(midiPath, TRACK_MAPPING);

    // Process Touhou 7
    allThemesCode += processMidi(th7Path, TH7_TRACK_MAPPING);

    // Process Megalovania
    console.log("Processing Megalovania...");
    const megaData = fs.readFileSync(megalovaniaPath);
    const megaMidi = new Midi(megaData);

    let megaNotes = [];
    megaMidi.tracks.forEach(track => {
        track.notes.forEach(note => {
            megaNotes.push({
                midi: note.midi,
                time: note.time,
                duration: note.duration,
                endTime: note.time + note.duration,
                velocity: note.velocity
            });
        });
    });
    megaNotes.sort((a, b) => a.time - b.time);

    if (megaNotes.length > 0) {
        const megaTempo = megaMidi.header.tempos.length > 0 ? Math.round(megaMidi.header.tempos[0].bpm) : 120;
        console.log(`  > Megalovania Tempo: ${megaTempo} BPM`);
        const secondsPerBeat = 60 / megaTempo;
        const QUANTIZE = 0.0625;

        const grid = {};
        megaNotes.forEach(note => {
            const beat = note.time / secondsPerBeat;
            const quantizedBeat = Math.round(beat / QUANTIZE) * QUANTIZE;
            const durationBeats = Math.max(QUANTIZE, Math.round((note.duration / secondsPerBeat) / QUANTIZE) * QUANTIZE);

            const key = quantizedBeat.toFixed(4);
            if (!grid[key]) grid[key] = [];

            grid[key].push({
                note: noteToNoteName(note.midi),
                inst: getInstrument(note.midi),
                dur: durationBeats,
                midi: note.midi
            });
        });

        const sortedBeats = Object.keys(grid).map(parseFloat).sort((a, b) => a - b);
        let sequenceCode = [];

        if (sortedBeats.length > 0 && sortedBeats[0] > 0.01) {
            sequenceCode.push(`s([], ${sortedBeats[0].toFixed(3)})`);
        }

        for (let b = 0; b < sortedBeats.length; b++) {
            const beat = sortedBeats[b];
            let notesAtBeat = grid[beat.toFixed(4)];
            notesAtBeat.sort((n1, n2) => n2.midi - n1.midi);
            if (notesAtBeat.length > 4) notesAtBeat = notesAtBeat.slice(0, 4);

            let timeToNextEvent = 0;
            if (b < sortedBeats.length - 1) {
                timeToNextEvent = sortedBeats[b + 1] - beat;
            } else {
                timeToNextEvent = 1.0;
            }

            const maxNoteDur = Math.max(...notesAtBeat.map(n => n.dur));
            let stepDuration = timeToNextEvent;
            let restDuration = 0;

            if (maxNoteDur < timeToNextEvent - 0.01) {
                stepDuration = maxNoteDur;
                restDuration = timeToNextEvent - maxNoteDur;
            }

            const noteStrings = notesAtBeat.map(n => `${n.inst}('${n.note}')`);
            let stepStr = '';
            if (noteStrings.length === 1) {
                stepStr = `s(${noteStrings[0]}, ${stepDuration.toFixed(3)})`;
            } else {
                stepStr = `s([${noteStrings.join(', ')}], ${stepDuration.toFixed(3)})`;
            }
            sequenceCode.push(stepStr);

            if (restDuration > 0.001) {
                sequenceCode.push(`s([], ${restDuration.toFixed(3)})`);
            }
        }

        const slicedSequence = sequenceCode.slice(0, 800);

        allThemesCode += `
            'sans': {
                tempo: ${megaTempo},
                sequence: [
                    ${slicedSequence.join(', ')}
                ]
            },`;
    }

    allThemesCode += `
            'pepe': {
                 tempo: 100,
                 sequence: [ s([piano('E5'), bass('C3')], 1.0), s(piano('D5'), 0.5), s(piano('C5'), 0.5), s([piano('B4'), bass('G2')], 1.0), s(piano('C5'), 0.5), s(piano('D5'), 0.5), s([piano('C5'), bass('C3')], 2.0) ]
            }
    `;

    // Construct full file
    const fileContent = `export default class LeitmotifManager {
    constructor(audioContext) {
        this.ctx = audioContext;
        this.activeNodes = [];
        this.isPlaying = false;
        this.currentTheme = null;
        this.tempo = 120;
    }

    stop() {
        this.activeNodes.forEach(node => {
            try {
                node.stop();
                node.disconnect();
            } catch (e) { }
        });
        this.activeNodes = [];
        this.isPlaying = false;
        if (this.timeoutId) clearTimeout(this.timeoutId);
    }

    reset() {
        this.stop();
    }

    update(dt) {
        // No-op for compatibility with SoundManager v2
    }

    async playTheme(characterName) {
        if (this.currentTheme === characterName && this.isPlaying) return;
        this.stop();
        this.currentTheme = characterName;
        this.isPlaying = true;

        const themeData = this.getTheme(characterName);
        if (!themeData) return;

        if (themeData.audioUrl) {
            // ... (Audio URL logic preserved just in case)
        }

        this.tempo = themeData.tempo || 120;
        this.playSequence(themeData.sequence, 0);
    }

    playSequence(sequence, index) {
        if (!this.isPlaying) return;
        const step = sequence[index % sequence.length];
        const stepDuration = (60 / this.tempo) * step.duration;
        const notes = Array.isArray(step.notes) ? step.notes : [step.notes];

        notes.forEach(noteDef => {
            if (!noteDef) return;
            let freq, type = 'square', vol = 0.1;
            if (typeof noteDef === 'string') {
                freq = this.noteToFreq(noteDef);
            } else if (typeof noteDef === 'object') {
                freq = this.noteToFreq(noteDef.note);
                type = noteDef.type || 'square';
                vol = noteDef.vol || 0.1;
            }
            if (freq) this.playNote(freq, stepDuration * 0.9, type, vol);
        });

        this.timeoutId = setTimeout(() => {
            this.playSequence(sequence, index + 1);
        }, stepDuration * 1000);
    }

    playNote(freq, duration, type, volume) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        const now = this.ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + duration + 0.1);
        this.activeNodes.push(osc);
        setTimeout(() => {
            const idx = this.activeNodes.indexOf(osc);
            if (idx > -1) this.activeNodes.splice(idx, 1);
        }, (duration + 0.1) * 1000);
    }

    noteToFreq(note) {
        if (!note) return 0;
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = parseInt(note.slice(-1));
        const key = note.slice(0, -1);
        const index = notes.indexOf(key);
        if (index === -1) return 0;
        return 440 * Math.pow(2, (index - 9 + (octave - 4) * 12) / 12);
    }

    getTheme(name) {
        const s = (notes, duration) => ({ notes, duration });
        const n = (note, type = 'square', vol = 0.1) => ({ note, type, vol });
        const lead = (note) => n(note, 'square', 0.15);
        const zunpet = (note) => n(note, 'sawtooth', 0.12); // Lowered from 0.18
        const piano = (note) => n(note, 'triangle', 0.15);
        const violin = (note) => n(note, 'sawtooth', 0.12);
        const bass = (note) => n(note, 'triangle', 0.3);
        const guitar = (note) => n(note, 'sawtooth', 0.08); // Lowered from 0.12
        const pad = (note) => n(note, 'sine', 0.1);
        const bell = (note) => n(note, 'sine', 0.2);

        const themes = {
            ${allThemesCode}
        };

        themes['hong'] = themes['meiling'];
        themes['utsuho'] = themes['okuu'];
        return themes[name.toLowerCase()] || null;
    }
}
`;

    fs.writeFileSync(outputPath, fileContent);
    console.log("Successfully generated LeitmotifManager.js from MIDI!");

} catch (e) {
    console.error("Error:", e);
}
