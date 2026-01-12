
        // 메뉴 데이터
        const menuData = {
            new: [
                { name: '(ICE) 크림보틀레떼', price: '3,600원', emoji: ' <img src="./img/cf1 (2).png" alt="">', badge: 'ice' },
                { name: '(ICE) 삼색아이스프라페', price: '4,700원', emoji: '<img src="img/cf1 (1).png" alt="">', badge: null },
                { name: '(ICE) 초코말차프라떼', price: '4,700원', emoji: '<img src="img/cf1 (3).jpg" alt="">', badge: null },
                { name: '(ICE) 유자차', price: '2,800원', emoji: '<img src="img/cf1 (3).png" alt="">', badge: 'new' }
            ],
            coffee: {
                ice: [
                    { name: '(ICE) 아메리카노', price: '2,000원', emoji: '<img src="./img/savsa 1.png" alt="">', badge: null },
                    { name: '(ICE) 메가리카노', price: '2,500원', emoji: '<img src="./img/savsa 1.png" alt="">', badge: null },
                    { name: '(ICE) 핫카리카노', price: '2,200원', emoji: '<img src="./img/savsa 1.png" alt="">', badge: null },
                    { name: '(ICE) 카페라떼', price: '3,500원', emoji: '<img src="./img/aa 1.png" alt="">', badge: 'ice' },
                    { name: '(ICE) 연유라떼', price: '3,000원', emoji: '<img src="./img/aa 1.png" alt="">', badge: null },
                    { name: '(ICE) 연유라떼', price: '2,700원', emoji: '<img src="./img/aa 1.png" alt="">', badge: null },
                    { name: '(ICE) 흑메카커피', price: '3,100원', emoji: '<img src="./img/savsa 1.png" alt="">', badge: null },
                    { name: '(ICE) 흑메카리스커피', price: '3,500원', emoji: '<img src="./img/savsa 1.png" alt="">', badge: null }
                ],
                hot: [
                    { name: '(HOT) 에스프레소', price: '1,000원', emoji: '<img src="./img/sassadsadaasas 2.png" alt="">', badge: null },
                    { name: '(HOT) 에스프레소 (롱)', price: '1,500원', emoji: '<img src="./img/sascccaasas 1.png" alt="">', badge: null },
                    { name: '(HOT) 아메리카노', price: '1,500원', emoji: '<img src="./img/swfwasa 1.png" alt="">', badge: null },
                    { name: '(HOT) 카페라떼', price: '3,000원', emoji: '<img src="./img/aaaaaaaassa 1.png" alt="">', badge: null },
                    { name: '(HOT) 연유라떼', price: '3,500원', emoji: '<img src="./img/assa 1.png" alt="">', badge: null },
                    { name: '(HOT) 흑아메리카노', price: '2,700원', emoji: '<img src="./img/swfwasa 1.png" alt="">', badge: null },
                    { name: '(HOT) 바닐라라떼', price: '3,700원', emoji: '<img src="./img/aaaaaaaassa 1.png" alt="">', badge: null }
                ]
            },
            drink: {
                ice: [
                    { name: '(ICE) 모히또에이드', price: '3,700원', emoji: '<img src="./img/23 2.png" alt="">', badge: null },
                    { name: '(ICE) 청포도에이드', price: '3,700원', emoji: '<img src="./img/as244 2.png" alt="">', badge: null },
                    { name: '(ICE) 자몽에이드', price: '3,700원', emoji: '<img src="./img/addadddvfcv 1.png" alt="">', badge: null },
                    { name: '(ICE) 레몬에이드', price: '3,700원', emoji: ' <img src="./img/sfafa 2.png" alt="">', badge: null },
                    { name: '(ICE) 체리콜라', price: '3,700원', emoji: '<img src="./img/cf1 (4).jpg" alt="">', badge: null },
                    { name: '(ICE) 골든키위주스', price: '3,200원', emoji: '<img src="./img/cf1 (10).jpg" alt="">', badge: null },
                    { name: '(ICE) 딸기주스', price: '3,200원', emoji: ' <img src="./img/123 1.png" alt="">', badge: null },
                    { name: '(ICE) 블루베리플렌주스', price: '3,200원', emoji: '<img src="./img/cf1 (9).jpg" alt="">', badge: null }
                ]
            }
        };

        let currentCategory = 'coffee';
        let currentSubTab = 'ice';

        // 메뉴 렌더링
        function renderMenu() {
            const menuList = document.getElementById('menuList');
            let items = [];

            if (currentCategory === 'new') {
                items = menuData.new;
            } else if (currentCategory === 'coffee') {
                items = menuData.coffee[currentSubTab] || [];
            } else if (currentCategory === 'drink') {
                items = menuData.drink[currentSubTab] || [];
            }

            menuList.innerHTML = items.map(item => `
                <div class="menu-item">
                    <div class="menu-image">
                        ${item.emoji}
                        ${item.badge ? `<div class="badge-icon ${item.badge === 'new' ? 'badge-new' : ''}">
                            ${item.badge === 'ice' ? 'ice' : 'hot'}
                        </div>` : ''}
                    </div>
                    <div class="menu-info">
                        <div class="menu-name">${item.name}</div>
                        <div class="menu-price">${item.price}</div>
                    </div>
                    <button class="cart-btn"><img src="./img/shopping.png" alt=""></button>
                </div>
            `).join('');
        }

        // 탭 전환
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                if (this.id === 'tab-new') currentCategory = 'new';
                else if (this.id === 'tab-coffee') currentCategory = 'coffee';
                else if (this.id === 'tab-drink') currentCategory = 'drink';
                else if (this.id === 'tab-dessert') currentCategory = 'dessert';

                renderMenu();
            });
        });

        // 서브탭 전환
        document.querySelectorAll('.sub-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                if (this.id === 'subtab-hot') currentSubTab = 'hot';
                else if (this.id === 'subtab-ice') currentSubTab = 'ice';
                else if (this.id === 'subtab-blended') currentSubTab = 'blended';

                renderMenu();
            });
        });

        // 네비게이션
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function() {
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // 뒤로가기
        document.querySelector('.back-btn').addEventListener('click', () => {
            window.history.back();
        });

        // 초기 렌더링
        renderMenu();

        // ✅ 노란 카트 버튼 클릭 -> detail.html로 이동 (이벤트 위임)
        const menuListEl = document.getElementById('menuList');
        menuListEl.addEventListener('click', (e) => {
          const cartBtn = e.target.closest('.cart-btn');
          if (!cartBtn) return;

          window.location.href = './detail.html';
        });