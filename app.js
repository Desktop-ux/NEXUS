// SPA navigation + GSAP animations
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item");
  let currentPageId = "page-dashboard";

  // Central navigation helper
  function navigate(pageKey, navKeyOptional) {
    const targetId = `page-${pageKey}`;
    if (targetId === currentPageId) return;

    const navKey = navKeyOptional || pageKey;
    const targetNav = document.querySelector(
      `.nav-item[data-page="${navKey}"]`
    );

    if (targetNav) {
      navItems.forEach((b) => b.classList.remove("active"));
      targetNav.classList.add("active");
    }

    switchPage(currentPageId, targetId);
    currentPageId = targetId;
  }

  // Sidebar navigation
  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      navigate(btn.dataset.page);
    });
  });

  // Dashboard / internal links (quick-access, services, etc.)
  document.querySelectorAll(".link-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pageKey = btn.dataset.link;
      const navKey = btn.dataset.nav || null;
      if (pageKey) navigate(pageKey, navKey);
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

  /* ---------- FEEDBACK: stars + forms ---------- */

  function initStarRatings() {
    const containers = document.querySelectorAll(".star-rating");
    containers.forEach((container) => {
      const inputId = container.dataset.input;
      const hiddenInput = document.getElementById(inputId);
      if (!hiddenInput) return;

      const stars = container.querySelectorAll(".star");
      stars.forEach((star) => {
        star.addEventListener("click", () => {
          const value = Number(star.dataset.value || "0");
          hiddenInput.value = value;

          stars.forEach((s) => {
            const v = Number(s.dataset.value || "0");
            s.classList.toggle("active", v <= value);
          });
        });
      });
    });
  }

  function initFeedbackForms() {
    const toast = document.getElementById("feedback-toast");

    function showFeedbackToast(message) {
      if (!toast) return;
      toast.textContent = message;

      gsap.killTweensOf(toast);
      gsap.set(toast, { opacity: 0, y: 12, pointerEvents: "auto" });
      gsap.to(toast, {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: "power3.out",
      });
      gsap.to(toast, {
        opacity: 0,
        y: 12,
        delay: 2.5,
        duration: 0.4,
        ease: "power2.inOut",
        onComplete: () => gsap.set(toast, { pointerEvents: "none" }),
      });
    }

    function handleSubmit(e) {
      e.preventDefault();
      const form = e.target;

      // Here you could send data to a backend via fetch/AJAX.
      // For now we just reset and show a toast.
      form.reset();

      form.querySelectorAll(".star-rating").forEach((container) => {
        container.querySelectorAll(".star").forEach((s) =>
          s.classList.remove("active")
        );
        const inputId = container.dataset.input;
        const hiddenInput = document.getElementById(inputId);
        if (hiddenInput) hiddenInput.value = "";
      });

      showFeedbackToast("Thank you! Your feedback has been recorded.");
    }

    const collegeForm = document.getElementById("college-feedback-form");
    const teacherForm = document.getElementById("teacher-feedback-form");

    if (collegeForm) collegeForm.addEventListener("submit", handleSubmit);
    if (teacherForm) teacherForm.addEventListener("submit", handleSubmit);
  }

  // Initial page
  const initial = document.getElementById(currentPageId);
  if (initial) {
    initial.classList.add("active");
    animatePage(currentPageId);
  }

  // Feedback behaviour
  initStarRatings();
  initFeedbackForms();
});