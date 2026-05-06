import { gameState } from './data.js';
import { saveGame, loadGame, resetGame } from './save.js';
import { switchMainScreen, switchHeroTab, viewHeroDetails, backToHeroList, switchInvTab, renderInventory, renderHeroScreen, updateBattleUI, updateFilter, renderBattleScene } from './ui.js';
import { updateBattleStats, spawnEnemy, challengeBoss, addStat, toggleEquip, reviveHero, startBattleLoop, sellHero, upgradeSpecificHero } from './battle.js';
import { rollGacha } from './gacha.js'; 

window.switchMainScreen = switchMainScreen;
window.switchHeroTab = switchHeroTab;
window.viewHeroDetails = viewHeroDetails;
window.backToHeroList = backToHeroList;
window.switchInvTab = switchInvTab;
window.challengeBoss = challengeBoss;
window.upgradeSpecificHero = upgradeSpecificHero;
window.addStat = addStat;
window.toggleEquip = toggleEquip;
window.reviveHero = reviveHero;
window.resetGame = resetGame;
window.rollGacha = rollGacha;     
window.updateFilter = updateFilter; 
window.sellHero = sellHero;       

loadGame();
updateBattleStats();
gameState.heroHP = gameState.heroMaxHP;
spawnEnemy();
renderBattleScene();
updateBattleUI();
renderInventory();
renderHeroScreen();

startBattleLoop();           
setInterval(saveGame, 5000);