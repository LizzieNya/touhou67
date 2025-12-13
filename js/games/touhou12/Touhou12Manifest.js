import GameManifest from '../../engine/GameManifest.js';

export default class Touhou12Manifest extends GameManifest {
    constructor() {
        super('touhou12', 'Touhou 12', 'Undefined Fantastic Object');

        this.stages = {
            1: () => import('./Touhou12Stages.js').then(m => m.Stage1Events),
            2: () => import('./Touhou12Stages.js').then(m => m.Stage2Events),
            3: () => import('./Touhou12Stages.js').then(m => m.Stage3Events),
            4: () => import('./Touhou12Stages.js').then(m => m.Stage4Events),
            5: () => import('./Touhou12Stages.js').then(m => m.Stage5Events),
            6: () => import('./Touhou12Stages.js').then(m => m.Stage6Events),
            'Extra': () => import('./Touhou12Stages.js').then(m => m.BossNueEvents),
            // Boss Rush? Could reuse BossRushStage maybe, or define here
        };
    }
}
