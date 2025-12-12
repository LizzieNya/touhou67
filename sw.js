const CACHE_NAME = 'touhou6-v1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './js/main.js',
    './js/core/Game.js',
    './js/core/Input.js',
    './js/core/Renderer.js',
    './js/core/ResourceManager.js',
    './js/core/SceneManager.js',
    './js/core/AudioSystem.js',
    './js/core/VirtualControls.js',
    './js/game/Entity.js',
    './js/game/Player.js',
    './js/game/Enemy.js',
    './js/game/Boss.js',
    './js/game/BulletManager.js',
    './js/game/PlayerBulletManager.js',
    './js/game/ItemManager.js',
    './js/game/CollisionSystem.js',
    './js/game/ScriptEngine.js',
    './js/game/Background.js',
    './js/game/ParticleSystem.js',
    './js/scenes/TitleScene.js',
    './js/scenes/GameScene.js',
    './js/scenes/GameOverScene.js',
    './js/ui/HUD.js',
    './js/ui/DialogueManager.js',
    './js/ui/PauseMenu.js',
    './js/stages/Stage1.js',
    './js/stages/Stage2.js',
    './js/stages/Stage3.js',
    './js/stages/Stage4.js',
    './js/stages/Stage5.js',
    './js/stages/Stage6.js',
    './js/stages/StageExtra.js'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});
