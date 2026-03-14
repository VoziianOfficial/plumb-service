(function () {
  function initAnimations() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      document.querySelectorAll(".reveal").forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, currentObserver) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.18 }
    );

    document.querySelectorAll(".reveal").forEach(function (item) {
      observer.observe(item);
    });

    initParallax();
  }

  function initParallax() {
    const items = Array.from(document.querySelectorAll("[data-parallax]"));

    if (!items.length) {
      return;
    }

    let ticking = false;

    function update() {
      const viewportHeight = window.innerHeight || 1;

      items.forEach(function (item) {
        const rect = item.getBoundingClientRect();
        const factor = Number(item.dataset.parallax || 16);
        const centerOffset = rect.top + rect.height / 2 - viewportHeight / 2;
        const shift = Math.max(-28, Math.min(28, (-centerOffset / viewportHeight) * factor));
        item.style.setProperty("--parallax-y", shift.toFixed(2) + "px");
      });

      ticking = false;
    }

    function requestTick() {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick);
    requestTick();
  }

  window.BlueRouteAnimations = { init: initAnimations };
})();
