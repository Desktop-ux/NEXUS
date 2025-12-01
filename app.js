// Simple SPA navigation + GSAP animations
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item");
  const pages = document.querySelectorAll(".page");

  let currentPageId = "page-dashboard";

  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const pageKey = btn.dataset.page;
      const targetId = `page-${pageKey}`;
      if (targetId === currentPageId) return;

      // update active nav
      navItems.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      switchPage(currentPageId, targetId);
      currentPageId = targetId;
    });
  });

  function switchPage(oldId, newId) {
    const oldPage = document.getElementById(oldId);
    const newPage = document.getElementById(newId);
    if (!newPage) return;

    if (oldPage) {
      gsap.to(oldPage, {
        duration: 0.35,
        opacity: 0,
        y: 10,
        ease: "power2.inOut",
        onComplete: () => {
          oldPage.classList.remove("active");
          newPage.classList.add("active");
          animatePage(newId);
        },
      });
    } else {
      newPage.classList.add("active");
      animatePage(newId);
    }
  }

  function animatePage(pageId) {
    const page = document.getElementById(pageId);
    if (!page) return;

    page.style.opacity = 0;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      page,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.45 }
    );

    const title = page.querySelector(".page-title");
    if (title) {
      tl.from(
        title,
        { y: 18, opacity: 0, duration: 0.4 },
        "-=0.25"
      );
    }

    const cards = page.querySelectorAll(".card");
    if (cards.length) {
      tl.from(
        cards,
        { y: 30, opacity: 0, duration: 0.5, stagger: 0.08 },
        "-=0.15"
      );
    }

    animateProgress(page);
    animateCounters(page);
    animatePercentBars(page);
    setupRowScrollAnimations(page);
  }

  function animateProgress(scope) {
    scope.querySelectorAll(".progress").forEach((bar) => {
      const target = parseFloat(bar.dataset.progress || "0");
      const fill = bar.querySelector(".progress__fill");
      if (!fill) return;
      gsap.fromTo(
        fill,
        { width: "0%" },
        { width: `${target}%`, duration: 1.1, ease: "power3.out" }
      );
    });
  }

  function animatePercentBars(scope) {
    scope.querySelectorAll(".percent-cell").forEach((cell) => {
      const target = parseFloat(cell.dataset.percent || "0");
      const fill = cell.querySelector(".percent-bar__fill");
      if (!fill) return;
      gsap.fromTo(
        fill,
        { width: "0%" },
        { width: `${target}%`, duration: 1.1, ease: "power3.out" }
      );
    });
  }

  function animateCounters(scope) {
    scope.querySelectorAll(".big-number[data-count]").forEach((el) => {
      const raw = parseFloat(el.dataset.count || "0");
      const isCurrency = el.textContent.trim().startsWith("₹");

      gsap.fromTo(
        { val: 0 },
        {
          val: raw,
          duration: 1.1,
          ease: "power2.out",
          onUpdate: function () {
            const obj = this.targets()[0];
            const value = Math.round(obj.val);
            el.textContent = isCurrency
              ? `₹ ${value.toLocaleString()}`
              : value.toLocaleString();
          },
        }
      );
    });
  }

  function setupRowScrollAnimations(scope) {
    scope.querySelectorAll(".table-row-anim").forEach((row) => {
      gsap.from(row, {
        y: 14,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: row,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    });
  }

  // initial page
  const initial = document.getElementById(currentPageId);
  if (initial) {
    initial.classList.add("active");
    animatePage(currentPageId);
  }
});