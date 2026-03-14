(function () {
  function initCounters() {
    const counters = document.querySelectorAll("[data-counter]");

    if (!counters.length) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      counters.forEach(function (counter) {
        counter.textContent = formatCounter(counter);
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, currentObserver) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          animateCounter(entry.target);
          currentObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }

  function formatCounter(counter, value) {
    const end = value != null ? value : Number(counter.dataset.counter);
    const suffix = counter.dataset.suffix || "";
    return end.toLocaleString() + suffix;
  }

  function animateCounter(counter) {
    const end = Number(counter.dataset.counter || 0);
    const duration = 1300;
    const start = performance.now();

    function frame(time) {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(end * eased);
      counter.textContent = formatCounter(counter, value);

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    }

    requestAnimationFrame(frame);
  }

  window.BlueRouteCounters = { init: initCounters };
})();
