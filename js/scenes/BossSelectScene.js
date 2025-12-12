export default class BossSelectScene {
    constructor(game) {
        this.game = game;
        this.bosses = [
            // Touhou 6 - Embodiment of Scarlet Devil
            { name: 'Rumia', stage: 'BossRumia', game: 'Touhou 6' },
            { name: 'Cirno', stage: 'BossCirno', game: 'Touhou 6' },
            { name: 'Hong Meiling', stage: 'BossMeiling', game: 'Touhou 6' },
            { name: 'Patchouli Knowledge', stage: 'BossPatchouli', game: 'Touhou 6' },
            { name: 'Sakuya Izayoi', stage: 'BossSakuya', game: 'Touhou 6' },
            { name: 'Remilia Scarlet', stage: 'BossRemilia', game: 'Touhou 6' },
            { name: 'Flandre Scarlet', stage: 'BossFlandre', game: 'Touhou 6' },
            // Touhou 7 - Perfect Cherry Blossom
            { name: 'Yuyuko Saigyouji', stage: 'BossYuyuko', game: 'Touhou 7' },
            // Touhou 8 - Imperishable Night
            { name: 'Tewi Inaba', stage: 'BossTewi', game: 'Touhou 8' },
            { name: 'Reisen Udongein Inaba', stage: 'BossReisen', game: 'Touhou 8' },
            { name: 'Eirin Yagokoro', stage: 'BossEirin', game: 'Touhou 8' },
            { name: 'Kaguya Houraisan', stage: 'BossKaguya', game: 'Touhou 8' },
            { name: 'Fujiwara no Mokou', stage: 'BossMokou', game: 'Touhou 8' },
            // Touhou 10 - Mountain of Faith
            { name: 'Aya Shameimaru', stage: 'BossAya', game: 'Touhou 10' },
            // Touhou 11 - Subterranean Animism
            { name: 'Parsee Mizuhashi', stage: 'BossParsee', game: 'Touhou 11' },
            { name: 'Utsuho Reiuji', stage: 'BossOkuu', game: 'Touhou 11' },
            { name: 'Koishi Komeiji', stage: 'BossKoishi', game: 'Touhou 11' },
            // Touhou 12 - Undefined Fantastic Object
            { name: 'Nue Houjuu', stage: 'BossNue', game: 'Touhou 12' },
            // Touhou 15 - Legacy of Lunatic Kingdom
            { name: 'Junko', stage: 'BossJunko', game: 'Touhou 15' },
            // Special Guests
            { name: 'Sans', stage: 'BossSans', game: 'Undertale' },
            { name: 'Pepe', stage: 'BossPepe', game: 'Internet' }
        ];
        this.selectedIndex = 0;
        this.scrollOffset = 0;
        this.blinkTimer = 0;
        this.maxVisibleItems = 8; // Show 8 bosses at a time
        this.inputDelay = 0.3; // 300ms delay before accepting input

        // Hide HUD
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.style.display = 'none';
    }

    update(dt) {
        this.blinkTimer += dt;
        if (this.inputDelay > 0) {
            this.inputDelay -= dt;
            return;
        }
        const input = this.game.input;

        if (input.isPressed('UP')) {
            this.selectedIndex = (this.selectedIndex - 1 + this.bosses.length) % this.bosses.length;
            this.updateScroll();
        }
        if (input.isPressed('DOWN')) {
            this.selectedIndex = (this.selectedIndex + 1) % this.bosses.length;
            this.updateScroll();
        }
        if (input.isPressed('SHOOT') || input.isPressed('Confirm')) {
            this.selectBoss();
        }
        if (input.isPressed('BOMB')) { // Cancel
            import('./TitleScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        }
    }

    updateScroll() {
        // Keep selected item in view
        if (this.selectedIndex < this.scrollOffset) {
            this.scrollOffset = this.selectedIndex;
        } else if (this.selectedIndex >= this.scrollOffset + this.maxVisibleItems) {
            this.scrollOffset = this.selectedIndex - this.maxVisibleItems + 1;
        }
    }

    selectBoss() {
        const boss = this.bosses[this.selectedIndex];
        console.log(`Selected Boss: ${boss.name} (${boss.stage})`);
        // Go to Character Select, but pass the specific Boss Stage
        import('./CharacterSelectScene.js').then(module => {
            this.game.sceneManager.changeScene(new module.default(this.game, boss.stage));
        });
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        // Background
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#202');
        gradient.addColorStop(1, '#000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Title
        ctx.textAlign = 'center';
        ctx.font = 'bold 30px "Times New Roman", serif';
        ctx.fillStyle = '#fff';
        ctx.fillText("Boss Select", w / 2, 50);

        // Instructions
        ctx.font = '14px "Times New Roman", serif';
        ctx.fillStyle = '#aaa';
        ctx.fillText("Z: Select  |  X: Back  |  ↑↓: Navigate", w / 2, 80);

        // Counter
        ctx.font = '16px "Times New Roman", serif';
        ctx.fillStyle = '#888';
        ctx.fillText(`${this.selectedIndex + 1} / ${this.bosses.length}`, w / 2, 100);

        // List with scrolling
        const startY = 130;
        const spacing = 40;
        const visibleBosses = this.bosses.slice(this.scrollOffset, this.scrollOffset + this.maxVisibleItems);

        ctx.textAlign = 'left';
        visibleBosses.forEach((boss, displayIndex) => {
            const actualIndex = this.scrollOffset + displayIndex;
            const y = startY + displayIndex * spacing;

            let color = '#888';
            let prefix = '  ';

            if (actualIndex === this.selectedIndex) {
                const alpha = 0.5 + Math.abs(Math.sin(this.blinkTimer * 5)) * 0.5;
                color = `rgba(255, 255, 255, ${alpha})`;
                prefix = '> ';
            }

            // Boss name
            ctx.font = 'bold 22px "Times New Roman", serif';
            ctx.fillStyle = color;
            ctx.fillText(`${prefix}${boss.name}`, 100, y);

            // Game source
            ctx.font = '14px "Times New Roman", serif';
            ctx.fillStyle = '#666';
            ctx.fillText(boss.game, 450, y);
        });

        // Scroll indicators
        if (this.scrollOffset > 0) {
            // Up arrow
            ctx.fillStyle = '#fff';
            ctx.font = '20px "Times New Roman", serif';
            ctx.textAlign = 'center';
            ctx.fillText('▲', w / 2, 120);
        }
        if (this.scrollOffset + this.maxVisibleItems < this.bosses.length) {
            // Down arrow
            ctx.fillStyle = '#fff';
            ctx.font = '20px "Times New Roman", serif';
            ctx.textAlign = 'center';
            ctx.fillText('▼', w / 2, h - 20);
        }

        ctx.textAlign = 'left';
    }
}
