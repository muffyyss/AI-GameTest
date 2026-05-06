import { gameState, RARITY_COLORS } from './data.js';

export function switchMainScreen(screenName) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.main-nav button').forEach(el => el.classList.remove('active'));
    document.getElementById('screen-' + screenName).classList.add('active');
    let navId = screenName === 'inventory' ? 'bag' : screenName;
    document.getElementById('nav-' + navId).classList.add('active');
}

export function renderBattleScene() {
    const scene = document.getElementById('battle-scene');
    scene.querySelectorAll('.hero-sprite').forEach(el => el.remove());
    
    let equipped = gameState.myHeroes.filter(h => h.isEquipped);
    
    // 🟢 เรียงลำดับการยืนจากหน้าสุดไปหลังสุด
    const order = ['Tank', 'Warrior', 'Rogue', 'Ranger', 'Mage', 'Archer'];
    equipped.sort((a, b) => order.indexOf(a.classType) - order.indexOf(b.classType));

    equipped.forEach((hero, index) => {
        hero.positionIndex = index; // เก็บ Index ตำแหน่งไว้ให้ตอนยิงหรือขึ้นดาเมจ
        
        const el = document.createElement('div');
        el.id = `hero-sprite-${hero.id}`;
        el.className = `sprite hero-sprite hero-pos-${index}`;
        
        // ถ้าตายอยู่ให้นอนสลบเลย
        if (hero.currentHP <= 0) el.classList.add('hero-dead');
        
        let icon = 'A';
        if(hero.classType === 'Tank') icon = '🛡️';
        if(hero.classType === 'Mage') icon = '🧙‍♂️';
        if(hero.classType === 'Archer') icon = '🏹';
        if(hero.classType === 'Rogue') icon = '🥷';
        if(hero.classType === 'Renger') icon = 'B';
        el.innerText = icon; scene.appendChild(el);
    });
}

export function updateBattleUI() {
    // 🟢 วาดหลอดเลือดแยกรายคน
    const heroStatsDiv = document.querySelector('.hero-stats > div:first-child');
    if (heroStatsDiv) {
        let hpBarsHTML = '';
        let equipped = gameState.myHeroes.filter(h => h.isEquipped);
        
        equipped.forEach(h => {
            let hpPercent = Math.max(0, ((h.currentHP || 0) / (h.maxHP || 1)) * 100);
            hpBarsHTML += `
                <div style="font-size: 12px; margin-top: 5px; display:flex; justify-content:space-between;">
                    <span>${h.name} (${h.classType})</span>
                    <span>${Math.max(0, Math.floor(h.currentHP || 0))} / ${h.maxHP}</span>
                </div>
                <div class="bar-bg" style="height:6px; margin-top:2px;">
                    <div class="hero-hp-fill" style="width: ${hpPercent}%; background: ${hpPercent > 30 ? 'var(--hero-hp-color)' : '#e74c3c'};"></div>
                </div>
            `;
        });

        heroStatsDiv.innerHTML = `
            <div style="color: var(--gold-color); font-size: 20px; font-weight: bold;">🪙 เหรียญ: <span id="coin-display">${gameState.coins}</span></div>
            ${hpBarsHTML}
        `;
    }

    document.getElementById('enemy-hp').innerText = Math.max(0, gameState.enemyHP);
    document.getElementById('enemy-max-hp').innerText = gameState.enemyMaxHP;
    document.getElementById('enemy-dmg').innerText = gameState.enemyDamage;
    document.getElementById('enemy-hp-fill').style.width = Math.max(0, (gameState.enemyHP / gameState.enemyMaxHP) * 100) + "%";

    let stageTitle = `ด่านที่ ${gameState.stage} - ` + (gameState.isBossFight ? `<span style="color:#d92027">สไลม์ยักษ์ (บอส)</span>` : `สไลม์ปกติ`);
    document.getElementById('stage-display').innerHTML = stageTitle;
    document.getElementById('boss-btn').innerText = `🔥 ท้าสู้บอสสไลม์ยักษ์ (ด่าน ${gameState.stage})`;
    document.getElementById('boss-btn').style.display = gameState.isBossFight ? 'none' : 'block';
}

export function updateEnemySprite() {
    const enemySprite = document.getElementById('enemy-sprite');
    enemySprite.innerText = '🟢';
    if (gameState.isBossFight) { enemySprite.classList.add('boss-slime'); enemySprite.classList.remove('slime'); } 
    else { enemySprite.classList.add('slime'); enemySprite.classList.remove('boss-slime'); }
}

export function logMessage(msg) { document.getElementById('battle-log').innerText = msg; }
export function triggerHurt(targetId) { const el = document.getElementById(targetId); if(el) { el.classList.add('hurt'); setTimeout(() => el.classList.remove('hurt'), 200); } }

export function showDamageText(amount, target, isCrit=false, heroPosIndex=null) {
    const dmgText = document.createElement('div');
    dmgText.innerText = (isCrit ? '💥 ' : '') + `-${amount}`;
    dmgText.className = 'damage-text' + (isCrit ? ' crit-text' : '');
    dmgText.style.color = target === 'hero' ? '#ff4757' : '#ffa502';
    
    const scene = document.getElementById('battle-scene');
    if (target === 'hero' && heroPosIndex !== null) {
        // ใช้ Class ตำแหน่งเดียวกับฮีโร่เพื่อให้เด้งตรงตัว
        dmgText.classList.add(`hero-pos-${heroPosIndex}`);
        dmgText.style.zIndex = 20;
    } else {
        dmgText.style.right = '20%'; dmgText.style.bottom = '20%';
    }
    scene.appendChild(dmgText);
    setTimeout(() => dmgText.remove(), 800);
}

export function shootProjectile(classType, heroPosIndex) {
    const scene = document.getElementById('battle-scene');
    const proj = document.createElement('div');
    proj.className = `projectile hero-pos-${heroPosIndex}`;
    proj.innerText = classType === 'Archer' ? '🏹' : '☄️';
    scene.appendChild(proj);
    setTimeout(() => proj.remove(), 300);
}

export function switchHeroTab(tabName, event) { gameState.currentHeroTab = tabName; gameState.selectedHeroId = null; const screen = document.getElementById('screen-hero'); screen.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active')); event.target.classList.add('active'); renderHeroScreen(); }
export function viewHeroDetails(heroId) { gameState.selectedHeroId = heroId; renderHeroScreen(); }
export function backToHeroList() { gameState.selectedHeroId = null; renderHeroScreen(); }
export function updateFilter(key, value) { gameState[key] = value; renderHeroScreen(); }

function getFilteredHeroes() {
    let filtered = gameState.myHeroes.filter(h => {
        let matchClass = gameState.filterClass === 'All' || h.classType === gameState.filterClass;
        let matchRarity = gameState.filterRarity === 'All' || h.rarity === gameState.filterRarity;
        return matchClass && matchRarity;
    });
    filtered.sort((a, b) => {
        let rW = {'NORMAL':1, 'RARE':2, 'EPIC':3, 'LEGENDARY':4, 'IMMORTAL':5};
        if (gameState.sortBy === 'LevelDesc') return b.level - a.level;
        if (gameState.sortBy === 'RarityDesc') return rW[b.rarity] - rW[a.rarity];
        if (gameState.sortBy === 'Class') return a.classType.localeCompare(b.classType);
        return 0;
    });
    return filtered;
}

export function renderHeroScreen() {
    const content = document.getElementById('hero-content');
    content.innerHTML = '';
    const filterHTML = `
        <div class="filter-bar">
            <select onchange="window.updateFilter('filterClass', this.value)">
                <option value="All" ${gameState.filterClass==='All'?'selected':''}>ทุกคลาส</option>
                <option value="Warrior" ${gameState.filterClass==='Warrior'?'selected':''}>Warrior</option>
                <option value="Tank" ${gameState.filterClass==='Tank'?'selected':''}>Tank</option>
                <option value="Ranger" ${gameState.filterClass==='Ranger'?'selected':''}>Ranger</option>
                <option value="Mage" ${gameState.filterClass==='Mage'?'selected':''}>Mage</option>
                <option value="Archer" ${gameState.filterClass==='Archer'?'selected':''}>Archer</option>
                <option value="Rogue" ${gameState.filterClass==='Rogue'?'selected':''}>Rogue</option>
            </select>
            <select onchange="window.updateFilter('filterRarity', this.value)">
                <option value="All" ${gameState.filterRarity==='All'?'selected':''}>ทุกระดับ</option>
                <option value="NORMAL" ${gameState.filterRarity==='NORMAL'?'selected':''}>Normal</option>
                <option value="RARE" ${gameState.filterRarity==='RARE'?'selected':''}>Rare</option>
                <option value="EPIC" ${gameState.filterRarity==='EPIC'?'selected':''}>Epic</option>
                <option value="LEGENDARY" ${gameState.filterRarity==='LEGENDARY'?'selected':''}>Legendary</option>
                <option value="IMMORTAL" ${gameState.filterRarity==='IMMORTAL'?'selected':''}>Immortal</option>
            </select>
            <select onchange="window.updateFilter('sortBy', this.value)">
                <option value="LevelDesc" ${gameState.sortBy==='LevelDesc'?'selected':''}>เลเวล (มากไปน้อย)</option>
                <option value="RarityDesc" ${gameState.sortBy==='RarityDesc'?'selected':''}>ระดับแรร์ (มากไปน้อย)</option>
                <option value="Class" ${gameState.sortBy==='Class'?'selected':''}>อาชีพ (A-Z)</option>
            </select>
        </div>`;

    if (gameState.currentHeroTab === 'team' || (gameState.currentHeroTab === 'hero' && !gameState.selectedHeroId)) content.innerHTML += filterHTML;

    let heroesToShow = getFilteredHeroes();

    if (gameState.currentHeroTab === 'team') {
        heroesToShow.forEach(hero => {
            let rColor = RARITY_COLORS[hero.rarity];
            let btnText = hero.isEquipped ? 'ถอดออก' : 'ใส่ทีม';
            let btnBg = hero.isEquipped ? '#d92027' : '#4ecca3';
            let equipBadge = hero.isEquipped ? `<span style="background:#4ecca3; color:#1a1a2e; padding:2px 6px; border-radius:3px; font-size:12px; font-weight:bold;">กำลังใช้งาน</span>` : '';
            content.innerHTML += `
                <div class="item-slot" style="border: 2px solid ${rColor}; box-shadow: 0 0 8px ${rColor}40; align-items: center;">
                    <div>
                        <div style="color:${rColor}; font-weight:bold; font-size:12px; margin-bottom:3px;">[${hero.rarity}] ${hero.classType} (Lv.${hero.level})</div>
                        <span class="item-name" style="font-size:16px; color:white;">🧝‍♂️ ${hero.name}</span>
                        <div style="margin-top:5px;">${equipBadge}</div>
                    </div>
                    <button style="background: ${btnBg}; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;" onclick="window.toggleEquip('${hero.id}')">${btnText}</button>
                </div>`;
        });
    } else if (gameState.currentHeroTab === 'hero') {
        if (gameState.selectedHeroId) {
            let hero = gameState.myHeroes.find(h => h.id === gameState.selectedHeroId);
            let rColor = RARITY_COLORS[hero.rarity];
            let upgradeCost = Math.floor(10 * Math.pow(1.5, hero.level - 1));
            
            const renderStat = (icon, color, name, label, statKey) => {
                let btn = hero.statusPoints > 0 ? `<button style="background:#4ecca3; color:#1a1a2e; border:none; padding:2px 8px; border-radius:4px; font-weight:bold; cursor:pointer; margin-left:10px;" onclick="window.addStat('${hero.id}', '${statKey}')">+</button>` : '';
                return `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px dashed #555; padding-bottom:5px;"><span style="color:${color}; font-weight:bold;">${icon} ${name} (${label})</span> <div><span style="font-size:18px;">${hero.stats[statKey]}</span>${btn}</div></div>`;
            };

            content.innerHTML += `
                <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                    <button style="background:#444; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; font-weight:bold;" onclick="window.backToHeroList()">⬅ กลับ</button>
                    <button style="background:var(--success-color); color:#1a1a2e; padding:8px 15px; border:none; border-radius:5px; font-weight:bold; cursor:pointer;" onclick="window.upgradeSpecificHero('${hero.id}', ${upgradeCost})">⭐ อัปเลเวล (${upgradeCost} 🪙)</button>
                </div>
                <div style="text-align:center; margin-bottom: 20px;">
                    <h3 style="color:${rColor}; margin:0; font-size:24px; text-shadow: 0 0 10px ${rColor}80;">🧝‍♂️ ${hero.name}</h3>
                    <div style="color:#aaa; font-size:14px; margin-top:5px;">คลาส: <span style="color:white; font-weight:bold;">${hero.classType}</span> | ระดับ: <span style="color:${rColor}; font-weight:bold;">${hero.rarity}</span></div>
                    <div style="color:var(--gold-color); font-weight:bold; margin-top:10px; padding: 5px; background: rgba(255, 215, 0, 0.1); border-radius: 5px;">⭐ เลเวล: ${hero.level} | ⬆️ แต้มสถานะ: ${hero.statusPoints}</div>
                </div>
                <div style="background: rgba(0,0,0,0.4); padding: 20px; border-radius: 8px; border: 1px solid ${rColor}; box-shadow: inset 0 0 10px ${rColor}30;">
                    ${renderStat('⚔️', '#ff4757', 'STR', 'โจมตีใกล้', 'STR')}
                    ${renderStat('🏹', '#2ed573', 'AGI', 'โจมตีไกล', 'AGI')}
                    ${renderStat('❤️', '#ff6b81', 'VIT', 'พลังชีวิต', 'VIT')}
                    ${renderStat('🔮', '#1e90ff', 'INT', 'เวทมนตร์', 'INT')}
                    ${renderStat('🎯', '#ffa502', 'DEX', 'แม่นยำ', 'DEX')}
                    ${renderStat('🍀', '#eccc68', 'LUK', 'คริติคอล', 'LUK')}
                </div>`;
        } else {
            heroesToShow.forEach(hero => {
                let rColor = RARITY_COLORS[hero.rarity];
                let sellPrice = {'NORMAL':50, 'RARE':200, 'EPIC':1000, 'LEGENDARY':5000, 'IMMORTAL':50000}[hero.rarity];
                let sellBtn = hero.isEquipped ? '' : `<button style="background:#e67e22; color:white; border:none; padding:4px 8px; border-radius:4px; font-size:12px; cursor:pointer;" onclick="event.stopPropagation(); window.sellHero('${hero.id}', ${sellPrice})">ขาย (${sellPrice} 🪙)</button>`;
                content.innerHTML += `
                    <div class="item-slot" style="cursor:pointer; border: 1px solid ${rColor}80; transition: 0.2s; align-items: center;" onclick="window.viewHeroDetails('${hero.id}')">
                        <div>
                            <span class="item-name" style="color:${rColor}; font-size:16px;">🧝‍♂️ ${hero.name} (Lv.${hero.level})</span>
                            <div style="font-size: 12px; color: #888; margin-top:2px;">คลาส: ${hero.classType} | ${hero.rarity}</div>
                        </div>
                        <div style="text-align:right;">${sellBtn}<br><span style="color:var(--gold-color); font-size: 12px;">🔍 ดูข้อมูล</span></div>
                    </div>`;
            });
        }
    }
}
export function switchInvTab(tabName, event) { gameState.currentTab = tabName; document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active')); event.target.classList.add('active'); renderInventory(); }
export function renderInventory() { const listContainer = document.getElementById('inventory-list'); listContainer.innerHTML = ''; const items = gameState.inventory[gameState.currentTab]; if (items.length === 0) { listContainer.innerHTML = `<p style="text-align:center; color: #888;">กระเป๋าว่างเปล่า...</p>`; return; } items.forEach(item => { listContainer.innerHTML += `<div class="item-slot"><span class="item-name">📦 ${item.name}</span><span class="item-qty">x${item.qty}</span></div>`; }); }