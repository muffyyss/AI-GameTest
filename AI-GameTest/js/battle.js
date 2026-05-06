import { gameState, CLASS_MULTIPLIERS, BASE_ENEMY_STATS } from './data.js';
import { updateBattleUI, updateEnemySprite, logMessage, showDamageText, triggerHurt, renderHeroScreen, shootProjectile, renderBattleScene } from './ui.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));

export function updateBattleStats() {
    let equipped = gameState.myHeroes.filter(h => h.isEquipped);
    equipped.forEach(hero => {
        let classInfo = CLASS_MULTIPLIERS[hero.classType] || { hpMult: 5 };
        hero.maxHP = hero.stats.VIT * classInfo.hpMult;
        
        // 🟢 ถ้ายังไม่เคยมีเลือด (เพิ่งใส่ทีม) หรือเลือดเกิน Max ให้เซ็ตค่าเริ่มต้น
        if (typeof hero.currentHP === 'undefined') hero.currentHP = hero.maxHP;
        if (hero.currentHP > hero.maxHP) hero.currentHP = hero.maxHP;
    });
    updateBattleUI();
}

export function spawnEnemy() {
    let statMultiplier = Math.pow(1.5, gameState.stage - 1);
    if (gameState.isBossFight) { statMultiplier *= 3; gameState.dropCoins = Math.floor(25 * Math.pow(1.5, gameState.stage - 1)); } 
    else { gameState.dropCoins = Math.floor(5 * Math.pow(1.5, gameState.stage - 1)); }
    let classInfo = CLASS_MULTIPLIERS[BASE_ENEMY_STATS.classType];
    let totalDamage = 0;
    ['STR', 'AGI', 'INT', 'DEX', 'LUK'].forEach(stat => { let currentStatValue = BASE_ENEMY_STATS[stat] * statMultiplier; totalDamage += (stat === classInfo.primary) ? currentStatValue * classInfo.mult : currentStatValue * 0.5; });
    gameState.enemyDamage = Math.floor(totalDamage); if (gameState.enemyDamage < 1) gameState.enemyDamage = 1;
    gameState.enemyMaxHP = Math.floor(BASE_ENEMY_STATS.VIT * statMultiplier * classInfo.hpMult);
    gameState.enemyHP = gameState.enemyMaxHP;
    updateEnemySprite(); updateBattleUI();
}

export function challengeBoss() { if (!gameState.isBossFight && !gameState.isDead && !gameState.isSpawning) { gameState.isBossFight = true; spawnEnemy(); logMessage("🔥 คุณท้าทายสไลม์ยักษ์!"); } }

export function upgradeSpecificHero(heroId, cost) {
    if (gameState.coins >= cost) {
        gameState.coins -= cost;
        let hero = gameState.myHeroes.find(h => h.id === heroId);
        if (hero) {
            hero.level++; hero.statusPoints += 2;
        }
        updateBattleStats();
        
        // อัปเลเวลแล้วฮีลเลือดให้เต็ม (เฉพาะตัวที่อัป)
        if(hero.currentHP !== undefined) hero.currentHP = hero.maxHP; 
        
        renderHeroScreen(); logMessage(`⭐ อัปเลเวลสำเร็จ!`);
    } else { alert("เหรียญไม่พอครับ!"); }
}

export function addStat(heroId, statName) { let hero = gameState.myHeroes.find(h => h.id === heroId); if (hero && hero.statusPoints > 0) { hero.stats[statName]++; hero.statusPoints--; updateBattleStats(); renderHeroScreen(); } }

export function toggleEquip(heroId) {
    let hero = gameState.myHeroes.find(h => h.id === heroId); if (!hero) return;
    if (hero.isEquipped) {
        if (gameState.myHeroes.filter(h => h.isEquipped).length <= 1) { alert("ต้องมีฮีโร่อย่างน้อย 1 ตัวในสนาม"); return; }
        hero.isEquipped = false;
    } else {
        if (gameState.myHeroes.filter(h => h.isEquipped).length >= 5) { alert("ใส่ฮีโร่ได้สูงสุด 5 คนเท่านั้น!"); return; }
        hero.isEquipped = true;
    }
    updateBattleStats(); renderBattleScene(); renderHeroScreen();
}

export function sellHero(heroId, price) {
    if(confirm(`ต้องการขายฮีโร่ตัวนี้ในราคา ${price} 🪙 หรือไม่?`)) {
        gameState.myHeroes = gameState.myHeroes.filter(h => h.id !== heroId);
        gameState.coins += price; updateBattleUI(); renderHeroScreen();
    }
}

export function handleHeroDeath() { gameState.isDead = true; logMessage("💀 ทีมสลบ! รอการช่วยเหลือ..."); document.querySelectorAll('.hero-sprite').forEach(el => el.classList.add('hero-dead')); if (gameState.isBossFight) gameState.isBossFight = false; document.getElementById('death-screen').classList.add('active'); }

export function reviveHero() {
    gameState.isDead = false;
    
    // ชุบชีวิตฮีโร่ทุกคนในทีมให้เลือดเต็ม
    gameState.myHeroes.filter(h => h.isEquipped).forEach(h => {
        h.currentHP = h.maxHP;
    });

    document.querySelectorAll('.hero-sprite').forEach(el => { 
        el.classList.remove('hero-dead'); 
        el.classList.remove('hero-attacking'); 
        el.removeAttribute('style'); 
    }); 
    
    document.getElementById('death-screen').classList.remove('active'); 
    spawnEnemy(); logMessage("✨ ฟื้นคืนชีพแล้ว! ลุยกันต่อเลย!"); updateBattleUI(); 
}

export async function startBattleLoop() {
    while (true) {
        if (gameState.isDead || gameState.isSpawning) { await sleep(1000); continue; }
        let equipped = gameState.myHeroes.filter(h => h.isEquipped && h.currentHP > 0);
        if (equipped.length === 0) { await sleep(1000); continue; }
        let enemyDied = false;

        // ⚔️ เทิร์นปาร์ตี้ (เฉพาะคนที่ยังรอด)
        for (let i = 0; i < equipped.length; i++) {
            if (gameState.isDead || gameState.isSpawning || gameState.enemyHP <= 0) { enemyDied = true; break; }
            let hero = equipped[i];
            let isRanged = (hero.classType === 'Archer' || hero.classType === 'Mage' || hero.classType === 'Ranger');
            const heroSprite = document.getElementById(`hero-sprite-${hero.id}`);
            if (!heroSprite) continue;

            let classInfo = CLASS_MULTIPLIERS[hero.classType];
            let damage = 0;
            
            // 🟢 ตัด LUK ออกจากการคำนวณดาเมจดิบ
            ['STR', 'AGI', 'INT', 'DEX'].forEach(stat => { 
                damage += (stat === classInfo.primary) ? hero.stats[stat] * classInfo.mult : hero.stats[stat] * 0.5; 
            });
            damage = Math.floor(damage); if (damage < 1) damage = 1;

            // 🟢 ระบบคำนวณคริติคอลแบบหักล้าง
            let heroCrit = Math.floor(hero.stats.LUK / 3);
            let monsterLUK = BASE_ENEMY_STATS.LUK * Math.pow(1.5, gameState.stage - 1);
            let monsterCritRes = Math.floor(monsterLUK / 5);
            let finalCritChance = heroCrit - monsterCritRes;
            if (finalCritChance < 0) finalCritChance = 0;

            let isCrit = Math.random() < (finalCritChance / 100);
            if (isCrit) damage *= 2;

            if (isRanged) { heroSprite.classList.add('hero-ranged-attack'); shootProjectile(hero.classType, hero.positionIndex); } 
            else { heroSprite.classList.add('hero-attacking'); }

            await sleep(isRanged ? 300 : 150);
            heroSprite.classList.remove('hero-attacking'); heroSprite.classList.remove('hero-ranged-attack');

            gameState.enemyHP -= damage; triggerHurt('enemy-sprite'); showDamageText(damage, 'enemy', isCrit); updateBattleUI();

            if (gameState.enemyHP <= 0) {
                gameState.enemyHP = 0; updateBattleUI();
                gameState.coins += gameState.dropCoins; logMessage(`กำจัดศัตรูสำเร็จ! ได้รับ ${gameState.dropCoins} 🪙`);
                gameState.isSpawning = true; document.getElementById('enemy-sprite').style.opacity = '0';
                
                // ฮีลฮีโร่ทุกคนที่ยังมีชีวิตอยู่ให้เต็มหลังจบเวฟ
                gameState.myHeroes.filter(h => h.isEquipped && h.currentHP > 0).forEach(h => h.currentHP = h.maxHP); 
                updateBattleUI();

                if (gameState.isBossFight) { gameState.stage++; gameState.isBossFight = false; logMessage(`ปราบบอสสำเร็จ! ก้าวสู่ด่าน ${gameState.stage}`); }
                setTimeout(() => { spawnEnemy(); document.getElementById('enemy-sprite').style.opacity = '1'; gameState.isSpawning = false; }, 1000);
                enemyDied = true; break;
            }
            await sleep(300); 
        }

        if (enemyDied) continue;

        // 👹 เทิร์นมอนสเตอร์สวนกลับ
        equipped = gameState.myHeroes.filter(h => h.isEquipped && h.currentHP > 0); // รีเช็คว่าเหลือใครบ้าง
        if (!gameState.isDead && !gameState.isSpawning && gameState.enemyHP > 0 && equipped.length > 0) {
            const enemySprite = document.getElementById('enemy-sprite');
            if(enemySprite) enemySprite.classList.add('enemy-attacking');
            await sleep(200);
            if(enemySprite) enemySprite.classList.remove('enemy-attacking');

            // 🟢 ระบบสุ่มเป้าหมายตามค่า Aggro (Provoke)
            let totalAggro = equipped.reduce((sum, h) => sum + CLASS_MULTIPLIERS[h.classType].aggro, 0);
            let roll = Math.random() * totalAggro;
            let targetHero = equipped[0];
            let currentSum = 0;
            
            for (let h of equipped) {
                currentSum += CLASS_MULTIPLIERS[h.classType].aggro;
                if (roll <= currentSum) { targetHero = h; break; }
            }

            targetHero.currentHP -= gameState.enemyDamage;
            triggerHurt(`hero-sprite-${targetHero.id}`);
            showDamageText(gameState.enemyDamage, 'hero', false, targetHero.positionIndex); 
            
            // เช็คว่าฮีโร่ตัวที่โดนตี ตายหรือไม่
            if (targetHero.currentHP <= 0) { 
                targetHero.currentHP = 0; 
                let targetSprite = document.getElementById(`hero-sprite-${targetHero.id}`);
                if(targetSprite) targetSprite.classList.add('hero-dead');
                logMessage(`💀 ${targetHero.name} หมดสติ!`);
            }
            updateBattleUI();

            // ถ้าตายหมดทุกคน ถึงจะขึ้นจอ Death Screen
            let aliveHeroes = gameState.myHeroes.filter(h => h.isEquipped && h.currentHP > 0);
            if (aliveHeroes.length === 0) {
                handleHeroDeath();
            }
        }
        await sleep(1000); 
    }
}