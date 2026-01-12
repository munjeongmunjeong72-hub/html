(function () {
  const header = document.getElementById("siteHeader");
  const pageRoot = document.getElementById("pageRoot");

  // ✅ fixed header 높이만큼 페이지 패딩 자동 보정
  function syncHeaderOffset() {
    if (!header || !pageRoot) return;
    const h = header.getBoundingClientRect().height || 70;
    pageRoot.style.paddingTop = h + "px";
  }
  window.addEventListener("resize", syncHeaderOffset);
  window.addEventListener("load", syncHeaderOffset);
  syncHeaderOffset();

  // ✅ fixed header 때문에 앵커가 가려지는 문제 해결: 오프셋 스크롤 함수
  function scrollToHash(hash) {
    const el = document.querySelector(hash);
    if (!el) return;

    const headerH = header ? header.getBoundingClientRect().height : 70;
    const y = el.getBoundingClientRect().top + window.pageYOffset - headerH - 10;

    window.scrollTo({ top: y, behavior: "smooth" });
  }

  // Desktop nav click: prevent default + offset scroll
  document.querySelectorAll('nav a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToHash(a.getAttribute("href"));
    });
  });

  // CTA Contact 버튼도 동일 처리
  document.querySelectorAll('a.btn[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      e.preventDefault();
      scrollToHash(href);
    });
  });

  // ✅ Mobile menu toggle
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  function setMenu(open) {
    if (!menuBtn || !mobileMenu) return;
    mobileMenu.classList.toggle("open", open);
    mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.contains("open");
      setMenu(!isOpen);
    });

    // mobile links click
    mobileMenu.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        setMenu(false);
        scrollToHash(a.getAttribute("href"));
      });
    });

    // click outside closes (optional)
    document.addEventListener("click", (e) => {
      if (!mobileMenu.classList.contains("open")) return;
      const within = header.contains(e.target);
      if (!within) setMenu(false);
    });

    // esc closes
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenu(false);
    });
  }

  // ✅ Active nav link by section
  const navLinks = Array.from(document.querySelectorAll(".nav-desktop a[data-link]"));
  const secEls = ["main", "about", "coding", "design", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = e.target.id;
        navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("data-link") === id));
      });
    },
    { threshold: 0.55 }
  );
  secEls.forEach((s) => obs.observe(s));

  // ✅ Skills animate when visible
  const skillsWrap = document.querySelector("#skills");
  if (skillsWrap) {
    const skillObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          document.querySelectorAll(".skill").forEach((sk) => {
            const v = sk.getAttribute("data-skill");
            const bar = sk.querySelector(".bar i");
            if (bar) bar.style.width = (v || "0") + "%";
          });
          skillObs.disconnect();
        });
      },
      { threshold: 0.35 }
    );
    skillObs.observe(skillsWrap);
  }

  // ✅ Design filter
  const filters = document.querySelectorAll(".filter");
  const tiles = Array.from(document.querySelectorAll(".tile"));
  filters.forEach((f) =>
    f.addEventListener("click", () => {
      filters.forEach((x) => x.classList.remove("active"));
      f.classList.add("active");
      const key = f.getAttribute("data-filter");
      tiles.forEach((t) => {
        const cat = t.getAttribute("data-cat");
        t.style.display = key === "all" || cat === key ? "" : "none";
      });
    })
  );

  // ✅ Modal (simple preview)
  const modal = document.getElementById("modal");
  const modalClose = document.getElementById("modalClose");
  const modalTitle = document.getElementById("modalTitle");

  function openModal(title) {
    if (!modal || !modalTitle) return;
    modalTitle.textContent = title || "Preview";
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (modal && modalClose) {
    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    document.querySelectorAll("[data-open]").forEach((el) => {
      el.addEventListener("click", () => openModal(el.getAttribute("data-open")));
    });
  }

  // ✅ Copy helpers
  function toast(msg) {
    const t = document.createElement("div");
    t.textContent = msg;
    t.style.cssText =
      "position:fixed;left:50%;bottom:22px;transform:translateX(-50%);" +
      "padding:10px 14px;border-radius:999px;background:rgba(47,191,113,.16);" +
      "border:1px solid rgba(47,191,113,.22);box-shadow:0 10px 24px rgba(31,42,34,.10);" +
      "color:rgba(31,42,34,.90);font-family:'Noto Sans KR',sans-serif;font-size:13px;z-index:3000;";
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1200);
  }

  function copy(text) {
    navigator.clipboard.writeText(text).then(() => toast("Copied ✓"));
  }

  const email = document.getElementById("emailText")?.textContent?.trim() || "you@example.com";
  const email2 = document.getElementById("emailText2");
  if (email2) email2.textContent = email;

  document.getElementById("copyEmail")?.addEventListener("click", () => copy(email));
  document.getElementById("copyAll")?.addEventListener("click", () => copy(`Email: ${email}\nPhone: 010-5338-2532`));
})();
