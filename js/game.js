// js/game.js (特別演出ディレイ ＆ CSV出力機能付き)

const GAME_CONFIG = {
    minCommentLength: 30,
    units: {
        "matha_prob": { total: 16, name: "数学A：場合の数と確率" },
        "mathb_sequence": { total: 18, name: "数学B：数列" },
        "mathc_vector": { total: 13, name: "数学C：平面ベクトル" },
        "mathc_vector3d": { total: 13, name: "数学C：空間ベクトル" },
        "math2_calculus": { total: 16, name: "数学II：微分積分" }
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
                            <i class="fa-solid fa-pen-nib"></i> Learning Log
                        </span>
                        ${isDone ? '<span class="text-[10px] text-green-600 font-bold"><i class="fa-solid fa-check-circle"></i> COMPLETED</span>' : ''}
                    </div>
                    <textarea id="input-${itemId}" rows="2" maxlength="200" placeholder="つまづいた所や工夫をメモ..." 
                        class="w-full p-3 text-xs border ${isDone ? 'border-green-200 bg-white' : 'border-gray-200'} rounded focus:outline-none focus:border-yellow-500 transition shadow-inner resize-none text-gray-700 leading-relaxed">${savedText}</textarea>
                    <div class="flex justify-between items-center mt-2">
                        <span id="count-${itemId}" class="text-[9px] ${savedText.length >= 30 ? 'text-green-600' : 'text-gray-400'} font-mono">現在: ${savedText.length} 文字</span>
                        <button onclick="studySystem.saveLog('${itemId}')" class="bg-gray-800 text-white text-[10px] px-4 py-1.5 rounded font-bold hover:bg-yellow-600 transition shadow-sm active:scale-95">LOG SAVE</button>
                    </div>
                </div>
            `;
            li.insertAdjacentHTML('beforeend', logHTML);
            const textarea = document.getElementById(`input-${itemId}`);
            textarea.addEventListener('input', () => {
                const countLabel = document.getElementById(`count-${itemId}`);
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
            this.prepareCelebration(pageKey);
        } else {
            location.reload();
        }
    }

    // 演出前の「溜め」を作る
    prepareCelebration(pageKey) {
        const overlay = document.createElement('div');
        overlay.className = "fixed inset-0 bg-black bg-opacity-70 z-[300] flex flex-col items-center justify-center text-white font-serif";
        overlay.innerHTML = `<div class="text-2xl animate-pulse mb-4">Analyzing your progress...</div><div class="w-48 h-1 bg-gray-700 rounded-full overflow-hidden"><div class="bg-yellow-500 h-full animate-[progress_1.5s_ease-in-out]"></div></div><style>@keyframes progress { from { width: 0% } to { width: 100% } }</style>`;
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.remove();
            this.showCelebration(pageKey);
        }, 1800);
    }

    showCelebration(pageKey) {
        const unitName = GAME_CONFIG.units[pageKey]?.name || "このユニット";
        
        // 紙吹雪：複数回飛ばして豪華にする
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#fbbf24', '#ffffff'] });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#fbbf24', '#ffffff'] });
            if (Date.now() < end) requestAnimationFrame(frame);
        }());

        const modalHTML = `
            <div id="congrats-modal" class="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-[200] p-6 animate-fade-in">
                <div class="bg-white rounded-lg p-8 max-w-lg w-full text-center shadow-2xl border-t-8 border-yellow-500 transform transition-all">
                    <div class="mb-4 text-yellow-500 text-5xl animate-bounce"><i class="fa-solid fa-medal"></i></div>
                    <h2 class="text-2xl font-serif font-bold text-gray-800 mb-2 tracking-widest uppercase">Congratulations!</h2>
                    <p class="text-sm text-gray-500 mb-1">${unitName}</p>
                    <p class="text-lg font-medium text-yellow-600 mb-6 underline decoration-yellow-200 italic">全工程コンプリート達成</p>
                    
                    <div class="bg-gray-50 border-l-4 border-gray-200 p-6 text-left mb-8 italic text-sm text-gray-700 leading-relaxed">
                        「1枚ずつの積み重ねが、大きな自信に変わる瞬間です。あなたが綴った数々の思考の跡は、これからの学習を支える確かな土台となります。」
                        <p class="text-right font-bold text-gray-500 mt-4">— Kyosuke Shibuya</p>
                    </div>

                    <div class="flex flex-col gap-3">
                        <button onclick="studySystem.downloadCSV('${pageKey}')" class="bg-green-600 text-white px-6 py-3 rounded-full font-bold hover:bg-green-700 transition flex items-center justify-center gap-2">
                            <i class="fa-solid fa-file-excel"></i> 学習ログをスプレッドシート形式で保存
                        </button>
                        <button onclick="location.reload()" class="text-gray-400 text-xs hover:text-gray-600 transition">閉じて進捗を確認する</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // メモをCSV形式で出力
    downloadCSV(pageKey) {
        const config = GAME_CONFIG.units[pageKey];
        let csvContent = "\uFEFF"; // UTF-8 BOM (Excel文字化け防止)
        csvContent += "回数,タイトル,学習ログ(感想)\n";

        // DOMからタイトルを取得しつつ、localStorageからメモを取得
        const listItems = document.querySelectorAll('li.group');
        listItems.forEach((li, index) => {
            const itemId = `${pageKey}_item_${index + 1}`;
            const title = li.querySelector('.font-medium')?.innerText || `第${index+1}回`;
            const log = this.data.completed[itemId] || "未記入";
            // カンマや改行の処理
            const safeLog = `"${log.replace(/"/g, '""')}"`;
            csvContent += `${index + 1},${title},${safeLog}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${config.name}_学習ログ.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

let studySystem;
window.addEventListener('DOMContentLoaded', () => { studySystem = new StudySystem(); });