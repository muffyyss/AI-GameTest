import { gameState } from './data.js';

export function saveGame() {
    const gameSave = {
        coins: gameState.coins, stage: gameState.stage,
        myHeroes: gameState.myHeroes, inventory: gameState.inventory
    };
    localStorage.setItem('fantasyIdleSave', JSON.stringify(gameSave));
}

export function loadGame() {
    const savedData = localStorage.getItem('fantasyIdleSave');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        gameState.coins = parsedData.coins || 0;
        gameState.stage = parsedData.stage || 1;
        if (parsedData.myHeroes) gameState.myHeroes = parsedData.myHeroes;
        if (parsedData.inventory) gameState.inventory = parsedData.inventory;
    }
}

export function resetGame() {
    if (confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการเริ่มเกมใหม่ทั้งหมด?")) {
        localStorage.removeItem('fantasyIdleSave');
        location.reload();
    }
}