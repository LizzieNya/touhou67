export default class GameOverScene {
    constructor(game) {
        this.game = game;
        this.timer = 0;
    }

    update(dt) {
        this.timer += dt;

        // Wait 2 seconds then allow restart
        if (this.timer > 2.0) {
            if (this.game.input.isDown('SHOOT') || this.game.input.isDown('BOMB')) {
                import('./TitleScene.js').then(module => {
                    this.game.sceneManager.changeScene(new module.default(this.game));
                });
            }
        }
    }

    render(renderer) {
        // Draw semi-transparent background
        renderer.drawRect(0, 0, this.game.width, this.game.height, 'rgba(0, 0, 0, 0.5)');

        renderer.drawText("GAME OVER", this.game.width / 2 - 80, this.game.height / 2, 40, "#f00");

        if (this.timer > 2.0) {
            renderer.drawText("Press Z to Return to Title", this.game.width / 2 - 100, this.game.height / 2 + 50, 20, "#fff");
        }
    }
}
