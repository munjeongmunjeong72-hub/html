
        // 주문내역 접기/펼치기
        const collapseBtn = document.getElementById('collapseBtn');
        const orderContent = document.getElementById('orderContent');
        let isCollapsed = false;

        collapseBtn.addEventListener('click', () => {
            isCollapsed = !isCollapsed;
            if (isCollapsed) {
                orderContent.style.display = 'none';
                collapseBtn.classList.add('collapsed');
            } else {
                orderContent.style.display = 'block';
                collapseBtn.classList.remove('collapsed');
            }
        });

        // 예약정보 클릭
        document.querySelector('.reservation-card').addEventListener('click', () => {
            alert('예약 시간 변경 페이지');
        });

        // 옵션 클릭
        document.querySelectorAll('.option-row').forEach(row => {
            row.addEventListener('click', function() {
                const label = this.querySelector('.option-label').textContent;
                if (this.querySelector('.option-arrow')) {
                    alert(label + ' 선택 페이지로 이동');
                }
            });
        });

        // 결제하기 버튼
       
  // ... (위 코드는 그대로)

  // 결제하기 버튼 ✅ complete.html로 이동
  document.getElementById('payBtn').addEventListener('click', () => {
    if (confirm('3,150원을 결제하시겠습니까?')) {
      window.location.href = './complete.html';
    }
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
          document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function() {
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
    