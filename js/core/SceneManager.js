import LauncherScene from '../scenes/LauncherScene.js';
import LoadingScene from '../scenes/LoadingScene.js';

export default class SceneManager {
    constructor(game) {
        this.game = game;
        // Start with loading screen
        const launcherScene = new LauncherScene(game);
        this.currentScene = new LoadingScene(game, launcherScene);
    }

    changeScene(scene) {
        this.currentScene = scene;
    }

    update(dt) {
        if (this.currentScene) {
            this.currentScene.update(dt);
        }
    }

    render(renderer, alpha = 1.0) {
        if (this.currentScene) {
            this.currentScene.render(renderer, alpha);
        }
    }
}
