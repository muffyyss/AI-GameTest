export const RARITY_COLORS = { 'NORMAL': '#2ecc71', 'RARE': '#3498db', 'EPIC': '#9b59b6', 'LEGENDARY': '#f1c40f', 'IMMORTAL': '#e74c3c' };
export const RARITY_STATS = { 'NORMAL': 15, 'RARE': 30, 'EPIC': 60, 'LEGENDARY': 100, 'IMMORTAL': 300 };
export const HERO_CLASSES = ['Warrior', 'Tank', 'Ranger', 'Mage', 'Archer', 'Rogue'];

export const CLASS_MULTIPLIERS = {
    'Warrior': { primary: 'STR', mult: 2, hpMult: 5, aggro: 5 },
    'Tank':    { primary: 'VIT', mult: 1, hpMult: 10, aggro: 8 },
    'Rogue':   { primary: 'STR', mult: 2, hpMult: 4, aggro: 4 }, // เปลี่ยนเป็น STR และตั้งค่าโอกาสโดนตี
    'Ranger':  { primary: 'AGI', mult: 2, hpMult: 4, aggro: 3 },
    'Mage':    { primary: 'INT', mult: 2, hpMult: 3, aggro: 3 },
    'Archer':  { primary: 'DEX', mult: 2, hpMult: 4, aggro: 3 }
};

// สแตทมอนสเตอร์ อ่อนลงเพื่อสมดุล
export const BASE_ENEMY_STATS = { classType: 'Warrior', STR: 2, VIT: 2, AGI: 2, INT: 2, DEX: 2, LUK: 2 };

export const gameState = {
    coins: 10000, 
    stage: 1, isBossFight: false, isDead: false, isSpawning: false,
    heroMaxHP: 10, heroHP: 10,
    enemyMaxHP: 2, enemyHP: 2, enemyDamage: 1, dropCoins: 5,
    myHeroes: [{ 
        id: 'hero_1', name: 'นักดาบฝึกหัด', classType: 'Warrior', rarity: 'NORMAL',
        isEquipped: true, level: 1, statusPoints: 0,
        stats: { STR: 8, AGI: 1, VIT: 3, INT: 1, DEX: 1, LUK: 1 }
    }],
    inventory: { equip: [], material: [], item: [] },
    currentTab: 'equip', currentHeroTab: 'team', selectedHeroId: null,
    filterClass: 'All', filterRarity: 'All', sortBy: 'LevelDesc'
};