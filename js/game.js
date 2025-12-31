// js/game.js

const GAME_CONFIG = {
    xpPerClick: 100,
    xpPerAudio: 300,
    xpPerComment: 500,    // コメント投稿で大量XPゲット！
    baseXpForLevel: 500,
    titles: [
        "数学の旅人", "計算の魔術師", "証明の達人", "無限の探求者", "数理の覇王", "SHIBUYAの後継者"
    ]
};

const initialState = {
    level: 1,
    currentXp: 0,
    nextLevelXp: 500,
    comments: {}, // ページごとのコメント保存用
    lastLogin: new Date().toDateString()
};

class MathRPG {
    constructor() {
        this.data = this.loadData();
        this.initUI();
        this.attachEvents();
        this.injectMessageBoards(); // 掲示板を注入
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
        const widgetHTML = `
            <div id="rpg-widget" onclick="this.classList.toggle('opacity-20')" class="fixed top-1.5 right-2 bg-gray-900 bg-opacity-95 text-white py-1 px-3 rounded shadow-xl z-[60] border border-gray-700 w-44 transition-all duration-300 cursor-pointer font-sans select-none hover:bg-opacity-100">
                <div class="flex flex-col mb-1">
                    <div id="rpg-title" class="text-xs font-bold text-yellow-400 tracking-tighter truncate drop-shadow-[0_0_3px_rgba(250,204,21,0.5)]">数学の旅人</div>
                    <div class="flex justify-between items-center mt-0.5">
                        <div class="flex items-baseline gap-0.5"><span class="text-[8px] text-gray-500 font-bold">Lv.</span><span id="rpg-level" class="text-xs text-white font-bold font-mono">1</span></div>
                        <div class="text-[8px] text-gray-500 font-mono"><span id="rpg-xp">0</span>/<span id="rpg-next">500</span> XP</div>
                    </div>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-1">
                    <div id="rpg-bar" class="bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 h-1 rounded-full transition-all duration-500" style="width: 0%"></div>
                </div>
            </div>
            <div id="rpg-notification-area" class="fixed top-16 right-2 flex flex-col items-end gap-1 pointer-events-none z-[60]"></div>
        `;
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
    }

    // --- 掲示板システムの注入 ---
    injectMessageBoards() {
        const listItems = document.querySelectorAll('li.group'); // プリントの各行を取得
        listItems.forEach((li, index) => {
            const pageId = window.location.pathname + "_item_" + index; // 各行固有のID
            const savedComment = this.data.comments[pageId] || "";

            const boardHTML = `
                <div class="mt-4 px-4 pb-4 border-t border-gray-50 pt-3">
                    <div class="flex items-center gap-2 mb-2">
                        <i class="fa-solid fa-pen-to-square text-gray-300 text-xs"></i>
                        <span class="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Learning Log (MAX 50)</span>
                    </div>
                    <div class="flex gap-2">
                        <input type="text" maxlength="50" placeholder="つまづき・工夫をメモ..." 
                            id="input-${pageId}" value="${savedComment}"
                            class="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-yellow-500 transition shadow-inner">
                        <button onclick="mathRPG.postComment('${pageId}')" 
                            class="bg-gray-800 text-white text-[10px] px-3 py-1 rounded font-bold hover:bg-yellow-600 transition">
                            SAVE
                        </button>
                    </div>
                </div>
            `;
            li.querySelector('div').insertAdjacentHTML('afterend', boardHTML);
        });
    }

    postComment(pageId) {
        const input = document.getElementById(`input-${pageId}`);
        const text = input.value.trim();
        if (text === "") return;

        // 既にコメントしているかチェック（初回のみXP付与）
        const isFirstTime = !this.data.comments[pageId];
        
        this.data.comments[pageId] = text;
        this.saveData();

        if (isFirstTime) {
            this.gainXp(GAME_CONFIG.xpPerComment);
            this.showNotification(`Great Insight! +${GAME_CONFIG.xpPerComment} XP`, 'text-green-400');
        } else {
            this.showNotification(`Log Updated!`, 'text-blue-400');
        }
    }

    // (中略: updateUI, attachEvents, showNotification, showLevelUpModal, checkLoginBonus は前回と同じ)
    updateUI() {
        document.getElementById('rpg-level').innerText = this.data.level;
        document.getElementById('rpg-title').innerText = this.getTitle();
        document.getElementById('rpg-xp').innerText = Math.floor(this.data.currentXp);
        document.getElementById('rpg-next').innerText = Math.floor(this.data.nextLevelXp);
        const percentage = Math.min(100, (this.data.currentXp / this.data.nextLevelXp) * 100);
        document.getElementById('rpg-bar').style.width = `${percentage}%`;
    }

    attachEvents() {
        const links = document.querySelectorAll('a[href$=".pdf"]');
        links.forEach(link => link.addEventListener('click', () => {
            this.gainXp(GAME_CONFIG.xpPerClick);
            this.showNotification(`+${GAME_CONFIG.xpPerClick} XP`, 'text-yellow-400');
        }));
        const audios = document.querySelectorAll('audio');
        audios.forEach(audio => audio.addEventListener('ended', () => {
            this.gainXp(GAME_CONFIG.xpPerAudio);
            this.showNotification(`Listening Complete! +${GAME_CONFIG.xpPerAudio} XP`, 'text-green-400');
        }));
    }

    showNotification(text, colorClass) {
        const area = document.getElementById('rpg-notification-area');
        const notif = document.createElement('div');
        notif.className = `bg-gray-900 bg-opacity-90 border-l-4 border-yellow-500 text-white text-xs px-3 py-2 rounded shadow-md font-bold fade-in-down ${colorClass}`;
        notif.innerText = text;
        area.appendChild(notif);
        if (!document.getElementById('rpg-style')) {
            const style = document.createElement('style');
            style.id = 'rpg-style';
            style.innerHTML = `@keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } } .fade-in-down { animation: fadeInDown 0.3s ease-out forwards; }`;
            document.head.appendChild(style);
        }
        setTimeout(() => { notif.style.opacity = '0'; notif.style.transition = 'opacity 0.5s'; setTimeout(() => notif.remove(), 500); }, 2000);
    }

    showLevelUpModal() {
        const modalHTML = `<div id="levelup-modal" class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100]"><div class="bg-gray-900 border-2 border-yellow-500 p-6 rounded-lg text-center max-w-xs mx-4 shadow-[0_0_30px_rgba(234,179,8,0.4)] transform scale-105"><h2 class="text-3xl text-yellow-500 font-serif font-bold mb-2">LEVEL UP!</h2><p class="text-white text-lg mb-3">Lv.${this.data.level-1} <i class="fa-solid fa-arrow-right text-gray-500 mx-2"></i> <span class="text-yellow-400 text-xl font-bold">Lv.${this.data.level}</span></p><p class="text-gray-300 text-xs mb-5">称号: ${this.getTitle()}</p><button onclick="document.getElementById('levelup-modal').remove()" class="bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-bold py-2 px-6 rounded transition">閉じる</button></div></div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    checkLoginBonus() {
        const today = new Date().toDateString();
        if (this.data.lastLogin !== today) {
            this.data.lastLogin = today;
            this.gainXp(200);
            setTimeout(() => this.showNotification("Login Bonus! +200 XP", 'text-blue-400'), 1000);
        }
    }
}

// グローバル変数として保持（HTMLボタンから呼ぶため）
let mathRPG;
window.addEventListener('DOMContentLoaded', () => {
    mathRPG = new MathRPG();
});