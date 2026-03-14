(function () {
  function initFaq() {
    document.querySelectorAll("[data-faq]").forEach(function (faq) {
      const button = faq.querySelector("[data-faq-toggle]");

      if (!button) {
        return;
      }

      button.addEventListener("click", function () {
        const isOpen = faq.classList.toggle("is-open");
        button.setAttribute("aria-expanded", String(isOpen));
      });
    });
  }

  window.BlueRouteFaq = { init: initFaq };
})();
