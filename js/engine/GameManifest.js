export default class GameManifest {
    constructor(id, title, description) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.stages = {}; // Map stage ID (1, 2, 'Extra') to Event Loader function
        this.assets = {}; // Map asset key to path
        this.startingStage = 1;
    }

    getStageEvents(stageId) {
        // Should return a Promise or the events object/function
        const loader = this.stages[stageId];
        if (!loader) {
            console.error(`Stage ${stageId} not found in manifest ${this.id}`);
            return [];
        }
        return loader();
    }
}
