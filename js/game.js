// js/game.js

// --- 設定 ---
const GAME_CONFIG = {
    xpPerClick: 100,      // PDFクリック
    xpPerAudio: 300,      // 音声再生完了
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

    checkLoginBonus() {
        const today = new Date().toDateString();
        if (this.data.lastLogin !== today) {
            this.data.lastLogin = today;
            this.showNotification("Login Bonus! +200 XP", 'text-blue-400');
            this.gainXp(200);
        }
    }

  // --- UI構築 (称号強調スリム版) ---
    initUI() {
        const widgetHTML = `
            <div id="rpg-widget" onclick="this.classList.toggle('opacity-20')" class="fixed top-1.5 right-2 bg-gray-900 bg-opacity-95 text-white py-1 px-3 rounded shadow-xl z-[60] border border-gray-700 w-44 transition-all duration-300 cursor-pointer font-sans select-none hover:bg-opacity-100">
                
                <div class="flex flex-col mb-1">
                    <div id="rpg-title" class="text-xs font-bold text-yellow-400 tracking-tighter truncate drop-shadow-[0_0_3px_rgba(250,204,21,0.5)]">
                        数学の旅人
                    </div>
                    
                    <div class="flex justify-between items-center mt-0.5">
                        <div class="flex items-baseline gap-0.5">
                            <span class="text-[8px] text-gray-500 uppercase font-bold">Lv.</span>
                            <span id="rpg-level" class="text-xs text-white font-bold font-mono">1</span>
                        </div>
                        <div class="text-[8px] text-gray-500 font-mono">
                            <span id="rpg-xp">0</span>/<span id="rpg-next">500</span> <span class="text-[7px]">XP</span>
                        </div>
                    </div>
                </div>

                <div class="w-full bg-gray-700 rounded-full h-1">
                    <div id="rpg-bar" class="bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 h-1 rounded-full transition-all duration-500 shadow-[0_0_5px_rgba(234,179,8,0.3)]" style="width: 0%"></div>
                </div>
            </div>
            
            <div id="rpg-notification-area" class="fixed top-16 right-2 flex flex-col items-end gap-1 pointer-events-none z-[60]"></div>
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
        // PDFリンク
        const links = document.querySelectorAll('a[href$=".pdf"]');
        links.forEach(link => {
            link.addEventListener('click', () => {
                this.gainXp(GAME_CONFIG.xpPerClick);
                this.showNotification(`+${GAME_CONFIG.xpPerClick} XP`, 'text-yellow-400');
            });
        });

        // 音声再生完了
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
        // 通知のデザインも少し小さめに調整
        notif.className = `bg-gray-900 bg-opacity-90 border-l-4 border-yellow-500 text-white text-xs px-3 py-2 rounded shadow-md font-bold fade-in-down ${colorClass}`;
        notif.innerText = text;
        area.appendChild(notif);

        if (!document.getElementById('rpg-style')) {
            const style = document.createElement('style');
            style.id = 'rpg-style';
            style.innerHTML = `
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-in-down { animation: fadeInDown 0.3s ease-out forwards; }
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
                <div class="bg-gray-900 border-2 border-yellow-500 p-6 rounded-lg text-center max-w-xs mx-4 shadow-[0_0_30px_rgba(234,179,8,0.4)] transform scale-105">
                    <h2 class="text-3xl text-yellow-500 font-serif font-bold mb-2">LEVEL UP!</h2>
                    <p class="text-white text-lg mb-3">Lv.${this.data.level-1} <i class="fa-solid fa-arrow-right text-gray-500 mx-2"></i> <span class="text-yellow-400 text-xl font-bold">Lv.${this.data.level}</span></p>
                    <p class="text-gray-300 text-xs mb-5">称号: ${this.getTitle()}</p>
                    <button onclick="document.getElementById('levelup-modal').remove()" class="bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-bold py-2 px-6 rounded transition">閉じる</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new MathRPG();
});