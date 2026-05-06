import { gameState, RARITY_COLORS, RARITY_STATS, HERO_CLASSES, CLASS_MULTIPLIERS } from './data.js';
import { updateBattleUI } from './ui.js';

function generateRandomHero() {
    let r = Math.random() * 100;
    let rarity = r < 1 ? 'IMMORTAL' : r < 6 ? 'LEGENDARY' : r < 16 ? 'EPIC' : r < 41 ? 'RARE' : 'NORMAL';
    let c = HERO_CLASSES[Math.floor(Math.random() * HERO_CLASSES.length)];
    
    let totalPoints = RARITY_STATS[rarity] - 6;
    let primaryStat = CLASS_MULTIPLIERS[c].primary;
    let stats = { STR: 1, AGI: 1, VIT: 1, INT: 1, DEX: 1, LUK: 1 };
    
    stats[primaryStat] += Math.floor(totalPoints * 0.6); 
    if(primaryStat !== 'VIT') stats['VIT'] += Math.floor(totalPoints * 0.2); 
    
    let remaining = totalPoints - Math.floor(totalPoints * 0.6) - (primaryStat !== 'VIT' ? Math.floor(totalPoints * 0.2) : 0);
    let keys = Object.keys(stats);
    for(let i=0; i<remaining; i++){ stats[keys[Math.floor(Math.random()*keys.length)]]++; }

    return {
        id: 'hero_' + Math.random().toString(36).substr(2, 9),
        name: `ผู้กล้าไร้นาม`, classType: c, rarity: rarity, isEquipped: false, level: 1, statusPoints: 0, stats: stats
    };
}

export function rollGacha(times) {
    let cost = times === 100 ? 9000 : (times === 10 ? 900 : 100);
    if (gameState.coins < cost) { alert("เหรียญไม่พอครับลูกพี่!"); return; }
    
    gameState.coins -= cost; updateBattleUI();
    
    const strip = document.getElementById('gacha-strip');
    const resultsContainer = document.getElementById('gacha-results');
    strip.innerHTML = ''; resultsContainer.innerHTML = '';
    
    let pulls = []; for(let i=0; i<times; i++) pulls.push(generateRandomHero());

    strip.style.transition = 'none'; strip.style.transform = 'translateX(0)';
    
    for(let i=0; i<40; i++) {
        let dummy = generateRandomHero();
        let displayHero = (i === 35) ? pulls[0] : dummy; 
        let color = RARITY_COLORS[displayHero.rarity];
        strip.innerHTML += `<div class="gacha-box" style="border-color:${color}; color:${color}; box-shadow: inset 0 0 10px ${color}50;">
            <div style="font-size:10px;">${displayHero.classType}</div>
            <div style="font-size:24px;">🧝‍♂️</div>
            <div style="font-size:10px; font-weight:bold;">${displayHero.rarity}</div>
        </div>`;
    }

    void strip.offsetWidth; 

    // แก้บัคคำนวณตำแหน่งหยุด (กล่องกว้าง 100px + margin 5px ซ้ายขวา = 110px)
    let boxOuterWidth = 110; 
    let randomOffset = Math.floor(Math.random() * 40) - 20; 
    let centerOfWindow = document.getElementById('gacha-window').offsetWidth / 2;
    let stopPosition = - (35 * boxOuterWidth) + centerOfWindow - (boxOuterWidth / 2) + randomOffset;
    
    strip.style.transition = 'transform 3.5s cubic-bezier(0.15, 0.9, 0.25, 1)';
    strip.style.transform = `translateX(${stopPosition}px)`;

    document.querySelectorAll('.action-btn').forEach(b => b.disabled = true);

    setTimeout(() => {
        gameState.myHeroes.push(...pulls);
        if(times > 1) {
            pulls.forEach(h => {
                let color = RARITY_COLORS[h.rarity];
                resultsContainer.innerHTML += `<div style="border:1px solid ${color}; padding:5px; border-radius:5px; text-align:center; min-width:60px;">
                    <div style="color:${color}; font-size:10px; font-weight:bold;">${h.rarity}</div>
                    <div style="font-size:12px;">${h.classType}</div>
                </div>`;
            });
        }
        document.querySelectorAll('.action-btn').forEach(b => b.disabled = false);
    }, 3600);
}