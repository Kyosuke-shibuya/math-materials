// js/game.js

// --- 設定 ---
const GAME_CONFIG = {
    xpPerClick: 100,      // PDFクリック
    xpPerAudio: 300,      // 音声再生完了（★追加）
    baseXpForLevel: 500,  // 次のレベルに必要な基本経験値
    titles: [             // レベルごとの称号
        "数学の旅人",        // Lv 1-4
        "計算の魔術師",      // Lv 5-9
        "証明の達人",        // Lv 10-14
        "無限の探求者",      // Lv 15-19
        "数理の覇王",        // Lv 20-29
        "SHIBUYAの後継者"    // Lv 30~
    ]
};

// --- 初期データ ---
const initialState = {
    level: 1,
    currentXp: 0,
    nextLevelXp: 500,
    totalClicks: 0,
    lastLogin: new Date().toDateString()
};

// --- ゲームロジック ---
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
        this.data.totalClicks++;
        
        // レベルアップ判定
        if (this.data.currentXp >= this.data.nextLevelXp) {
            this.levelUp();
        } else {
            // レベルアップ時以外はここで保存・更新（レベルアップ時はメソッド内で行う）
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

    checkLoginBonus() {
        const today = new Date().toDateString();
        if (this.data.lastLogin !== today) {
            this.data.lastLogin = today;
            this.showNotification("ログインボーナス！ +200 XP", 'text-blue-400');
            this.gainXp(200);
        }
    }

    initUI() {
        const widgetHTML = `
            <div id="rpg-widget" class="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-2xl z-50 border border-gray-700 w-64 transform transition-all hover:scale-105 font-sans">
                <div class="flex justify-between items-end mb-2">
                    <div>
                        <div class="text-xs text-gray-400">Lv.<span id="rpg-level" class="text-xl text-yellow-500 font-bold ml-1">1</span></div>
                        <div id="rpg-title" class="text-sm font-bold tracking-wider">数学の旅人</div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-gray-500">NEXT</div>
                        <div class="text-xs"><span id="rpg-xp">0</span> / <span id="rpg-next">500</span></div>
                    </div>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-2.5">
                    <div id="rpg-bar" class="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2.5 rounded-full transition-all duration-500" style="width: 0%"></div>
                </div>
            </div>
            <div id="rpg-notification-area" class="fixed bottom-24 right-4 flex flex-col items-end gap-2 pointer-events-none z-50"></div>
        `;
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
    }

    updateUI() {
        document.getElementById('rpg-level').innerText = this.data.level;
        document.getElementById('rpg-title').innerText = this.getTitle();
        document.getElementById('rpg-xp').innerText = Math.floor(this.data.currentXp);
        document.getElementById('rpg-next').innerText = Math.floor(this.data.nextLevelXp);
        
        const percentage = Math.min(100, (this.data.currentXp / this.data.nextLevelXp) * 100);
        document.getElementById('rpg-bar').style.width = `${percentage}%`;
    }

    attachEvents() {
        // 1. PDFリンクのクリックイベント
        const links = document.querySelectorAll('a[href$=".pdf"]');
        links.forEach(link => {
            link.addEventListener('click', () => {
                this.gainXp(GAME_CONFIG.xpPerClick);
                this.showNotification(`+${GAME_CONFIG.xpPerClick} XP`, 'text-yellow-400');
            });
        });

        // 2. 音声再生完了イベント（★ここを追加）
        const audios = document.querySelectorAll('audio');
        audios.forEach(audio => {
            audio.addEventListener('ended', () => {
                this.gainXp(GAME_CONFIG.xpPerAudio);
                this.showNotification(`Listening Complete! +${GAME_CONFIG.xpPerAudio} XP`, 'text-green-400');
            });
        });
    }

    showNotification(text, colorClass) {
        const area = document.getElementById('rpg-notification-area');
        const notif = document.createElement('div');
        notif.className = `bg-gray-800 border border-gray-600 px-4 py-2 rounded shadow-lg font-bold fade-in-up ${colorClass}`;
        notif.innerText = text;
        area.appendChild(notif);

        if (!document.getElementById('rpg-style')) {
            const style = document.createElement('style');
            style.id = 'rpg-style';
            style.innerHTML = `
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-in-up { animation: fadeInUp 0.3s ease-out forwards; }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            notif.style.opacity = '0';
            notif.style.transition = 'opacity 0.5s';
            setTimeout(() => notif.remove(), 500);
        }, 2000);
    }

    showLevelUpModal() {
        const modalHTML = `
            <div id="levelup-modal" class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100]">
                <div class="bg-gray-900 border-2 border-yellow-500 p-8 rounded-lg text-center max-w-sm mx-4 shadow-[0_0_50px_rgba(234,179,8,0.5)] transform scale-110">
                    <h2 class="text-4xl text-yellow-500 font-serif font-bold mb-2">LEVEL UP!</h2>
                    <p class="text-white text-xl mb-4">Lv.${this.data.level-1} <i class="fa-solid fa-arrow-right text-gray-500 mx-2"></i> <span class="text-yellow-400 text-2xl font-bold">Lv.${this.data.level}</span></p>
                    <p class="text-gray-300 text-sm mb-6">称号: ${this.getTitle()}</p>
                    <button onclick="document.getElementById('levelup-modal').remove()" class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded transition">閉じる</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new MathRPG();
});