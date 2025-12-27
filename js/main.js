// ▼▼▼ データ定義 ▼▼▼
const subjectData = {
    "数学 I": {
        // 通常のリストモード
        prints: [
            { title: "第1回：数と式 (基礎)", url: "#" },
            { title: "第2回：数と式 (応用)", url: "#" },
            { title: "第3回：集合と論証", url: "#" },
            { title: "第4回：2次関数とグラフ", url: "#" }
        ],
        materials: [
            { title: "演習問題集 Vol.1", url: "#" },
            { title: "公式確認シート", url: "#" }
        ]
    },
    "数学 II": {
        // ★単元選択モード (isMenu: true)
        isMenu: true,
        units: [
             { 
                title: "式と証明・複素数と方程式", 
                subtitle: "Equation & Complex Number", 
                url: "math2_equation_comp.html", // 次に作るファイル
                icon: "fa-solid fa-chart-area"
            },
            { 
                title: "微分・積分法", 
                subtitle: "Differential & Integral", 
                url: "math2_calculus.html", // 次に作るファイル
                icon: "fa-solid fa-chart-area"
            },
            { 
                title: "図形と方程式", 
                subtitle: "Figures & Equations", 
                url: "#", // 準備中
                icon: "fa-solid fa-shapes"
            },
            { 
                title: "三角関数", 
                subtitle: "Trigonometric Functions", 
                url: "#", // 準備中
                icon: "fa-solid fa-wave-square"
            },
            { 
                title: "指数・対数関数", 
                subtitle: "Exp & Log Functions", 
                url: "#", // 準備中
                icon: "fa-solid fa-arrow-up-right-dots"
            }
        ]
    },
    // 他の科目...
};
// ▲▲▲ データ定義終わり ▲▲▲


// DOM Elements
const homeView = document.getElementById('home-view');
const subView = document.getElementById('sub-view');
const subjectTitle = document.getElementById('subject-title');
const navOverlay = document.getElementById('nav-overlay');

// 2つの表示エリア
const unitMenu = document.getElementById('unit-menu');     // 単元ボタンエリア
const unitGrid = document.getElementById('unit-grid');     // ボタンを入れる場所
const contentList = document.getElementById('content-list'); // 通常リストエリア

// リストの入れ物
const printList = document.getElementById('print-list');
const materialList = document.getElementById('material-list');

// Toggle Hamburger Menu
function toggleMenu() {
    if (navOverlay.classList.contains('-translate-x-full')) {
        navOverlay.classList.remove('-translate-x-full');
    } else {
        navOverlay.classList.add('-translate-x-full');
    }
}

// Show Home View
function showHome() {
    subView.classList.add('hidden');
    subView.classList.remove('fade-in');
    
    homeView.classList.remove('hidden');
    homeView.classList.add('fade-in');
    
    window.scrollTo(0, 0);
}

// Show Subject (Sub) View
function showSubject(name) {
    homeView.classList.add('hidden');
    homeView.classList.remove('fade-in');

    subView.classList.remove('hidden');
    subView.classList.add('fade-in');
    
    // 1. タイトル更新
    subjectTitle.textContent = name;
    
    // 2. データを取得
    const data = subjectData[name] || {};

    // 3. 表示モードの切り替え
    if (data.isMenu) {
        // --- A. 単元選択モード (Math IIなど) ---
        contentList.classList.add('hidden'); // リストを隠す
        unitMenu.classList.remove('hidden'); // ボタンを表示
        
        // ボタンを生成
        unitGrid.innerHTML = '';
        data.units.forEach(unit => {
            const btn = document.createElement('a');
            btn.href = unit.url;
            // 別ファイルへのリンクなので target="_self" (デフォルト) または "_blank"
            // ここではページ移動として扱うため _self ですが、今はファイルがないので404になります
            btn.className = "group bg-white border border-gray-200 p-8 hover:bg-gray-800 hover:text-white transition duration-300 flex items-center shadow-sm hover:shadow-lg rounded-sm";
            btn.innerHTML = `
                <div class="text-3xl text-gray-300 group-hover:text-white mr-6 transition">
                    <i class="${unit.icon}"></i>
                </div>
                <div>
                    <div class="text-xl font-serif mb-1">${unit.title}</div>
                    <div class="text-xs text-gray-400 group-hover:text-gray-300 tracking-widest uppercase">${unit.subtitle}</div>
                </div>
                <div class="ml-auto text-gray-300 group-hover:text-white">
                    <i class="fa-solid fa-arrow-right"></i>
                </div>
            `;
            unitGrid.appendChild(btn);
        });

    } else {
        // --- B. 通常リストモード (Math Iなど) ---
        unitMenu.classList.add('hidden');    // ボタンを隠す
        contentList.classList.remove('hidden'); // リストを表示

        // データがない場合のデフォルト
        const prints = data.prints || [];
        const materials = data.materials || [];

        // リスト生成関数
        const renderList = (items, element, iconClass) => {
            element.innerHTML = '';
            if (items.length === 0) {
                element.innerHTML = '<li class="text-xs text-gray-400 p-2">準備中です</li>';
                return;
            }
            items.forEach(item => {
                const li = document.createElement('li');
                li.className = "flex justify-between items-center group cursor-pointer hover:bg-white p-2 transition border-b border-gray-100";
                li.innerHTML = `
                    <span class="flex-1">${item.title}</span>
                    <a href="${item.url}" target="_blank" class="text-gray-300 group-hover:text-gray-600 transition">
                        <i class="${iconClass}"></i>
                    </a>
                `;
                element.appendChild(li);
            });
        };

        renderList(prints, printList, "fa-solid fa-file-pdf");
        renderList(materials, materialList, "fa-solid fa-arrow-up-right-from-square");
    }

    // Scroll to top
    window.scrollTo(0, 0);
}