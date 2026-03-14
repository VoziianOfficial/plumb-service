document.addEventListener("DOMContentLoaded", function () {
  initMediaOverlayLinks();
  initHeroSlideshows();
  initSiteSearch();
  initServiceCarousels();

  if (window.BlueRouteMenu) {
    window.BlueRouteMenu.init();
  }

  if (window.BlueRouteFaq) {
    window.BlueRouteFaq.init();
  }

  if (window.BlueRouteForms) {
    window.BlueRouteForms.init();
  }

  if (window.BlueRouteAnimations) {
    window.BlueRouteAnimations.init();
  }

  if (window.BlueRouteCounters) {
    window.BlueRouteCounters.init();
  }

  document.querySelectorAll("[data-year]").forEach(function (node) {
    node.textContent = new Date().getFullYear();
  });
});

function initSiteSearch() {
  const items = [
    { title: "Home", href: "index.html", meta: "Homepage" },
    { title: "About", href: "about.html", meta: "Platform overview" },
    { title: "Services", href: "services.html", meta: "All plumbing request categories" },
    { title: "Contact", href: "contact.html", meta: "Call and estimate request options" },
    { title: "Emergency Plumbing Help", href: "service-pages/emergency-plumbing-help.html", meta: "Urgent plumbing request path" },
    { title: "Drain & Pipe Cleaning", href: "service-pages/drain-pipe-cleaning.html", meta: "Clogs, backups, and restricted lines" },
    { title: "Plumbing Installation Solutions", href: "service-pages/plumbing-installation.html", meta: "New plumbing layouts and installs" },
    { title: "Plumbing System Replacement", href: "service-pages/plumbing-system-replacement.html", meta: "Repipe and replacement planning" },
    { title: "Leak Detection Services", href: "service-pages/hidden-leak-detection.html", meta: "Hidden moisture and leak diagnostics" },
    { title: "Water Heater Repair & Setup", href: "service-pages/water-heater-repair-setup.html", meta: "Hot-water repair and replacement requests" },
    { title: "Toilet Repair & Installation", href: "service-pages/toilet-repair-installation.html", meta: "Bathroom fixture issue routing" },
    { title: "Faucet & Fixture Upgrades", href: "service-pages/faucet-fixture-services.html", meta: "Visible kitchen and bath upgrades" }
  ];

  document.querySelectorAll("[data-site-search]").forEach(function (search) {
    const form = search.querySelector("[data-site-search-form]");
    const input = search.querySelector("[data-site-search-input]");
    const results = search.querySelector("[data-site-search-results]");

    if (!form || !input || !results) {
      return;
    }

    function renderResults(matches) {
      results.innerHTML = "";

      if (!matches.length) {
        results.hidden = true;
        return;
      }

      matches.slice(0, 5).forEach(function (item) {
        const link = document.createElement("a");
        const copy = document.createElement("span");
        const title = document.createElement("strong");
        const meta = document.createElement("span");
        const icon = document.createElement("i");

        link.className = "hero-site-search__result";
        link.href = item.href;

        copy.className = "hero-site-search__result-copy";
        title.textContent = item.title;
        meta.textContent = item.meta;
        copy.append(title, meta);

        icon.className = "fa-solid fa-arrow-up-right-from-square";

        link.append(copy, icon);
        results.appendChild(link);
      });

      results.hidden = false;
    }

    function findMatches(value) {
      const query = value.trim().toLowerCase();

      if (!query) {
        renderResults([]);
        return [];
      }

      const matches = items.filter(function (item) {
        return (item.title + " " + item.meta).toLowerCase().includes(query);
      });

      renderResults(matches);
      return matches;
    }

    input.addEventListener("input", function () {
      findMatches(input.value);
    });

    input.addEventListener("focus", function () {
      if (input.value.trim()) {
        findMatches(input.value);
      }
    });

    input.addEventListener("blur", function () {
      window.setTimeout(function () {
        results.hidden = true;
      }, 120);
    });

    form.addEventListener("submit", function (event) {
      const matches = findMatches(input.value);

      if (!matches.length) {
        event.preventDefault();
        results.hidden = false;
        return;
      }

      event.preventDefault();
      window.location.href = matches[0].href;
    });
  });
}

function initMediaOverlayLinks() {
  document.querySelectorAll(".media-overlay").forEach(function (overlay) {
    if (overlay.querySelector(".media-overlay__link")) {
      return;
    }

    const tile = overlay.closest(".media-tile");
    const parentAnchor = overlay.closest("a[href]");
    const explicitHref = overlay.dataset.overlayLink || (tile ? tile.dataset.overlayLink : "");
    const explicitLabel = overlay.dataset.overlayLabel || (tile ? tile.dataset.overlayLabel : "");
    const scopedContainer = overlay.closest(
      ".card, .catalog-card, .content-card, .quote-card, .hero, .page-hero, .benefit-showcase, .photo-showcase-grid, .services-catalog-section, .home-photo-trust, .service-hero-side"
    );

    let href = explicitHref;

    if (!href && scopedContainer) {
      const derivedLink = scopedContainer.querySelector(".card-link[href], .btn[href]");

      if (derivedLink) {
        href = derivedLink.getAttribute("href") || "";
      }
    }

    const control = document.createElement(parentAnchor ? "span" : href ? "a" : "span");
    const label = document.createElement("span");
    const icon = document.createElement("i");

    control.className = "media-overlay__link";
    label.textContent = explicitLabel || "View details";
    icon.className = "fa-solid fa-arrow-right";
    control.append(label, icon);

    if (parentAnchor) {
      control.classList.add("media-overlay__link--passive");
      control.setAttribute("aria-hidden", "true");
    } else if (href) {
      control.setAttribute("href", href);
    } else {
      return;
    }

    overlay.appendChild(control);
  });
}

function initServiceCarousels() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-service-carousel]").forEach(function (carousel) {
    const viewport = carousel.querySelector("[data-carousel-viewport]");
    const track = carousel.querySelector(".service-carousel__track");
    const originalCards = Array.from(track.querySelectorAll(".card--service"));
    const prevButton = carousel.querySelector("[data-carousel-prev]");
    const nextButton = carousel.querySelector("[data-carousel-next]");
    const dots = carousel.querySelector("[data-carousel-dots]");
    const progress = carousel.querySelector("[data-carousel-progress]");

    if (!viewport || !track || !originalCards.length) {
      return;
    }

    let slides = [];
    let activeIndex = 0;
    let pointerActive = false;
    let dragMoved = false;
    let dragPointerId = null;
    let dragStartX = 0;
    let dragStartScroll = 0;
    let resizeFrame = 0;
    let scrollTimer = 0;
    let isJumping = false;

    function setLoopIndex(card, index) {
      card.dataset.loopIndex = String(index);
    }

    function prepareClone(card, index) {
      const clone = card.cloneNode(true);

      clone.classList.add("is-clone");
      clone.classList.remove("reveal", "is-visible");
      clone.removeAttribute("data-delay");
      clone.setAttribute("aria-hidden", "true");
      setLoopIndex(clone, index);

      clone.querySelectorAll("a, button, input, select, textarea").forEach(function (node) {
        node.setAttribute("tabindex", "-1");
      });

      return clone;
    }

    originalCards.forEach(function (card, index) {
      setLoopIndex(card, index);
    });

    if (originalCards.length > 1) {
      const prependFragment = document.createDocumentFragment();
      const appendFragment = document.createDocumentFragment();

      originalCards.forEach(function (card, index) {
        prependFragment.appendChild(prepareClone(card, index));
        appendFragment.appendChild(prepareClone(card, index));
      });

      track.prepend(prependFragment);
      track.appendChild(appendFragment);
    }

    function clampIndex(index) {
      return Math.max(0, Math.min(originalCards.length - 1, index));
    }

    function buildDots() {
      if (!dots) {
        return;
      }

      dots.innerHTML = "";

      originalCards.forEach(function (card, index) {
        const button = document.createElement("button");
        const title = card.querySelector("h3");

        button.type = "button";
        button.className = "service-carousel__dot";
        button.setAttribute("aria-label", "Go to " + (title ? title.textContent : "service " + (index + 1)));
        button.addEventListener("click", function () {
          scrollToRealIndex(index);
        });
        dots.appendChild(button);
      });
    }

    function nearestSlidePosition() {
      const scrollLeft = viewport.scrollLeft;
      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      slides.forEach(function (slide, index) {
        const distance = Math.abs(slide.offsetLeft - scrollLeft);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });

      return bestIndex;
    }

    function realIndexForPosition(position) {
      const slide = slides[position];

      if (!slide) {
        return 0;
      }

      return Number(slide.dataset.loopIndex || 0);
    }

    function jumpToRealIndex(index) {
      const target = originalCards[clampIndex(index)];

      if (!target) {
        return;
      }

      window.clearTimeout(scrollTimer);
      isJumping = true;
      viewport.scrollTo({
        left: target.offsetLeft,
        behavior: "auto"
      });

      window.requestAnimationFrame(function () {
        isJumping = false;
        updateUi();
      });
    }

    function normalizeLoopPosition() {
      if (originalCards.length <= 1) {
        updateUi();
        return;
      }

      const position = nearestSlidePosition();

      if (position < originalCards.length || position >= originalCards.length * 2) {
        jumpToRealIndex(realIndexForPosition(position));
        return;
      }

      updateUi();
    }

    function scheduleNormalize() {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(normalizeLoopPosition, reduceMotion ? 40 : 120);
    }

    function updateUi() {
      activeIndex = realIndexForPosition(nearestSlidePosition());
      const progressValue = originalCards.length <= 1 ? 100 : ((activeIndex + 1) / originalCards.length) * 100;

      if (prevButton) {
        prevButton.disabled = originalCards.length <= 1;
      }

      if (nextButton) {
        nextButton.disabled = originalCards.length <= 1;
      }

      if (progress) {
        progress.style.width = progressValue.toFixed(2) + "%";
      }

      if (dots) {
        Array.from(dots.children).forEach(function (dot, index) {
          const isActive = index === activeIndex;
          dot.classList.toggle("is-active", isActive);
          dot.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
      }
    }

    function measure() {
      slides = Array.from(track.querySelectorAll(".card--service"));
      updateUi();
    }

    function scrollToRealIndex(index) {
      const nextCard = originalCards[clampIndex(index)];

      if (!nextCard) {
        return;
      }

      viewport.scrollTo({
        left: nextCard.offsetLeft,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    }

    function scrollToSlidePosition(position) {
      const nextSlide = slides[Math.max(0, Math.min(slides.length - 1, position))];

      if (!nextSlide) {
        return;
      }

      viewport.scrollTo({
        left: nextSlide.offsetLeft,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    }

    function requestMeasure() {
      if (resizeFrame) {
        window.cancelAnimationFrame(resizeFrame);
      }

      resizeFrame = window.requestAnimationFrame(function () {
        measure();
        jumpToRealIndex(activeIndex);
      });
    }

    function endDrag() {
      if (!pointerActive) {
        return;
      }

      pointerActive = false;
      viewport.classList.remove("is-dragging");

      if (dragPointerId !== null && viewport.hasPointerCapture && viewport.hasPointerCapture(dragPointerId)) {
        viewport.releasePointerCapture(dragPointerId);
      }

      dragPointerId = null;

      if (dragMoved) {
        scrollToSlidePosition(nearestSlidePosition());
      }

      if (originalCards.length > 1) {
        scheduleNormalize();
      }

      window.setTimeout(function () {
        dragMoved = false;
      }, 0);
    }

    buildDots();
    measure();

    if (originalCards.length > 1) {
      jumpToRealIndex(0);
    }

    viewport.addEventListener(
      "scroll",
      function () {
        if (!isJumping) {
          updateUi();
          if (pointerActive) {
            window.clearTimeout(scrollTimer);
          } else {
            scheduleNormalize();
          }
        }
      },
      { passive: true }
    );

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        if (originalCards.length <= 1) {
          return;
        }

        scrollToSlidePosition(nearestSlidePosition() - 1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        if (originalCards.length <= 1) {
          return;
        }

        scrollToSlidePosition(nearestSlidePosition() + 1);
      });
    }

    viewport.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (originalCards.length > 1) {
          scrollToSlidePosition(nearestSlidePosition() + 1);
        }
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (originalCards.length > 1) {
          scrollToSlidePosition(nearestSlidePosition() - 1);
        }
      }

      if (event.key === "Home") {
        event.preventDefault();
        scrollToRealIndex(0);
      }

      if (event.key === "End") {
        event.preventDefault();
        scrollToRealIndex(originalCards.length - 1);
      }
    });

    viewport.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "touch" || event.button !== 0) {
        return;
      }

      if (event.target.closest("a, button, input, select, textarea, label")) {
        return;
      }

      pointerActive = true;
      dragMoved = false;
      dragPointerId = event.pointerId;
      dragStartX = event.clientX;
      dragStartScroll = viewport.scrollLeft;
      viewport.classList.add("is-dragging");

      if (viewport.setPointerCapture) {
        viewport.setPointerCapture(event.pointerId);
      }
    });

    viewport.addEventListener("pointermove", function (event) {
      if (!pointerActive) {
        return;
      }

      const delta = event.clientX - dragStartX;

      if (Math.abs(delta) > 6) {
        dragMoved = true;
      }

      viewport.scrollLeft = dragStartScroll - delta;
    });

    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("pointerleave", function (event) {
      if (pointerActive && event.pointerType === "mouse") {
        endDrag();
      }
    });

    track.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function (event) {
        if (!dragMoved) {
          return;
        }

        event.preventDefault();
      });
    });

    window.addEventListener("resize", requestMeasure);
  });
}

function initHeroSlideshows() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-hero-slideshow]").forEach(function (slideshow) {
    const slides = Array.from(slideshow.querySelectorAll("[data-hero-slide]"));

    if (!slides.length) {
      return;
    }

    let activeIndex = Math.max(
      0,
      slides.findIndex(function (slide) {
        return slide.classList.contains("is-active");
      })
    );
    let timer = 0;
    let isPaused = false;

    function setActive(index) {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
    }

    function stop() {
      window.clearInterval(timer);
      timer = 0;
    }

    function start() {
      if (reduceMotion || slides.length < 2 || timer || isPaused) {
        return;
      }

      timer = window.setInterval(function () {
        setActive(activeIndex + 1);
      }, 4200);
    }

    setActive(activeIndex);

    slideshow.addEventListener("mouseenter", function () {
      isPaused = true;
      stop();
    });

    slideshow.addEventListener("mouseleave", function () {
      isPaused = false;
      start();
    });

    slideshow.addEventListener("focusin", function () {
      isPaused = true;
      stop();
    });

    slideshow.addEventListener("focusout", function (event) {
      if (slideshow.contains(event.relatedTarget)) {
        return;
      }

      isPaused = false;
      start();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stop();
        return;
      }

      start();
    });

    start();
  });
}
