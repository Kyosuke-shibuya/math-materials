// js/game.js

const GAME_CONFIG = {
    xpPerClick: 100,
    xpPerAudio: 300,
    xpPerComment: 500,
    baseXpForLevel: 500,
    titles: ["数学の旅人", "計算の魔術師", "証明の達人", "無限の探求者", "数理の覇王", "SHIBUYAの後継者"]
};

const initialState = {
    level: 1,
    currentXp: 0,
    nextLevelXp: 500,
    comments: {},
    lastLogin: new Date().toDateString()
};

class MathRPG {
    constructor() {
        this.data = this.loadData();
        this.initUI();
        this.attachEvents();
        // 少し遅らせて実行（HTMLが生成されるのを待つ）
        setTimeout(() => this.injectMessageBoards(), 500);
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
            <div id="rpg-widget" onclick="this.classList.toggle('opacity-20')" class="fixed top-1.5 right-2 bg-gray-900 bg-opacity-95 text-white py-1 px-3 rounded shadow-xl z-[60] border border-gray-700 w-44 transition-all duration-300 cursor-pointer font-sans select-none hover:bg-opacity-100">
                <div class="flex flex-col mb-1">
                    <div id="rpg-title" class="text-xs font-bold text-yellow-400 tracking-tighter truncate drop-shadow-[0_0_3px_rgba(250,204,21,0.5)]">${this.getTitle()}</div>
                    <div class="flex justify-between items-center mt-0.5">
                        <div class="flex items-baseline gap-0.5"><span class="text-[8px] text-gray-500 font-bold">Lv.</span><span id="rpg-level" class="text-xs text-white font-bold font-mono">${this.data.level}</span></div>
                        <div class="text-[8px] text-gray-500 font-mono"><span id="rpg-xp">${Math.floor(this.data.currentXp)}</span>/<span id="rpg-next">${this.data.nextLevelXp}</span> XP</div>
                    </div>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-1">
                    <div id="rpg-bar" class="bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 h-1 rounded-full transition-all duration-500" style="width: ${(this.data.currentXp/this.data.nextLevelXp)*100}%"></div>
                </div>
            </div>
            <div id="rpg-notification-area" class="fixed top-16 right-2 flex flex-col items-end gap-1 pointer-events-none z-[60]"></div>
        `;
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
    }

    injectMessageBoards() {
        // 全ページ共通の「プリントの各行」を特定
        const listItems = document.querySelectorAll('li.group');
        if (listItems.length === 0) return;

        listItems.forEach((li, index) => {
            // すでに掲示板がある場合はスキップ
            if (li.querySelector('.learning-log-area')) return;

            const pageId = window.location.pathname.split('/').pop() + "_item_" + index;
            const savedComment = this.data.comments[pageId] || "";

            const boardHTML = `
                <div class="learning-log-area mt-4 px-4 pb-4 border-t border-gray-50 pt-3 w-full">
                    <div class="flex items-center gap-2 mb-2">
                        <i class="fa-solid fa-pen-to-square text-gray-300 text-[10px]"></i>
                        <span class="text-[9px] font-bold text-gray-400 tracking-wider uppercase">Learning Log (つまづき・工夫)</span>
                    </div>
                    <div class="flex gap-2">
                        <input type="text" maxlength="50" placeholder="50字以内でメモ..." 
                            id="input-${pageId}" value="${savedComment}"
                            class="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-yellow-500 transition shadow-inner text-gray-600">
                        <button onclick="mathRPG.postComment('${pageId}')" 
                            class="bg-gray-800 text-white text-[9px] px-2 py-1 rounded font-bold hover:bg-yellow-600 transition whitespace-nowrap">
                            SAVE
                        </button>
                    </div>
                </div>
            `;
            
            // aタグの入っている親要素（flexレイアウトの中）の末尾に追加
            const container = li.querySelector('div') || li;
            container.appendChild(document.createRange().createContextualFragment(boardHTML));
        });
    }

    postComment(pageId) {
        const input = document.getElementById(`input-${pageId}`);
        const text = input.value.trim();
        if (text === "") return;

        const isFirstTime = !this.data.comments[pageId];
        this.data.comments[pageId] = text;
        this.saveData();

        if (isFirstTime) {
            this.gainXp(GAME_CONFIG.xpPerComment);
            this.showNotification(`Log Saved! +${GAME_CONFIG.xpPerComment} XP`, 'text-green-400');
        } else {
            this.showNotification(`Updated!`, 'text-blue-400');
        }
    }

    updateUI() {
        const elLevel = document.getElementById('rpg-level');
        const elTitle = document.getElementById('rpg-title');
        const elXp = document.getElementById('rpg-xp');
        const elNext = document.getElementById('rpg-next');
        const elBar = document.getElementById('rpg-bar');

        if(elLevel) elLevel.innerText = this.data.level;
        if(elTitle) elTitle.innerText = this.getTitle();
        if(elXp) elXp.innerText = Math.floor(this.data.currentXp);
        if(elNext) elNext.innerText = Math.floor(this.data.nextLevelXp);
        if(elBar) {
            const percentage = Math.min(100, (this.data.currentXp / this.data.nextLevelXp) * 100);
            elBar.style.width = `${percentage}%`;
        }
    }

    attachEvents() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href$=".pdf"]');
            if (link) {
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
        notif.className = `bg-gray-900 bg-opacity-90 border-l-4 border-yellow-500 text-white text-[10px] px-3 py-2 rounded shadow-md font-bold fade-in-down ${colorClass}`;
        notif.innerText = text;
        area.appendChild(notif);

        if (!document.getElementById('rpg-style')) {
            const style = document.createElement('style');
            style.id = 'rpg-style';
            style.innerHTML = `@keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } } .fade-in-down { animation: fadeInDown 0.3s ease-out forwards; }`;
            document.head.appendChild(style);
        }
        setTimeout(() => { notif.style.opacity = '0'; setTimeout(() => notif.remove(), 500); }, 2000);
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

let mathRPG;
window.addEventListener('load', () => {
    mathRPG = new MathRPG();
});