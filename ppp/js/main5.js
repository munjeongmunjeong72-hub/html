
    const userIdInput = document.getElementById('userId');
    const userPasswordInput = document.getElementById('userPassword');
    const passwordDots = document.getElementById('passwordDots');
    const loginButton = document.getElementById('loginButton');
    const pwToggle = document.getElementById('pwToggle');

    let pwShown = false;

    function renderPasswordDots() {
      const length = userPasswordInput.value.length;
      const dots = passwordDots.querySelectorAll('.dot');
      dots.forEach((dot, index) => {
        if (index < length) dot.classList.add('show');
        else dot.classList.remove('show');
      });
    }

    // 비밀번호 입력시 커스텀 dot 표시(숨김 상태일 때만)
    userPasswordInput.addEventListener('input', function() {
      if (!pwShown) renderPasswordDots();
      checkInputs();
    });

    // 아이디 입력
    userIdInput.addEventListener('input', checkInputs);

    // 입력 필드 포커스 효과
    document.querySelectorAll('.input-field').forEach(field => {
      field.addEventListener('focus', function() {
        this.parentElement.style.transform = 'translateY(-2px)';
      });
      field.addEventListener('blur', function() {
        this.parentElement.style.transform = 'translateY(0)';
      });
    });

    // 로그인 버튼 활성화
    function checkInputs() {
      if (userIdInput.value.trim() && userPasswordInput.value.trim()) {
        loginButton.disabled = false;
      } else {
        loginButton.disabled = true;
      }
    }

    // 👁 토글
    pwToggle.addEventListener('click', () => {
      pwShown = !pwShown;
      document.body.classList.toggle('pw-shown', pwShown);
      document.body.classList.toggle('pw-hidden', !pwShown);

      if (!pwShown) renderPasswordDots(); // 다시 숨김으로 돌아오면 dot 갱신
      userPasswordInput.focus();
      // 커서를 끝으로 이동
      const v = userPasswordInput.value;
      userPasswordInput.value = '';
      userPasswordInput.value = v;
    });

    // 로그인 처리
   // 로그인 처리 -> 메인으로 이동
loginButton.addEventListener('click', function() {
  if (this.disabled) return;

  const userId = userIdInput.value.trim();
  const userPassword = userPasswordInput.value.trim();

  // (선택) 간단히 로그인 정보 저장 - 필요 없으면 제거 가능
  localStorage.setItem('loggedIn', 'true');
  localStorage.setItem('userId', userId);

  // ✅ 메인 화면으로 이동 (메인 파일명이 index.html일 때)
  window.location.replace('./main.html');
});


    // 엔터키로 로그인
    userPasswordInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && !loginButton.disabled) loginButton.click();
    });

    // 소셜 로그인 버튼
    document.querySelectorAll('.social-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const service = this.getAttribute('aria-label');
        alert(`${service} 처리 중...`);
      });
    });
    
    // 링크 클릭 처리
    document.querySelectorAll('.link').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        alert(this.textContent + ' 페이지로 이동합니다.');
      });
    });

    // 초기 버튼 상태/도트
    loginButton.disabled = true;
    renderPasswordDots();
 