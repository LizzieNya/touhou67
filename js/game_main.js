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
        const game = new Game(canvas);
        console.log("Game instance created. Starting...");
        game.start();
        console.log("Game started.");
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
