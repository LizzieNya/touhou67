import Game from './core/Game.js';

console.log("Main loaded (Top level)");

window.addEventListener('DOMContentLoaded', () => {
    console.log("Window loaded. Initializing Game...");
    try {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error("Canvas not found!");
            return;
        }
        
        // Wait for user interaction
        const startOverlay = document.getElementById('start-overlay');
        const startBtn = document.getElementById('tap-to-start');
        
        const startGame = () => {
             console.log("User interaction detected. Starting...");
             startOverlay.style.display = 'none';
             
             // Create and start game
             const game = new Game(canvas);
             
             // Unlock Audio Context immediately
             if (game.soundManager && game.soundManager.ctx) {
                 game.soundManager.ctx.resume().then(() => {
                     console.log("AudioContext resumed successfully.");
                 });
             }
             
             game.start();
             console.log("Game started.");
        };

        if (startOverlay && startBtn) {
            startBtn.addEventListener('click', startGame);
            startBtn.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent double firing
                startGame();
            }, { passive: false });
        } else {
            // Fallback for dev mode without overlay
            const game = new Game(canvas);
            game.start();
        }
    } catch (e) {
        console.error("Fatal Error:", e);
        const errDiv = document.createElement('div');
        errDiv.style.position = 'absolute';
        errDiv.style.top = '0';
        errDiv.style.left = '0';
        errDiv.style.color = 'red';
        errDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
        errDiv.style.padding = '20px';
        errDiv.style.zIndex = '9999';
        errDiv.innerText = "Fatal Error: " + e.message + "\n" + e.stack;
        document.body.appendChild(errDiv);
    }
});
