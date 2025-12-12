import GameManifest from '../../engine/GameManifest.js';

export default class Touhou7Manifest extends GameManifest {
    constructor() {
        super('touhou7', 'Touhou 7: Perfect Cherry Blossom', 'The phantom of spring.');

        this.stages = {
            1: () => import('./Stage1.js').then(m => m.Stage1Events),
            2: () => import('./Stage2.js').then(m => m.Stage2Events),
            3: () => import('./Stage3.js').then(m => m.Stage3Events),
            4: () => import('./Stage4.js').then(m => m.Stage4Events),
            5: () => import('./Stage5.js').then(m => m.Stage5Events),
            6: () => import('./Stage6.js').then(m => m.Stage6Events),
            'Extra': () => import('./StageExtra.js').then(m => m.StageExtraEvents),
        };
    }
}
