// js/game.js (配置修正・進捗ゲージ連携版)

const GAME_CONFIG = {
    minCommentLength: 30, // コンプリートに必要な最小文字数
    units: {
       "math2_calculus":16,
        "math2_equation_comp":17,
        "matha_prob": 16,     // 数学A
        "mathb_sequence": 18, // 数学B
        "mathc_vector":13,
        "mathc_vector3d": 13  // 数学C
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

    getProgress(pageKey) {
        const total = GAME_CONFIG.units[pageKey] || 0;
        if (total === 0) return 0;
        const done = Object.keys(this.data.completed).filter(k => k.startsWith(pageKey)).length;
        return Math.floor((done / total) * 100);
    }

    initUI() {
        const path = window.location.pathname.split('/').pop();
        const pageKey = path.replace('.html', '') || 'index';
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
        const path = window.location.pathname.split('/').pop();
        const pageKey = path.replace('.html', '') || 'matha_prob';
        
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
                    <div class="flex flex-col gap-2">
                        <textarea id="input-${itemId}" rows="2" maxlength="200" placeholder="つまづいた所や、工夫した解き方をメモしよう..." 
                            class="w-full p-3 text-xs border ${isDone ? 'border-green-200 bg-white' : 'border-gray-200'} rounded focus:outline-none focus:border-yellow-500 transition shadow-inner resize-none text-gray-700 leading-relaxed">${savedText}</textarea>
                        <div class="flex justify-between items-center">
                            <span id="count-${itemId}" class="text-[9px] ${savedText.length >= 30 ? 'text-green-600' : 'text-gray-400'} font-mono">現在: ${savedText.length} 文字</span>
                            <button onclick="studySystem.saveLog('${itemId}')" 
                                class="bg-gray-800 text-white text-[10px] px-4 py-1.5 rounded font-bold hover:bg-yellow-600 transition shadow-sm active:scale-95">
                                LOG SAVE
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // 重要：横並びのコンテナ（div）の中ではなく、li自体の末尾に追加する
            li.insertAdjacentHTML('beforeend', logHTML);
            const textarea = document.getElementById(`input-${itemId}`);
            const countLabel = document.getElementById(`count-${itemId}`);
            textarea.addEventListener('input', () => {
                countLabel.innerText = `現在: ${textarea.value.length} 文字`;
                if(textarea.value.length >= GAME_CONFIG.minCommentLength) {
                    countLabel.classList.replace('text-gray-400', 'text-green-600');
                } else {
                    countLabel.classList.replace('text-green-600', 'text-gray-400');
                }
            });
        });
    }

    saveLog(itemId) {
        const text = document.getElementById(`input-${itemId}`).value.trim();
        if (text.length < GAME_CONFIG.minCommentLength) {
            alert(`あと ${GAME_CONFIG.minCommentLength - text.length} 文字足りません。自分の言葉で学びを言語化してみよう！`);
            return;
        }

        this.data.completed[itemId] = text;
        this.saveData();
        location.reload();
    }
}

let studySystem;
window.addEventListener('DOMContentLoaded', () => {
    studySystem = new StudySystem();
});