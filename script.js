


// ==========================================
// 1. 翻訳ボタンの機能
// ==========================================
function setupTranslateBtn(btn) {
    btn.addEventListener('click', () => {
        const commentFrame = btn.closest('.comment-frame');
        const btnText = btn.querySelector('.btn-text');
        const isEnglish = commentFrame.classList.toggle('is-translated');

        if (isEnglish) {
            btnText.textContent = 'original';
        } else {
            btnText.textContent = 'translate';
        }
    });
}

document.querySelectorAll('.translate-btn').forEach(setupTranslateBtn);


// ==========================================
// 2. メッセージモーダル（拡大表示）の機能
// ==========================================
const modal = document.getElementById('message-modal');
const modalBody = modal.querySelector('.modal-body');
const modalClose = modal.querySelector('.modal-close-btn');

document.querySelectorAll('.read-more-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const card = e.target.closest('.profile-card');
        const cardClone = card.cloneNode(true);

        cardClone.querySelector('.read-more-btn').style.display = 'none';
        cardClone.querySelector('.comment-text-wrapper').style.webkitLineClamp = 'unset';

        const cloneTranslateBtn = cardClone.querySelector('.translate-btn');
        if (cloneTranslateBtn) {
            setupTranslateBtn(cloneTranslateBtn);
        }

        modalBody.innerHTML = '';
        modalBody.appendChild(cardClone);
        modal.classList.add('is-open');
    });
});

modalClose.addEventListener('click', () => modal.classList.remove('is-open'));
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('is-open');
    }
});


// ==========================================
// 3. 画像モーダル（全文表示モーダル内でも動作）
// ==========================================
const imageModal = document.getElementById('image-modal');
const modalImgSrc = document.getElementById('modal-img-src');

if (imageModal && modalImgSrc) {
    // ページ全体のクリックを監視することで、複製されたボタンでも確実に動くようにします
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.image-gallery-btn');
        if (btn) {
            e.stopPropagation();
            const imgSrc = btn.getAttribute('data-img');
            if (imgSrc) {
                modalImgSrc.src = imgSrc;
                imageModal.classList.add('is-open');
            }
        }
    });

    // 画像モーダル画面のどこをタップしても閉じる
    imageModal.addEventListener('click', () => {
        imageModal.classList.remove('is-open');
    });
}


// ==========================================
// オープニング画像のランダム設定
// ==========================================
// ① 用意した8枚の画像ファイル名をリストにする
const splashImages = [
    'img/op-1.png', // 1枚目
    'img/op-2.png', // 2枚目
    'img/op-3.png', // 3枚目
    'img/op-4.png', // 4枚目
    'img/op-5.png', // 5枚目
    'img/op-6.png', // 6枚目
    'img/op-7.png', // 7枚目
    'img/op-8.png'  // 8枚目
];

const randomSplashImg = document.getElementById('random-splash-img');

if (randomSplashImg) {
    // ② 0 〜 7 の数字をランダムに選ぶ
    const randomIndex = Math.floor(Math.random() * splashImages.length);

    // ③ 選ばれた画像をセットする
    randomSplashImg.src = splashImages[randomIndex];
}

// オープニング画面の自動制御
const splash = document.getElementById('splash-overlay');
if (splash) {
    setTimeout(() => {
        splash.style.display = 'none';
    }, 3700); // 3.7秒後に要素消去
}



// ==========================================
// 更新バッジの自動表示・非表示（3日間）
// ==========================================
// data-update 属性が設定されているカードを全て探す
const updateCards = document.querySelectorAll('.profile-card[data-update]');

// 今日の日付を取得（時間は0時にリセットして純粋な日付比較にする）
const today = new Date();
today.setHours(0, 0, 0, 0);

updateCards.forEach(card => {
    // カードに書かれた日付を取得
    const updateStr = card.getAttribute('data-update');
    if (!updateStr) return;

    const updateDate = new Date(updateStr);
    updateDate.setHours(0, 0, 0, 0);

    // 「今日」と「更新日」の差を日数で計算
    const diffTime = today.getTime() - updateDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // ★設定：更新日から何日間表示するか（今回は 3日以内）
    // 0日(当日), 1日後, 2日後, 3日後 まで表示
    if (diffDays >= 0 && diffDays <= 3) {
        // 表示用の「月/日」を作成 (例: 7/31)
        const month = updateDate.getMonth() + 1;
        const date = updateDate.getDate();
        const badgeText = `${month}/${date} UPDATE!`;

        // CSSに渡すために data-badge-text を設定し、is-updated クラスをつける
        card.setAttribute('data-badge-text', badgeText);
        card.classList.add('is-updated');
    }
});


// ==========================================
// 4. 検索機能（ボタン / Enterキー実行）& アニメーション完了制御
// ==========================================
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const cardContainer = document.querySelector('.card-container');
const noResults = document.getElementById('no-results');
const noResultsImg = document.getElementById('no-results-img');
const filterBtn = document.getElementById('filter-updates-btn');

// ★該当なし画像（8枚）
const noResultsImages = [
    'img/noresult-1.png',
    'img/noresult-2.png',
    'img/noresult-3.png',
    'img/noresult-4.png',
    'img/noresult-5.png',
    'img/noresult-6.png',
    'img/noresult-7.png',
    'img/noresult-8.png'
];

// ページ読み込みから4.8秒後に初回アニメーションを完了状態（OFF）にする
if (cardContainer) {
    setTimeout(() => {
        cardContainer.classList.add('animation-done');
    }, 4800);
}

// ★「該当なし画像」をランダム表示＆アニメーション再再生する共通関数
function showRandomNoResultsImg() {
    if (noResultsImg && noResultsImages.length > 0) {
        const randomIndex = Math.floor(Math.random() * noResultsImages.length);
        noResultsImg.src = noResultsImages[randomIndex];

        // アニメーションのリセット＆再再生
        noResultsImg.style.animation = 'none';
        void noResultsImg.offsetWidth; // 強制再描画
        noResultsImg.style.animation = '';
    }
}

// 検索処理を実行する関数
function executeSearch() {
    if (!searchInput) return;

    // ★【独立化】検索実行時、更新ボタンのフィルターを解除して全体検索にする
    if (filterBtn) {
        filterBtn.classList.remove('is-active');
    }
    const allCards = document.querySelectorAll('.card-container .profile-card');
    allCards.forEach(card => {
        card.classList.remove('is-hidden-by-filter');
    });

    const query = searchInput.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.card-container .profile-card');
    let visibleCount = 0;

    if (cardContainer) {
        cardContainer.classList.add('animation-done');

        if (query !== '') {
            cardContainer.classList.add('is-searching');
        } else {
            cardContainer.classList.remove('is-searching');
        }
    }

    cards.forEach(card => {
        const name = card.querySelector('.profile-name')?.textContent.toLowerCase() || '';
        const textJa = card.querySelector('.text-ja')?.textContent.toLowerCase() || '';
        const textEn = card.querySelector('.text-en')?.textContent.toLowerCase() || '';

        if (name.includes(query) || textJa.includes(query) || textEn.includes(query)) {
            card.classList.remove('is-hidden');
            visibleCount++;
        } else {
            card.classList.add('is-hidden');
        }
    });

    // 検索結果ゼロの処理
    if (noResults) {
        if (visibleCount === 0 && query !== '') {
            showRandomNoResultsImg();
            noResults.classList.add('is-visible');
        } else {
            noResults.classList.remove('is-visible');
        }
    }
}

// 検索ボタン（🔍）クリック時
if (searchBtn) {
    searchBtn.addEventListener('click', executeSearch);
}

// 検索窓でEnterキー押下時
if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            executeSearch();
        }
    });
}

// 該当なし画像クリックでリセット
if (noResultsImg) {
    noResultsImg.addEventListener('click', () => {
        if (searchInput) {
            searchInput.value = '';
            executeSearch();
        }
    });
}


// ==========================================
// 5. 更新カードの抽出（フィルター）機能（独立版）
// ==========================================
if (filterBtn) {
    filterBtn.addEventListener('click', () => {

        // ★【独立化】更新ボタン押下時、検索状態を解除して全体から抽出する
        if (searchInput) {
            searchInput.value = ''; // 検索文字をクリア
        }
        if (cardContainer) {
            cardContainer.classList.remove('is-searching');
            cardContainer.classList.add('animation-done');
        }

        // 検索による非表示を全て解除
        const allCards = document.querySelectorAll('.card-container .profile-card');
        allCards.forEach(card => {
            card.classList.remove('is-hidden');
            card.classList.add('is-shown-instant'); // アニメーション遅延解除
        });

        // ボタンのON/OFF切り替え
        const isActive = filterBtn.classList.toggle('is-active');
        let visibleCount = 0;

        // コンテナにフィルター状態のクラスを付与/解除（検索時と同じ仕組みでラグをなくす）
        if (cardContainer) {
            if (isActive) {
                cardContainer.classList.add('is-filtered');
            } else {
                cardContainer.classList.remove('is-filtered');
            }
        }
        
        allCards.forEach(card => {
            if (isActive) {
                // ボタンON：.is-updated を持たないカードを隠す
                if (!card.classList.contains('is-updated')) {
                    card.classList.add('is-hidden-by-filter');
                } else {
                    card.classList.remove('is-hidden-by-filter');
                    visibleCount++;
                }
            } else {
                // ボタンOFF：フィルター用非表示を解除
                card.classList.remove('is-hidden-by-filter');
                visibleCount++;
            }
        });

        // 更新カードが1件もない（visibleCount === 0）場合の処理
        if (noResults) {
            if (isActive && visibleCount === 0) {
                showRandomNoResultsImg();
                noResults.classList.add('is-visible');
            } else {
                noResults.classList.remove('is-visible');
            }
        }
    });
}


// ==========================================
// 6. F5(リロード)時に必ずページトップから表示する
// ==========================================
// ブラウザがスクロール位置を記憶する機能を「手動(無効)」にする
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
// 念のため、ページ読み込み時に強制的に上へ戻す
window.scrollTo(0, 0);


// ==========================================
// 7. トップへ戻るボタンの表示・クリック動作
// ==========================================
const pageTopBtn = document.getElementById('page-top-btn');

if (pageTopBtn) {
    // スクロールしたときの動作
    window.addEventListener('scroll', () => {
        // 上から 300px 以上スクロールしたらボタンを表示
        if (window.scrollY > 300) {
            pageTopBtn.classList.add('is-visible');
        } else {
            pageTopBtn.classList.remove('is-visible');
        }
    });

    // ボタンをクリックしたときの動作
    pageTopBtn.addEventListener('click', () => {
        // behavior: 'smooth' を指定することで、パッと切り替わらずに高速で滑らかに上に戻ります
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}


// ==========================================
// 最終段埋め合わせ画像：8枚ランダムフリップ（安全対策版）
// ==========================================
{
    const fillerImages = [
        'img/last-1.png',
        'img/last-2.png',
        'img/last-3.png',
        'img/last-4.png',
        'img/last-5.png',
        'img/last-6.png',
        'img/last-7.png',
        'img/last-8.png'
    ];

    const fillerCard = document.querySelector('.filler-card');
    const fillerInner = document.getElementById('filler-inner');
    const fillerFront = document.getElementById('filler-front');
    const fillerBack = document.getElementById('filler-back');

    let currentImageIndex = 0;
    let isAnimating = false;

    if (fillerInner && fillerFront && fillerBack) {
        fillerInner.addEventListener('click', () => {
            if (isAnimating) return;
            isAnimating = true;

            const isFlipped = fillerInner.classList.contains('is-flipped');
            const hiddenImg = isFlipped ? fillerFront : fillerBack;

            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * fillerImages.length);
            } while (nextIndex === currentImageIndex && fillerImages.length > 1);

            const nextSrc = fillerImages[nextIndex];

            // 画像読み込みチェック（画像が存在する場合のみ差し替え）
            const tempImg = new Image();
            tempImg.onload = () => {
                hiddenImg.src = nextSrc;
                currentImageIndex = nextIndex;
            };
            tempImg.onerror = () => {
                console.warn('⚠️ 指定された画像が見つかりません:', nextSrc);
            };
            tempImg.src = nextSrc;

            // アニメーション実行
            if (isFlipped) {
                fillerInner.classList.remove('is-flipped');
                fillerInner.classList.add('is-unflipped');
            } else {
                fillerInner.classList.remove('is-unflipped');
                fillerInner.classList.add('is-flipped');
            }

            setTimeout(() => {
                isAnimating = false;
            }, 700);
        });
    }

    // 更新ボタンクリック時に即座に非表示を連動させる処理
    const updateButtons = document.querySelectorAll('.filter-updates-btn, [data-filter="update"]');
    updateButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setTimeout(() => {
                if (!fillerCard) return;
                const isActive = btn.classList.contains('is-active') || btn.classList.contains('active');
                if (isActive) {
                    fillerCard.classList.add('is-hidden');
                } else {
                    fillerCard.classList.remove('is-hidden');
                }
            }, 10);
        });
    });
}