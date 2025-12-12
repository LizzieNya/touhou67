export default class ScriptEngine {
    constructor(scene) {
        this.scene = scene;
        this.events = [];
        this.time = 0;
        this.eventIndex = 0;
    }

    loadScript(scriptEvents) {
        // scriptEvents is an array of { time: number, action: function }
        // Sort by time just in case
        this.events = scriptEvents.sort((a, b) => a.time - b.time);
        this.time = 0;
        this.eventIndex = 0;
    }

    update(dt) {
        // Check if a Boss is active
        const bossActive = this.scene.enemies.some(e => e.isBoss && e.active);

        // If boss is active, do NOT advance script time
        if (bossActive) {
            return;
        }

        this.time += dt;

        while (this.eventIndex < this.events.length &&
            this.events[this.eventIndex].time <= this.time) {

            const event = this.events[this.eventIndex];
            event.action(this.scene);
            this.eventIndex++;
        }
    }
    get isFinished() {
        return this.eventIndex >= this.events.length;
    }

    getNextEventTime() {
        if (this.eventIndex < this.events.length) {
            return this.events[this.eventIndex].time;
        }
        return -1;
    }
}
