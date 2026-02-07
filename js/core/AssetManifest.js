// Asset loading optimization - load images per-game instead of all at once
// This significantly reduces initial load time

export const CommonAssets = {
    // Assets that are always needed
    images: [
        { key: 'enemy', path: 'assets/enemy.png' },
        { key: 'bullet', path: 'assets/bullet.png' },
        { key: 'mainmenu_bg', path: 'assets/backgrounds/mainmenu.png' }
    ]
};

export const Touhou6Assets = {
    images: [
        { key: 'reimu', path: 'assets/sprites/player/reimu.png' },
        { key: 'marisa', path: 'assets/sprites/player/marisa.png' },
        { key: 'sakuya', path: 'assets/sprites/bosses/sakuya.png' }, // Use boss sprite
        { key: 'cirno', path: 'assets/sprites/bosses/cirno.png' }, // Use boss sprite for playable Cirno
        { key: 'boss', path: 'assets/boss.png' },
        { key: 'spirit', path: 'assets/sprites/spirit.png' },
        { key: 'book', path: 'assets/sprites/book.png' },
        { key: 'maid', path: 'assets/sprites/maid.png' },
        { key: 'kedama', path: 'assets/sprites/kedama.png' },

        // Touhou 6 specific portraits
        { key: 'portrait_reimu', path: 'assets/portrait/reimu.png' },
        { key: 'portrait_marisa', path: 'assets/portrait/marisa.png' },
        { key: 'portrait_rumia', path: 'assets/portrait/rumia.png' },
        { key: 'portrait_cirno', path: 'assets/portrait/cirno.png' },
        { key: 'portrait_meiling', path: 'assets/portrait/meiling.png' },
        { key: 'portrait_patchouli', path: 'assets/portrait/patchouli.png' },
        { key: 'portrait_sakuya', path: 'assets/portrait/sakuya.png' },
        { key: 'portrait_remilia', path: 'assets/portrait/remilia.png' },
        { key: 'portrait_flandre', path: 'assets/portrait/flandre.png' },

        // Boss sprites
        { key: 'rumia', path: 'assets/sprites/bosses/rumia.png' },
        { key: 'cirno', path: 'assets/sprites/bosses/cirno.png' },
        { key: 'meiling', path: 'assets/sprites/bosses/meiling.png' },
        { key: 'patchouli', path: 'assets/sprites/bosses/patchouli.png' },
        { key: 'remilia', path: 'assets/sprites/bosses/remilia.png' },
        { key: 'flandre', path: 'assets/sprites/bosses/flandre.png' },

        // Backgrounds
        { key: 'stage1_bg', path: 'assets/backgrounds/stage1.png' },
        { key: 'stage2_bg', path: 'assets/backgrounds/stage2.png' },
        { key: 'stage3_bg', path: 'assets/backgrounds/stage3.png' },
        { key: 'stage4_bg', path: 'assets/backgrounds/stage4.png' },
        { key: 'stage5_bg', path: 'assets/backgrounds/stage5.png' },
        { key: 'stage6_bg', path: 'assets/backgrounds/stage6.png' },
        { key: 'stage_extra_bg', path: 'assets/backgrounds/stage_extra.png' }
    ]
};

export const Touhou7Assets = {
    images: [
        { key: 'youmu', path: 'assets/sprites/player/youmu.png' }, // Pixel art sprite
        { key: 'mainmenu7_bg', path: 'assets/backgrounds/mainmenu7.png' },
        { key: 'portrait_youmu', path: 'assets/portrait/youmu.png' },
        // Add more Touhou 7 specific assets here
        ...Touhou6Assets.images.filter(img =>
            img.key === 'reimu' || img.key === 'marisa' ||
            img.key === 'sakuya' || img.key === 'cirno' ||
            img.key === 'portrait_reimu' || img.key === 'portrait_marisa' ||
            img.key === 'portrait_sakuya' || img.key === 'portrait_cirno'
        )
    ]
};

export const Touhou11Assets = {
    images: [
        // Reimu/Marisa reusing existing
        ...Touhou6Assets.images.filter(img => img.key === 'reimu' || img.key === 'marisa' || img.key === 'boss'),
        { key: 'yamame', path: 'assets/sprites/bosses/yamame.png' },
        { key: 'parsee', path: 'assets/sprites/bosses/parsee.png' },
        { key: 'yuugi', path: 'assets/sprites/bosses/yuugi.png' },
        { key: 'satori', path: 'assets/sprites/bosses/satori.png' },
        { key: 'rin', path: 'assets/sprites/bosses/rin.png' },
        { key: 'okuu', path: 'assets/sprites/bosses/okuu.png' },
        { key: 'koishi', path: 'assets/sprites/bosses/koishi.png' }
    ]
};

export const Touhou12Assets = {
    images: [
        // Reimu/Marisa/Sanae
        ...Touhou6Assets.images.filter(img => img.key === 'reimu' || img.key === 'marisa' || img.key === 'boss'),
        { key: 'sanae', path: 'assets/sprites/player/sanae.png' },
        { key: 'nazrin', path: 'assets/sprites/bosses/nazrin.png' },
        { key: 'kogasa', path: 'assets/sprites/bosses/kogasa.png' },
        { key: 'ichirin', path: 'assets/sprites/bosses/ichirin.png' },
        { key: 'murasa', path: 'assets/sprites/bosses/murasa.png' },
        { key: 'shou', path: 'assets/sprites/bosses/shou.png' },
        { key: 'byakuren', path: 'assets/sprites/bosses/byakuren.png' },
        { key: 'nue', path: 'assets/sprites/bosses/nue.png' }
    ]
};

export const NocturnalSunlightAssets = {
    images: [
        { key: 'remilia', path: 'assets/sprites/bosses/remilia.png' }, // Placeholder: Use boss sprite
        { key: 'flandre', path: 'assets/sprites/bosses/flandre.png' }, // Placeholder: Use boss sprite
        { key: 'sakuya', path: 'assets/sprites/bosses/sakuya.png' },   // Placeholder: Use boss sprite

        // NS specific portraits
        { key: 'portrait_midnight', path: 'assets/portrait/midnight.png' },
        { key: 'portrait_eclipse', path: 'assets/portrait/eclipse.png' },
        { key: 'portrait_prism', path: 'assets/portrait/prism.png' },
        { key: 'portrait_chronos', path: 'assets/portrait/chronos.png' },
        { key: 'portrait_solstice', path: 'assets/portrait/solstice.png' },

        // NS New Specific Sprites
        { key: 'nocturnal_sunlight_title', path: 'assets/backgrounds/nocturnal_sunlight_title.png' },
        { key: 'midnight', path: 'assets/sprites/bosses/midnight.png' },
        { key: 'prism', path: 'assets/sprites/bosses/prism.png' },
        { key: 'chronos', path: 'assets/sprites/bosses/chronos.png' },

        // Extra Boss Characters (Placeholders using boss.png or specific if available)
        { key: 'lumina', path: 'assets/sprites/bosses/lumina.png' },
        { key: 'sans', path: 'assets/sprites/bosses/sans.png' },
        { key: 'nue', path: 'assets/sprites/bosses/nue.png' },
        { key: 'okuu', path: 'assets/sprites/bosses/okuu.png' },
        { key: 'parsee', path: 'assets/sprites/bosses/parsee.png' },
        { key: 'pepe', path: 'assets/sprites/bosses/pepe.png' },
        { key: 'koishi', path: 'assets/sprites/bosses/koishi.png' },
        { key: 'aya', path: 'assets/sprites/bosses/aya.png' },
        { key: 'junko', path: 'assets/sprites/bosses/junko.png' },
        { key: 'yuyuko', path: 'assets/sprites/bosses/yuyuko.png' },
        // Touhou 8 - Imperishable Night Bosses
        { key: 'tewi', path: 'assets/sprites/bosses/tewi.png' },
        { key: 'reisen', path: 'assets/sprites/bosses/reisen.png' },
        { key: 'eirin', path: 'assets/sprites/bosses/eirin.png' },
        { key: 'kaguya', path: 'assets/sprites/bosses/kaguya.png' },
        { key: 'mokou', path: 'assets/sprites/bosses/mokou.png' },

        // { key: 'portrait_sans', path: 'assets/portrait/sans.png' },
        // { key: 'portrait_nue', path: 'assets/portrait/nue.png' },
        // { key: 'portrait_okuu', path: 'assets/portrait/okuu.png' },
        // { key: 'portrait_parsee', path: 'assets/portrait/parsee.png' },
        { key: 'portrait_lizzie', path: 'assets/portrait/lizzie.png' },
        { key: 'portrait_koishi', path: 'assets/portrait/koishi.png' },

        // Reuse common player sprites from T6
        ...Touhou6Assets.images.filter(img =>
            img.key === 'reimu' || img.key === 'marisa' ||
            img.key === 'sakuya' ||
            img.key.startsWith('portrait_reimu') || img.key.startsWith('portrait_marisa') ||
            img.key.startsWith('portrait_sakuya') || img.key.startsWith('portrait_remilia') ||
            img.key.startsWith('portrait_flandre')
        ),
        // Reuse Youmu from T7
        ...Touhou7Assets.images.filter(img =>
            img.key === 'youmu' || img.key === 'portrait_youmu'
        ),
        // Add Sanae sprite (using Reimu as placeholder if needed, or specific if available)
        { key: 'sanae', path: 'assets/sprites/player/sanae.png' },
        { key: 'portrait_sanae', path: 'assets/portrait/sanae.png' }
    ]
};
