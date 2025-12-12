import GameManifest from '../../engine/GameManifest.js';

// We can use dynamic imports here to avoid loading everything at once
// But for now, to keep it simple and working with existing exports, we might need to wrap them.

export default class Touhou6Manifest extends GameManifest {
    constructor() {
        super('touhou6', 'Touhou 6 Clone', 'The Embodiment of Scarlet Devil Clone');

        this.stages = {
            1: () => import('../../stages/Stage1.js').then(m => m.Stage1Events),
            2: () => import('../../stages/Stage2.js').then(m => m.Stage2Events),
            3: () => import('../../stages/Stage3.js').then(m => m.Stage3Events),
            4: () => import('../../stages/Stage4.js').then(m => m.Stage4Events),
            5: () => import('../../stages/Stage5.js').then(m => m.Stage5Events),
            6: () => import('../../stages/Stage6.js').then(m => m.Stage6Events),
            'Extra': () => import('../../stages/StageExtra.js').then(m => m.StageExtraEvents),
            'BossRush': () => import('../../stages/BossRushStage.js').then(m => m.BossRushEvents),
            // Individual Bosses
            'BossRumia': () => import('../../stages/IndividualBossStages.js').then(m => m.BossRumiaEvents),
            'BossCirno': () => import('../../stages/IndividualBossStages.js').then(m => m.BossCirnoEvents),
            'BossMeiling': () => import('../../stages/IndividualBossStages.js').then(m => m.BossMeilingEvents),
            'BossPatchouli': () => import('../../stages/IndividualBossStages.js').then(m => m.BossPatchouliEvents),
            'BossSakuya': () => import('../../stages/IndividualBossStages.js').then(m => m.BossSakuyaEvents),
            'BossRemilia': () => import('../../stages/IndividualBossStages.js').then(m => m.BossRemiliaEvents),
            'BossFlandre': () => import('../../stages/IndividualBossStages.js').then(m => m.BossFlandreEvents),
            'BossParsee': () => import('../../stages/IndividualBossStages.js').then(m => m.BossParseeEvents),
            'BossNue': () => import('../../stages/IndividualBossStages.js').then(m => m.BossNueEvents),
            'BossOkuu': () => import('../../stages/IndividualBossStages.js').then(m => m.BossOkuuEvents),
            'BossSans': () => import('../../stages/IndividualBossStages.js').then(m => m.BossSansEvents),
            'BossPepe': () => import('../../stages/IndividualBossStages.js').then(m => m.BossPepeEvents),
            'BossKoishi': () => import('../../stages/IndividualBossStages.js').then(m => m.BossKoishiEvents),
            'BossAya': () => import('../../stages/IndividualBossStages.js').then(m => m.BossAyaEvents),
            'BossJunko': () => import('../../stages/IndividualBossStages.js').then(m => m.BossJunkoEvents),
            'BossYuyuko': () => import('../../stages/IndividualBossStages.js').then(m => m.BossYuyukoEvents),
            // Touhou 8 Bosses
            'BossTewi': () => import('../../stages/IndividualBossStages.js').then(m => m.BossTewīEvents),
            'BossReisen': () => import('../../stages/IndividualBossStages.js').then(m => m.BossReisenEvents),
            'BossEirin': () => import('../../stages/IndividualBossStages.js').then(m => m.BossEirinEvents),
            'BossKaguya': () => import('../../stages/IndividualBossStages.js').then(m => m.BossKaguyaEvents),
            'BossMokou': () => import('../../stages/IndividualBossStages.js').then(m => m.BossMokouEvents),
        };
    }
}
