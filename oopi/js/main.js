document.addEventListener('DOMContentLoaded', () => {
    // 1. 커스텀 커서 로직
    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        dot.style.left = `${posX}px`;
        dot.style.top = `${posY}px`;

        outline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    // 호버 시 커서 클래스 토글
    const hoverTargets = document.querySelectorAll('a, button, .portfolio-item');
    hoverTargets.forEach(target => {
        target.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        target.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // 2. 배경 꽃 입자 생성기
    const container = document.getElementById('particle-container');
    const particleCount = 30; // 입자 수 조절

    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        
        // 꽃 모양이 잘 보이도록 크기 랜덤 설정 (10px ~ 25px)
        const size = Math.random() * 15 + 10;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}vw`;
        p.style.animationDuration = `${Math.random() * 15 + 10}s`; // 천천히 움직이도록 설정
        p.style.animationDelay = `${Math.random() * 5}s`;
        
        container.appendChild(p);
    }

    // 3. 네비게이션 활성화
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.wrap[id]');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            if (pageYOffset >= section.offsetTop - 150) current = section.getAttribute('id');
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) link.classList.add('active');
        });
    });

    // 4. 스킬 바 애니메이션
    const skillBars = document.querySelectorAll('.skill-progress');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.style.width = entry.target.parentElement.nextElementSibling ? "" : entry.target.style.width;
        });
    }, { threshold: 0.5 });
    skillBars.forEach(bar => observer.observe(bar));

    // 5. 포트폴리오 기능 (초기화, 필터, 모달)
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const captionText = document.getElementById('caption');
    const closeBtn = document.querySelector('.modal-close');

    portfolioItems.forEach(item => item.style.backgroundImage = `url(${item.getAttribute('data-image-url')})`);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.getAttribute('data-filter');
            portfolioItems.forEach(item => {
                item.classList.toggle('hidden', filter !== 'all' && item.getAttribute('data-category') !== filter);
            });
        });
    });

    portfolioItems.forEach(item => {
        item.addEventListener('click', function() {
            modal.style.display = "block";
            modalImg.src = this.getAttribute('data-image-url');
            captionText.innerHTML = this.querySelector('.project-title').textContent;
        });
    });

    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; };
});