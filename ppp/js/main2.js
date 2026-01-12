
    const container = document.getElementById('onboarding');
    const slidesWrapper = document.getElementById('slidesWrapper');
    const indicators = document.querySelectorAll('.indicator');
    const actionButton = document.getElementById('actionButton');

    let currentSlide = 0;
    const totalSlides = 3;

    // ✅ 자동 넘김
    const AUTO_MS = 3000;
    let autoSlideInterval = null;
    let resumeTimer = null;

    // Drag state
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    function containerWidth(){
      return container ? container.clientWidth : window.innerWidth;
    }

    function isLast(){
      return currentSlide === totalSlides - 1;
    }

    function goToSlide(index) {
      if (index < 0 || index >= totalSlides) return;

      currentSlide = index;
      const offset = -index * 100;
      slidesWrapper.style.transform = `translate3d(${offset}%, 0, 0)`;

      indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
      });

      // 마지막 슬라이드에서만 버튼 표시 + 자동 넘김 정지
      if (isLast()) {
        actionButton.classList.add('show');
        stopAutoSlide();
      } else {
        actionButton.classList.remove('show');
      }
    }

    function startAutoSlide() {
      stopAutoSlide();
      autoSlideInterval = setInterval(() => {
        if (currentSlide < totalSlides - 1) {
          goToSlide(currentSlide + 1);
        } else {
          stopAutoSlide();
        }
      }, AUTO_MS);
    }

    function stopAutoSlide() {
      if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
      }
      if (resumeTimer) {
        clearTimeout(resumeTimer);
        resumeTimer = null;
      }
    }

    // 사용자 조작 후 일정 시간 뒤 자동 넘김 재개(마지막 페이지는 제외)
    function scheduleResume(){
      if (isLast()) return;
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        if (!isDragging && !isLast()) startAutoSlide();
      }, 1800);
    }

    function handleStart(e) {
      isDragging = true;
      slidesWrapper.style.transition = 'none';
      stopAutoSlide();

      startX = (e.type.includes('mouse') ? e.pageX : e.touches[0].pageX);
      currentX = startX;
    }

    function handleMove(e) {
      if (!isDragging) return;
      if (e.cancelable) e.preventDefault();

      currentX = (e.type.includes('mouse') ? e.pageX : e.touches[0].pageX);
      const diff = currentX - startX;

      const w = containerWidth();
      const percentDiff = (diff / w) * 100;
      const offset = -currentSlide * 100 + percentDiff;

      slidesWrapper.style.transform = `translate3d(${offset}%, 0, 0)`;
    }

    function handleEnd() {
      if (!isDragging) return;
      isDragging = false;

      slidesWrapper.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

      const diff = currentX - startX;
      const threshold = containerWidth() * 0.2;

      if (Math.abs(diff) > threshold) {
        if (diff > 0 && currentSlide > 0) goToSlide(currentSlide - 1);
        else if (diff < 0 && currentSlide < totalSlides - 1) goToSlide(currentSlide + 1);
        else goToSlide(currentSlide);
      } else {
        goToSlide(currentSlide);
      }

      startX = 0;
      currentX = 0;
      scheduleResume();
    }

    // 터치/마우스 이벤트
    slidesWrapper.addEventListener('touchstart', handleStart, { passive: true });
    slidesWrapper.addEventListener('mousedown', handleStart);

    slidesWrapper.addEventListener('touchmove', handleMove, { passive: false });
    slidesWrapper.addEventListener('mousemove', handleMove);

    slidesWrapper.addEventListener('touchend', handleEnd);
    slidesWrapper.addEventListener('mouseup', handleEnd);
    slidesWrapper.addEventListener('mouseleave', handleEnd);
    window.addEventListener('mouseup', handleEnd);

    // 인디케이터 클릭
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        goToSlide(index);
        stopAutoSlide();
        scheduleResume();
      });
    });

    actionButton.addEventListener('click', () => {
  window.location.href = './login.html';
});

    // 로드시 자동 슬라이드 시작
    window.addEventListener('load', () => {
      goToSlide(0);
      startAutoSlide();
    });

    // 리사이즈 시 현재 슬라이드 정렬 유지
    window.addEventListener('resize', () => {
      slidesWrapper.style.transition = 'none';
      goToSlide(currentSlide);
      requestAnimationFrame(() => {
        slidesWrapper.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      });
    });

    window.addEventListener('beforeunload', stopAutoSlide);
 