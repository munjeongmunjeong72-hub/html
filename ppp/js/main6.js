
        let quantity = 1;
        const basePrice = 3500;

        const minusBtn = document.getElementById('minusBtn');
        const plusBtn = document.getElementById('plusBtn');
        const quantityEl = document.getElementById('quantity');
        const totalPriceEl = document.getElementById('totalPrice');

        function updateQuantity() {
            quantityEl.textContent = quantity;
            totalPriceEl.textContent = (basePrice * quantity).toLocaleString() + '원';

            if (quantity <= 1) minusBtn.classList.add('disabled');
            else minusBtn.classList.remove('disabled');
        }

        minusBtn.addEventListener('click', () => {
            if (quantity > 1) {
                quantity--;
                updateQuantity();
            }
        });

        plusBtn.addEventListener('click', () => {
            quantity++;
            updateQuantity();
        });

        // 옵션 클릭
        document.querySelectorAll('.option-item').forEach(item => {
            item.addEventListener('click', function() {
                const label = this.querySelector('.option-label').textContent;
                alert(label + ' 옵션을 선택하세요');
            });
        });

        // 뒤로가기
        document.querySelector('.back-btn').addEventListener('click', () => {
            window.history.back();
        });

        // 상품 정보 아이콘
        document.querySelector('.info-icon').addEventListener('click', () => {
            alert('(ICE) 카페라떼\n\n진한 에스프레소와 부드러운 우유가 어우러진 클래식 음료입니다.');
        });

        // ✅ 바로결제 -> ayment.html 이동
        const payNowBtn = document.getElementById('payNowBtn');
        payNowBtn.addEventListener('click', () => {
            window.location.href = './ayment.html';
        });

        // (원래 있던) 버튼 클릭 알림은 원하면 유지/삭제 가능
        // document.querySelectorAll('.btn').forEach(btn => {
        //   btn.addEventListener('click', function() {
        //     if (this.classList.contains('btn-secondary')) alert('장바구니에 담았습니다');
        //     else alert('주문이 완료되었습니다');
        //   });
        // });

        // 초기화
        updateQuantity();
    