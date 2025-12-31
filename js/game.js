// js/game.js (サイドバー連携版)

const GAME_CONFIG = {
    xpPerClick: 100,
    xpPerAudio: 300,
    xpPerComment: 500,
    baseXpForLevel: 500,
    titles: ["数学の旅人", "計算の魔術師", "証明の達人", "無限の探求者", "数理の覇王", "SHIBUYAの後継者"]
};

const initialState = {
    level: 1, currentXp: 0, nextLevelXp: 500, comments: {}, lastLogin: new Date().toDateString()
};

class MathRPG {
    constructor() {
        this.data = this.loadData();
        this.initUI();
        this.attachEvents();
        this.checkLoginBonus();
        this.updateUI();
    }

    loadData() {
        const saved = localStorage.getItem('math_rpg_data');
        return saved ? JSON.parse(saved) : { ...initialState };
    }

    saveData() {
        localStorage.setItem('math_rpg_data', JSON.stringify(this.data));
    }

    getTitle() {
        const index = Math.floor((this.data.level - 1) / 5);
        return GAME_CONFIG.titles[Math.min(index, GAME_CONFIG.titles.length - 1)];
    }

    gainXp(amount) {
        this.data.currentXp += amount;
        if (this.data.currentXp >= this.data.nextLevelXp) {
            this.levelUp();
        } else {
            this.saveData();
            this.updateUI();
        }
    }

    levelUp() {
        this.data.currentXp -= this.data.nextLevelXp;
        this.data.level++;
        this.data.nextLevelXp = Math.floor(this.data.nextLevelXp * 1.2);
        this.saveData();
        this.updateUI();
        this.showLevelUpModal();
    }

    initUI() {
        if(document.getElementById('rpg-widget')) return;
        const widgetHTML = `
            <div id="rpg-widget" onclick="this.classList.toggle('opacity-20')" class="fixed top-1.5 right-2 bg-gray-900 bg-opacity-95 text-white py-1 px-3 rounded shadow-xl z-[100] border border-gray-700 w-44 transition-all duration-300 cursor-pointer font-sans select-none">
                <div class="flex flex-col mb-1">
                    <div id="rpg-title" class="text-xs font-bold text-yellow-400 tracking-tighter truncate">${this.getTitle()}</div>
                    <div class="flex justify-between items-center mt-0.5">
                        <div class="flex items-baseline gap-0.5"><span class="text-[8px] text-gray-500 font-bold">Lv.</span><span id="rpg-level" class="text-xs text-white font-bold font-mono">${this.data.level}</span></div>
                        <div class="text-[8px] text-gray-500 font-mono"><span id="rpg-xp">${Math.floor(this.data.currentXp)}</span>/${this.data.nextLevelXp} XP</div>
                    </div>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-1">
                    <div id="rpg-bar" class="bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 h-1 rounded-full transition-all duration-500" style="width: ${(this.data.currentXp/this.data.nextLevelXp)*100}%"></div>
                </div>
            </div>
            <div id="rpg-notification-area" class="fixed top-16 right-2 flex flex-col items-end gap-1 pointer-events-none z-[100]"></div>
        `;
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
    }

    // 手動で保存する関数
    saveMemo() {
        const select = document.getElementById('memo-target');
        const input = document.getElementById('memo-input');
        if (!select || !input) return;

        const targetId = select.value;
        const text = input.value.trim();
        if (text === "") return;

        const isFirstTime = !this.data.comments[targetId];
        this.data.comments[targetId] = text;
        this.saveData();

        if (isFirstTime) {
            this.gainXp(GAME_CONFIG.xpPerComment);
            this.showNotification(`Great Insight! +${GAME_CONFIG.xpPerComment} XP`, 'text-green-400');
        } else {
            this.showNotification(`Updated!`, 'text-blue-400');
        }
    }

    // 選択切り替え時に過去のメモを表示
    loadMemo() {
        const select = document.getElementById('memo-target');
        const input = document.getElementById('memo-input');
        const targetId = select.value;
        input.value = this.data.comments[targetId] || "";
    }

    updateUI() {
        const l = document.getElementById('rpg-level'), t = document.getElementById('rpg-title'), x = document.getElementById('rpg-xp'), n = document.getElementById('rpg-next'), b = document.getElementById('rpg-bar');
        if(l) l.innerText = this.data.level;
        if(t) t.innerText = this.getTitle();
        if(x) x.innerText = Math.floor(this.data.currentXp);
        if(n) n.innerText = this.data.nextLevelXp;
        if(b) b.style.width = `${(this.data.currentXp/this.data.nextLevelXp)*100}%`;
    }

    attachEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('a[href$=".pdf"]')) {
                this.gainXp(GAME_CONFIG.xpPerClick);
                this.showNotification(`+${GAME_CONFIG.xpPerClick} XP`, 'text-yellow-400');
            }
        });
        document.addEventListener('ended', (e) => {
            if (e.target.tagName === 'AUDIO') {
                this.gainXp(GAME_CONFIG.xpPerAudio);
                this.showNotification(`Listening Complete! +${GAME_CONFIG.xpPerAudio} XP`, 'text-green-400');
            }
        }, true);
    }

    showNotification(text, colorClass) {
        const area = document.getElementById('rpg-notification-area');
        if(!area) return;
        const notif = document.createElement('div');
        notif.className = `bg-gray-900 border-l-4 border-yellow-500 text-white text-[10px] px-3 py-2 rounded shadow-lg font-bold mb-1 fade-in-down ${colorClass}`;
        notif.innerText = text;
        area.appendChild(notif);
        setTimeout(() => { notif.style.opacity = '0'; setTimeout(() => notif.remove(), 500); }, 2000);
    }

    showLevelUpModal() {
        const modalHTML = `<div id="levelup-modal" class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[200]"><div class="bg-gray-900 border-2 border-yellow-500 p-6 rounded text-center shadow-[0_0_30px_rgba(234,179,8,0.4)]"><h2 class="text-2xl text-yellow-500 font-bold mb-2 uppercase italic">Level Up!</h2><p class="text-white">あなたは「${this.getTitle()}」に昇進した！</p><button onclick="this.closest('#levelup-modal').remove()" class="mt-4 bg-yellow-600 text-white px-4 py-1 rounded text-xs font-bold">CLOSE</button></div></div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    checkLoginBonus() {
        const today = new Date().toDateString();
        if (this.data.lastLogin !== today) {
            this.data.lastLogin = today;
            this.gainXp(200);
            setTimeout(() => this.showNotification("Daily Bonus! +200 XP", 'text-blue-400'), 1500);
        }
    }
}

let mathRPG;
window.addEventListener('DOMContentLoaded', () => { mathRPG = new MathRPG(); });