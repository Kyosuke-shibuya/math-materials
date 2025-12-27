// main.js
// 2025 Curriculum Manager

// ▼▼▼ データ定義 (全科目ボタンモード化) ▼▼▼
const subjectData = {
    "数学 I": {
        isMenu: true,
        units: [
            { 
                title: "数と式・集合と論証", 
                subtitle: "Numbers, Sets & Logic", 
                url: "#", 
                icon: "fa-solid fa-calculator" 
            },
            { 
                title: "2次関数", 
                subtitle: "Quadratic Functions", 
                url: "#", 
                icon: "fa-solid fa-chart-line" 
            },
            { 
                title: "図形と計量", 
                subtitle: "Figures & Trigonometry", 
                url: "#", 
                icon: "fa-solid fa-draw-polygon" 
            },
            { 
                title: "データの分析", 
                subtitle: "Data Analysis", 
                url: "#", 
                icon: "fa-solid fa-chart-bar" 
            }
        ]
    },
    "数学 A": {
        isMenu: true,
        units: [
            { 
                title: "場合の数と確率", 
                subtitle: "Cases & Probability", 
                url: "#", 
                icon: "fa-solid fa-dice" 
            },
            { 
                title: "図形の性質", 
                subtitle: "Properties of Figures", 
                url: "#", 
                icon: "fa-solid fa-shapes" 
            },
            { 
                title: "数学と人間の活動", 
                subtitle: "Math & Human Activities", 
                url: "#", 
                icon: "fa-solid fa-users" 
            }
        ]
    },
    "数学 II": {
        isMenu: true,
        units: [
            { 
                title: "微分・積分法", 
                subtitle: "Differential & Integral", 
                url: "math2_calculus.html", // 完成済み
                icon: "fa-solid fa-chart-area" 
            },
            { 
                title: "式と証明・複素数", 
                subtitle: "Equations & Proofs", 
                url: "math2_equation_comp.html", // 完成済み
                icon: "fa-solid fa-superscript" 
            },
            { 
                title: "図形と方程式", 
                subtitle: "Figures & Equations", 
                url: "#", 
                icon: "fa-solid fa-circle-nodes" 
            },
            { 
                title: "三角関数", 
                subtitle: "Trigonometric Functions", 
                url: "#", 
                icon: "fa-solid fa-wave-square" 
            },
            { 
                title: "指数・対数関数", 
                subtitle: "Exp & Log Functions", 
                url: "#", 
                icon: "fa-solid fa-arrow-up-right-dots" 
            }
        ]
    },
    "数学 B": {
        isMenu: true,
        units: [
            { 
                title: "数列", 
                subtitle: "Sequences", 
                url: "#", 
                icon: "fa-solid fa-arrow-down-1-9" 
            },
            { 
                title: "統計的な推測", 
                subtitle: "Statistical Inference", 
                url: "#", 
                icon: "fa-solid fa-chart-pie" 
            }
        ]
    },
    "数学 III": {
        isMenu: true,
        units: [
            { 
                title: "極限", 
                subtitle: "Limits", 
                url: "#", 
                icon: "fa-solid fa-infinity" 
            },
            { 
                title: "微分法", 
                subtitle: "Differentiation", 
                url: "#", 
                icon: "fa-solid fa-microscope" 
            },
            { 
                title: "積分法", 
                subtitle: "Integration", 
                url: "#", 
                icon: "fa-solid fa-layer-group" 
            }
        ]
    },
    "数学 C": {
        isMenu: true,
        units: [
            { 
                title: "ベクトル", 
                subtitle: "Vectors", 
                url: "#", 
                icon: "fa-solid fa-location-arrow" 
            },
            { 
                title: "複素数平面", 
                subtitle: "Complex Plane", 
                url: "#", 
                icon: "fa-solid fa-globe" 
            },
            { 
                title: "式と曲線", 
                subtitle: "Curves", 
                url: "#", 
                icon: "fa-solid fa-bezier-curve" 
            }
        ]
    }
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
const contentList = document.getElementById('content-list'); // 通常リストエリア（今回は使いませんが残します）
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
    // 今回はすべてのデータに isMenu: true をつけたので、常にこちらの分岐に入ります
    if (data.isMenu) {
        // --- A. 単元選択モード ---
        contentList.classList.add('hidden'); 
        unitMenu.classList.remove('hidden'); 
        
        // ボタンを生成
        unitGrid.innerHTML = '';
        data.units.forEach(unit => {
            const btn = document.createElement('a');
            btn.href = unit.url;
            // 遷移先のURLが "#" ならクリック無効っぽい見た目にする、などの処理も可能ですが
            // 今回は統一されたデザインで出力します
            
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
        // --- B. 通常リストモード (念のためのバックアップ) ---
        unitMenu.classList.add('hidden');
        contentList.classList.remove('hidden');

        const prints = data.prints || [];
        const materials = data.materials || [];
        //リスト生成関数
        function renderList(items, element, iconClass) {
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
        }

        renderList(prints, printList, "fa-solid fa-file-pdf");
        renderList(materials, materialList, "fa-solid fa-arrow-up-right-from-square");
    }

    // Scroll to top
    window.scrollTo(0, 0);
}