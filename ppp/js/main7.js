
        // 닫기 버튼
        document.getElementById('closeBtn').addEventListener('click', () => {
            if (confirm('주문 화면을 닫으시겠습니까?')) {
                window.location.href = '/';
            }
        });

        // ✅ 홈 버튼 -> main.html 이동
        document.getElementById('navHome').addEventListener('click', () => {
            window.location.href = './main.html';
        });

        // 탭 전환
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                const tabId = this.id;
                if (tabId === 'tab1') {
                    alert('주문목록을 표시합니다');
                } else if (tabId === 'tab2') {
                    alert('준비중인 주문이 없습니다');
                } else if (tabId === 'tab3') {
                    alert('픽업대기 주문이 없습니다');
                } else if (tabId === 'tab4') {
                    alert('픽업완료 주문을 표시합니다');
                }
            });
        });

        // 일괄삭제
        document.querySelector('.clear-all').addEventListener('click', () => {
            if (confirm('모든 주문 내역을 삭제하시겠습니까?')) {
                alert('주문 내역이 삭제되었습니다');
            }
        });

        // 주문 아이템 클릭
        document.querySelector('.order-item').addEventListener('click', () => {
            alert('주문 상세 정보를 확인합니다');
        });

        // 네비게이션(기존 active 토글)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function() {
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            });
        });
    