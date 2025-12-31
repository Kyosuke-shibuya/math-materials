// js/game.js (全科目対応・100%お祝い演出 完全版)

const GAME_CONFIG = {
    minCommentLength: 30,
    units: {
        "matha_prob": { total: 16, name: "数学A：場合の数と確率" },
        "mathb_sequence": { total: 18, name: "数学B：数列" },
        "mathc_vector": { total: 13, name: "数学C：平面ベクトル" },
        "mathc_vector3d": { total: 13, name: "数学C：空間ベクトル" },
        "math2_calculus": { total: 16, name: "数学II：微分積分" },
        "math2_equation_comp": { total: 17, name: "数学II：微分積分" }
    }
};

class StudySystem {
    constructor() {
        this.data = this.loadData();
        this.initUI();
        if (document.readyState === 'loading') {
            window.addEventListener('load', () => this.injectLearningLogs());
        } else {
            setTimeout(() => this.injectLearningLogs(), 500);
        }
    }

    loadData() {
        const saved = localStorage.getItem('study_system_data');
        return saved ? JSON.parse(saved) : { completed: {} };
    }

    saveData() {
        localStorage.setItem('study_system_data', JSON.stringify(this.data));
    }

    // 現在のページキー（ファイル名）を取得
    getPageKey() {
        return window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    }

    getProgress(pageKey) {
        const config = GAME_CONFIG.units[pageKey];
        if (!config) return 0;
        const total = config.total;
        const done = Object.keys(this.data.completed).filter(k => k.startsWith(pageKey)).length;
        return Math.floor((done / total) * 100);
    }

    initUI() {
        const pageKey = this.getPageKey();
        if (!GAME_CONFIG.units[pageKey]) return;

        const progress = this.getProgress(pageKey);
        const widgetHTML = `
            <div id="study-widget" class="fixed top-2 right-2 bg-gray-900 border border-gray-700 p-2 rounded shadow-xl z-[100] w-32 md:w-40 font-sans">
                <div class="flex justify-between items-baseline mb-1">
                    <span class="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Achievement</span>
                    <span class="text-sm text-yellow-500 font-mono font-bold">${progress}%</span>
                </div>
                <div class="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
                    <div class="bg-yellow-500 h-full transition-all duration-1000" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
    }

    injectLearningLogs() {
        const listItems = document.querySelectorAll('li.group');
        const pageKey = this.getPageKey();
        if (!GAME_CONFIG.units[pageKey]) return;
        
        listItems.forEach((li, index) => {
            if (li.querySelector('.log-area')) return;

            const itemId = `${pageKey}_item_${index + 1}`;
            const isDone = this.data.completed[itemId];
            const savedText = isDone || "";

            const logHTML = `
                <div class="log-area w-full bg-gray-50 p-4 border-t border-gray-100">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                            <i class="fa-solid fa-pen-nib"></i> Learning Log (30字以上で完了)
                        </span>
                        ${isDone ? '<span class="text-[10px] text-green-600 font-bold"><i class="fa-solid fa-check-circle"></i> COMPLETED</span>' : ''}
                    </div>
                    <textarea id="input-${itemId}" rows="2" maxlength="200" placeholder="つまづいた所や工夫をメモ..." 
                        class="w-full p-3 text-xs border ${isDone ? 'border-green-200 bg-white' : 'border-gray-200'} rounded focus:outline-none focus:border-yellow-500 transition shadow-inner resize-none text-gray-700">${savedText}</textarea>
                    <div class="flex justify-between items-center mt-2">
                        <span id="count-${itemId}" class="text-[9px] ${savedText.length >= 30 ? 'text-green-600' : 'text-gray-400'} font-mono text-gray-400">現在: ${savedText.length} 文字</span>
                        <button onclick="studySystem.saveLog('${itemId}')" class="bg-gray-800 text-white text-[10px] px-4 py-1.5 rounded font-bold hover:bg-yellow-600 transition shadow-sm active:scale-95">LOG SAVE</button>
                    </div>
                </div>
            `;
            li.insertAdjacentHTML('beforeend', logHTML);

            const textarea = document.getElementById(`input-${itemId}`);
            const countLabel = document.getElementById(`count-${itemId}`);
            textarea.addEventListener('input', () => {
                countLabel.innerText = `現在: ${textarea.value.length} 文字`;
                countLabel.classList.toggle('text-green-600', textarea.value.length >= 30);
                countLabel.classList.toggle('text-gray-400', textarea.value.length < 30);
            });
        });
    }

    saveLog(itemId) {
        const text = document.getElementById(`input-${itemId}`).value.trim();
        if (text.length < GAME_CONFIG.minCommentLength) {
            alert(`あと ${GAME_CONFIG.minCommentLength - text.length} 文字足りません。`);
            return;
        }

        const pageKey = this.getPageKey();
        this.data.completed[itemId] = text;
        this.saveData();

        const newProgress = this.getProgress(pageKey);
        if (newProgress === 100) {
            this.showCelebration(pageKey);
        } else {
            location.reload();
        }
    }

    showCelebration(pageKey) {
        const unitName = GAME_CONFIG.units[pageKey]?.name || "このユニット";
        
        // 紙吹雪演出
        if (typeof confetti === 'function') {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#fbbf24', '#ffffff', '#3b82f6'] });
        }

        const modalHTML = `
            <div id="congrats-modal" class="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-[200] p-6">
                <div class="bg-white rounded-lg p-8 max-w-lg w-full text-center shadow-2xl border-t-8 border-yellow-500">
                    <h2 class="text-2xl font-serif font-bold text-gray-800 mb-2 tracking-widest uppercase">Congratulations!</h2>
                    <p class="text-sm text-gray-500 mb-1">${unitName}</p>
                    <p class="text-lg font-medium text-yellow-600 mb-6 underline decoration-yellow-200 italic">全工程コンプリート達成</p>
                    
                    <div class="bg-gray-50 border-l-4 border-gray-200 p-6 text-left mb-8 italic">
                        <p class="text-gray-700 leading-relaxed mb-4 text-sm">
                            「最後まで歩みを止めず、全項目の振り返りを完了させたその努力に、心から敬意を表します。言語化されたあなたの経験は、何にも代えがたい財産です。」
                        </p>
                        <p class="text-gray-700 leading-relaxed text-sm">
                            「一つの山を登りきったあなたなら、次の課題も必ず乗り越えられるはず。自信を持って次のステージへ進みましょう！」
                        </p>
                        <p class="text-right text-xs font-bold text-gray-500 mt-4">— Kyosuke Shibuya</p>
                    </div>

                    <button onclick="location.reload()" class="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-yellow-600 transition shadow-xl hover:scale-105 active:scale-95">
                        修了を確認する
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

let studySystem;
window.addEventListener('DOMContentLoaded', () => { studySystem = new StudySystem(); });