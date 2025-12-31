// js/game.js

const GAME_CONFIG = {
    minCommentLength: 30, // コンプリートに必要な最小文字数
    units: {
        "matha_prob": 16,     // 数学A：全16回
        "mathb_sequence": 18, // 数学B：全18回
        "mathc_vector3d": 13  // 数学C：全13回
    }
};

class StudySystem {
    constructor() {
        this.data = this.loadData();
        this.initUI();
        this.attachEvents();
        // ページ読み込み完了後に掲示板を設置
        setTimeout(() => this.injectLearningLogs(), 500);
    }

    loadData() {
        const saved = localStorage.getItem('study_system_data');
        return saved ? JSON.parse(saved) : { completed: {} };
    }

    saveData() {
        localStorage.setItem('study_system_data', JSON.stringify(this.data));
    }

    // 達成率の計算
    getProgress(pageKey) {
        const total = GAME_CONFIG.units[pageKey] || 0;
        if (total === 0) return 0;
        const done = Object.keys(this.data.completed).filter(k => k.startsWith(pageKey)).length;
        return Math.floor((done / total) * 100);
    }

    // ヘッダーUI（現在のページの進捗を表示）
    initUI() {
        const pageKey = window.location.pathname.split('/').pop().replace('.html', '');
        if (!GAME_CONFIG.units[pageKey]) return;

        const progress = this.getProgress(pageKey);
        const widgetHTML = `
            <div id="study-widget" class="fixed top-2 right-2 bg-gray-900 border border-gray-700 p-2 rounded shadow-xl z-[100] w-32 md:w-40 font-sans">
                <div class="flex justify-between items-baseline mb-1">
                    <span class="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Progress</span>
                    <span class="text-sm text-yellow-500 font-mono font-bold">${progress}%</span>
                </div>
                <div class="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
                    <div class="bg-yellow-500 h-full transition-all duration-1000" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
    }

    // 各プリントの下に感想欄を設置
    injectLearningLogs() {
        const listItems = document.querySelectorAll('li.group');
        const pageKey = window.location.pathname.split('/').pop().replace('.html', '');
        
        listItems.forEach((li, index) => {
            const itemId = `${pageKey}_item_${index + 1}`;
            const isDone = this.data.completed[itemId];
            const savedText = isDone || "";

            const logHTML = `
                <div class="mt-4 p-4 border-t border-gray-100 bg-gray-50 rounded-b-sm">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                            <i class="fa-solid fa-pen-nib"></i> Learning Log (30字以上で完了)
                        </span>
                        ${isDone ? '<span class="text-[10px] text-green-600 font-bold"><i class="fa-solid fa-check-circle"></i> COMPLETED</span>' : ''}
                    </div>
                    <div class="flex flex-col gap-2">
                        <textarea id="input-${itemId}" rows="2" maxlength="200" placeholder="つまづいた所や、工夫した解き方をメモしよう..." 
                            class="w-full p-3 text-xs border ${isDone ? 'border-green-200 bg-white' : 'border-gray-200'} rounded focus:outline-none focus:border-yellow-500 transition shadow-inner resize-none">${savedText}</textarea>
                        <div class="flex justify-between items-center">
                            <span id="count-${itemId}" class="text-[9px] text-gray-400">現在: 0 文字</span>
                            <button onclick="studySystem.saveLog('${itemId}')" 
                                class="bg-gray-800 text-white text-[10px] px-4 py-1.5 rounded font-bold hover:bg-yellow-600 transition shadow-md">
                                LOG SAVE
                            </button>
                        </div>
                    </div>
                </div>
            `;
            const container = li.querySelector('div') || li;
            container.insertAdjacentHTML('beforeend', logHTML);

            // 文字数カウントのリアルタイム反映
            const textarea = document.getElementById(`input-${itemId}`);
            const countLabel = document.getElementById(`count-${itemId}`);
            textarea.addEventListener('input', () => {
                countLabel.innerText = `現在: ${textarea.value.length} 文字`;
            });
            countLabel.innerText = `現在: ${textarea.value.length} 文字`;
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
        location.reload(); // 進捗率更新のためリロード
    }
}

let studySystem;
window.addEventListener('DOMContentLoaded', () => {
    studySystem = new StudySystem();
});