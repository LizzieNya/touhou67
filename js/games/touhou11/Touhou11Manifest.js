import GameManifest from '../../engine/GameManifest.js';

export default class Touhou11Manifest extends GameManifest {
    constructor() {
        super('touhou11', 'Touhou 11', 'Subterranean Animism');

        this.stages = {
            1: () => import('./Touhou11Stages.js').then(m => m.Stage1Events),
            2: () => import('../../stages/IndividualBossStages.js').then(m => m.BossParseeEvents), // Use Authentic Parsee
            3: () => import('./Touhou11Stages.js').then(m => m.Stage3Events),
            4: () => import('./Touhou11Stages.js').then(m => m.Stage4Events),
            5: () => import('./Touhou11Stages.js').then(m => m.Stage5Events),
            6: () => import('../../stages/IndividualBossStages.js').then(m => m.BossOkuuEvents), // Use Authentic Okuu
            'Extra': () => import('../../stages/IndividualBossStages.js').then(m => m.BossKoishiEvents), // Use Authentic Koishi
        };
    }
}
