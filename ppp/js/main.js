
    //   // ✅ 5초 후 온보딩 파일로 "화면 넘김"
    //   setTimeout(() => {
    //     // replace를 쓰면 뒤로가기 했을 때 스플래시로 안 돌아가는 효과
    //     window.location.replace('onboarding.html');
    //   }, 5000);
 
  setTimeout(() => {
    const next = new URL('./slide.html', window.location.href);
    window.location.href = next.href;
  }, 5000);


