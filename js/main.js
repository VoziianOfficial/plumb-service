document.addEventListener("DOMContentLoaded", function () {
  initCookieNotice();
  initMediaOverlayLinks();
  initHeroSlideshows();
  initHomeFormSheet();
  initFloatingEstimateButton();
  initTouchSnapGrids();
  initInfiniteIssueGrids();
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

function initCookieNotice() {
  if (document.querySelector("[data-cookie-notice]")) {
    return;
  }

  const storageKey = "blueroute-cookie-choice";
  const body = document.body;
  const root = document.documentElement;
  const isServicePage = body.classList.contains("service-page");
  const privacyHref = isServicePage ? "../privacy-policy.html" : "privacy-policy.html";
  const termsHref = isServicePage ? "../terms-of-service.html" : "terms-of-service.html";
  const cookieHref = isServicePage ? "../cookie-policy.html" : "cookie-policy.html";
  let resizeObserver = null;

  function getStoredChoice() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function setStoredChoice(value) {
    try {
      window.localStorage.setItem(storageKey, value);
    } catch (error) {
      return;
    }
  }

  if (getStoredChoice()) {
    root.style.setProperty("--cookie-notice-offset", "0px");
    return;
  }

  const notice = document.createElement("aside");
  notice.className = "cookie-notice";
  notice.dataset.cookieNotice = "true";
  notice.setAttribute("aria-label", "Cookie preferences");

  const title = document.createElement("strong");
  title.className = "cookie-notice__title";
  title.textContent = "Cookie settings";

  const copy = document.createElement("p");
  copy.className = "cookie-notice__copy";
  copy.textContent = "BlueRoute may use cookies and similar tools to keep the site working, remember preferences, and understand page usage.";

  const links = document.createElement("div");
  links.className = "cookie-notice__links";

  [
    { href: privacyHref, label: "Privacy Policy" },
    { href: termsHref, label: "Terms of Service" },
    { href: cookieHref, label: "Cookie Policy" }
  ].forEach(function (item) {
    const link = document.createElement("a");

    link.className = "cookie-notice__link";
    link.href = item.href;
    link.textContent = item.label;
    links.appendChild(link);
  });

  const actions = document.createElement("div");
  actions.className = "cookie-notice__actions";

  const acceptButton = document.createElement("button");
  acceptButton.type = "button";
  acceptButton.className = "cookie-notice__button cookie-notice__button--accept";
  acceptButton.textContent = "Agree";

  const declineButton = document.createElement("button");
  declineButton.type = "button";
  declineButton.className = "cookie-notice__button cookie-notice__button--decline";
  declineButton.textContent = "Decline";

  actions.append(acceptButton, declineButton);
  notice.append(title, copy, links, actions);

  function updateOffset() {
    const offset = body.classList.contains("cookie-notice-visible") ? notice.offsetHeight + 20 : 0;
    root.style.setProperty("--cookie-notice-offset", offset + "px");
  }

  function closeNotice(value) {
    setStoredChoice(value);
    body.classList.remove("cookie-notice-visible");
    root.style.setProperty("--cookie-notice-offset", "0px");

    if (resizeObserver) {
      resizeObserver.disconnect();
    }

    window.removeEventListener("resize", updateOffset);
    notice.remove();
  }

  acceptButton.addEventListener("click", function () {
    closeNotice("accepted");
  });

  declineButton.addEventListener("click", function () {
    closeNotice("declined");
  });

  document.body.appendChild(notice);
  body.classList.add("cookie-notice-visible");

  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(updateOffset);
    resizeObserver.observe(notice);
  }

  window.addEventListener("resize", updateOffset, { passive: true });
  window.requestAnimationFrame(updateOffset);
}

function initHomeFormSheet() {
  const sheet = document.querySelector("[data-home-form-sheet]");

  if (!sheet) {
    return;
  }

  const toggle = sheet.querySelector("[data-home-form-toggle]");
  const toggleLabel = sheet.querySelector("[data-home-form-toggle-label]");
  const mobileQuery = window.matchMedia("(max-width: 760px)");

  if (!toggle || toggle.dataset.sheetReady === "true") {
    return;
  }

  toggle.dataset.sheetReady = "true";

  let isOpen = false;
  let backdrop = document.querySelector(".home-form-sheet-backdrop");

  if (!backdrop) {
    backdrop = document.createElement("button");
    backdrop.type = "button";
    backdrop.className = "home-form-sheet-backdrop";
    backdrop.setAttribute("aria-label", "Close request form");
    document.body.appendChild(backdrop);
  }

  function syncState() {
    const isMobile = mobileQuery.matches;
    const expanded = isMobile && isOpen;

    sheet.classList.toggle("is-open", expanded);
    document.body.classList.toggle("home-form-sheet-open", expanded);
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.setAttribute("aria-label", expanded ? "Collapse request form" : "Expand request form");

    if (toggleLabel) {
      toggleLabel.textContent = expanded ? "Tap to collapse" : "Tap to expand";
    }
  }

  function setOpen(nextValue) {
    isOpen = Boolean(nextValue);
    syncState();
  }

  toggle.addEventListener("click", function () {
    if (!mobileQuery.matches) {
      return;
    }

    setOpen(!isOpen);
  });

  backdrop.addEventListener("click", function () {
    setOpen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setOpen(false);
    }
  });

  window.addEventListener("blueroute:menu-open", function () {
    setOpen(false);
  });

  function handleViewportChange() {
    if (!mobileQuery.matches) {
      isOpen = false;
    }

    syncState();
  }

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", handleViewportChange);
  } else if (typeof mobileQuery.addListener === "function") {
    mobileQuery.addListener(handleViewportChange);
  }

  syncState();
}

function initFloatingEstimateButton() {
  if (document.querySelector("[data-floating-estimate]")) {
    return;
  }

  const body = document.body;
  const mobileQuery = window.matchMedia("(max-width: 980px)");
  const isServicePage = body.classList.contains("service-page");
  const isContactPage = body.classList.contains("contact-page");
  const href = isContactPage ? "#estimate-form" : isServicePage ? "../contact.html#estimate-form" : "contact.html#estimate-form";
  const button = document.createElement("a");
  const icon = document.createElement("i");
  const copy = document.createElement("span");

  button.className = "floating-estimate-button";
  button.href = href;
  button.dataset.floatingEstimate = "true";
  button.setAttribute("aria-label", "Open estimate request form");

  icon.className = "fa-solid fa-file-signature";
  icon.setAttribute("aria-hidden", "true");

  copy.textContent = "Estimate";
  button.append(icon, copy);

  function syncVisibility() {
    const isMobile = mobileQuery.matches;

    body.classList.toggle("has-floating-estimate", isMobile);

    if (!isMobile) {
      button.classList.remove("is-condensed");
    }
  }

  function syncScrollState() {
    button.classList.remove("is-condensed");
  }

  document.body.appendChild(button);
  syncVisibility();
  syncScrollState();

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", function () {
      syncVisibility();
      syncScrollState();
    });
  } else if (typeof mobileQuery.addListener === "function") {
    mobileQuery.addListener(function () {
      syncVisibility();
      syncScrollState();
    });
  }

  if (isContactPage) {
    const estimateForm = document.querySelector("#estimate-form");

    if (estimateForm && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            button.classList.toggle("is-hidden", entry.isIntersecting);
          });
        },
        {
          threshold: 0.2
        }
      );

      observer.observe(estimateForm);
    }
  }
}

function initTouchSnapGrids() {
  const grids = Array.from(document.querySelectorAll(".home-page .stats-grid, .service-page .benefit-grid, .service-page .service-process-grid"));
  const mobileQuery = window.matchMedia("(max-width: 760px)");
  const states = new WeakMap();

  if (!grids.length) {
    return;
  }

  function hasOverflow(grid) {
    return mobileQuery.matches && grid.scrollWidth > grid.clientWidth + 6;
  }

  function snapToNearest(grid) {
    const items = Array.from(grid.children);
    let target = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    items.forEach(function (item) {
      const distance = Math.abs(item.offsetLeft - grid.scrollLeft);

      if (distance < bestDistance) {
        bestDistance = distance;
        target = item;
      }
    });

    if (!target) {
      return;
    }

    grid.scrollTo({
      left: target.offsetLeft,
      behavior: "smooth"
    });
  }

  function scheduleSnap(grid) {
    const state = states.get(grid);

    if (!state) {
      return;
    }

    window.clearTimeout(state.snapTimer);
    state.snapTimer = window.setTimeout(function () {
      grid.classList.remove("is-touch-dragging");

      if (hasOverflow(grid)) {
        snapToNearest(grid);
      }
    }, 120);
  }

  grids.forEach(function (grid) {
    const state = {
      touchActive: false,
      snapTimer: 0
    };

    function handleStart(event) {
      const isTouchEvent = event.type.indexOf("touch") === 0 || event.pointerType === "touch";

      if (!isTouchEvent || !hasOverflow(grid)) {
        return;
      }

      state.touchActive = true;
      window.clearTimeout(state.snapTimer);
      grid.classList.add("is-touch-dragging");
    }

    function handleEnd(event) {
      const isTouchEvent = event.type.indexOf("touch") === 0 || event.pointerType === "touch";

      if (!isTouchEvent || !state.touchActive) {
        return;
      }

      state.touchActive = false;
      scheduleSnap(grid);
    }

    function handleScroll() {
      if (!grid.classList.contains("is-touch-dragging")) {
        return;
      }

      if (!state.touchActive) {
        scheduleSnap(grid);
      }
    }

    function handleResize() {
      if (hasOverflow(grid)) {
        return;
      }

      window.clearTimeout(state.snapTimer);
      grid.classList.remove("is-touch-dragging");
    }

    states.set(grid, state);
    grid.addEventListener("scroll", handleScroll, { passive: true });

    if (window.PointerEvent) {
      grid.addEventListener("pointerdown", handleStart, { passive: true });
      grid.addEventListener("pointerup", handleEnd, { passive: true });
      grid.addEventListener("pointercancel", handleEnd, { passive: true });
    } else {
      grid.addEventListener("touchstart", handleStart, { passive: true });
      grid.addEventListener("touchend", handleEnd, { passive: true });
      grid.addEventListener("touchcancel", handleEnd, { passive: true });
    }

    window.addEventListener("resize", handleResize, { passive: true });
  });
}

function initInfiniteIssueGrids() {
  const grids = Array.from(
    document.querySelectorAll(".home-issues-section .issue-grid, .service-page .issue-grid, .services-catalog-section .catalog-shell")
  );
  const mobileQuery = window.matchMedia("(max-width: 760px)");
  const states = new WeakMap();

  if (!grids.length) {
    return;
  }

  function getOriginalItems(grid) {
    return Array.from(grid.children).filter(function (item) {
      return !item.classList.contains("is-loop-clone");
    });
  }

  function setInstantScroll(grid, value) {
    const previousBehavior = grid.style.scrollBehavior;

    grid.style.scrollBehavior = "auto";
    grid.scrollLeft = value;
    grid.style.scrollBehavior = previousBehavior;
  }

  function snapGridToNearest(grid) {
    const items = Array.from(grid.children);
    let target = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    items.forEach(function (item) {
      const distance = Math.abs(item.offsetLeft - grid.scrollLeft);

      if (distance < bestDistance) {
        bestDistance = distance;
        target = item;
      }
    });

    if (!target) {
      return;
    }

    grid.scrollTo({
      left: target.offsetLeft,
      behavior: "smooth"
    });
  }

  function startTouchDrag(grid) {
    const state = states.get(grid);

    if (!state || !state.enabled) {
      return;
    }

    window.clearTimeout(state.dragTimer);
    grid.classList.add("is-touch-dragging");
  }

  function endTouchDrag(grid) {
    const state = states.get(grid);

    if (!state || !state.enabled) {
      return;
    }

    window.clearTimeout(state.dragTimer);
    state.dragTimer = window.setTimeout(function () {
      grid.classList.remove("is-touch-dragging");
      snapGridToNearest(grid);
    }, 90);
  }

  function prepareClone(item, setName) {
    const clone = item.cloneNode(true);

    clone.classList.add("is-loop-clone");
    clone.dataset.cloneSet = setName;
    clone.removeAttribute("id");
    clone.classList.remove("reveal", "is-visible");
    clone.removeAttribute("data-delay");
    clone.setAttribute("aria-hidden", "true");

    clone.querySelectorAll("[id]").forEach(function (node) {
      node.removeAttribute("id");
    });

    clone.querySelectorAll("a, button, input, select, textarea").forEach(function (node) {
      node.setAttribute("tabindex", "-1");
    });

    return clone;
  }

  function measureGrid(grid, preserveOffset) {
    const state = states.get(grid);

    if (!state || !state.enabled) {
      return;
    }

    const originals = getOriginalItems(grid);
    const firstOriginal = originals[0];
    const firstAppendClone = grid.querySelector('.is-loop-clone[data-clone-set="append"]');

    if (!firstOriginal || !firstAppendClone) {
      return;
    }

    const previousAnchor = state.anchorStart || 0;
    const previousLoopWidth = state.loopWidth || 0;
    const relativeOffset =
      preserveOffset && previousLoopWidth
        ? ((grid.scrollLeft - previousAnchor) % previousLoopWidth + previousLoopWidth) % previousLoopWidth
        : 0;

    state.anchorStart = firstOriginal.offsetLeft;
    state.loopWidth = firstAppendClone.offsetLeft - firstOriginal.offsetLeft;

    if (!state.loopWidth) {
      return;
    }

    state.hasPositioned = true;
    setInstantScroll(grid, state.anchorStart + relativeOffset);
  }

  function onGridScroll(grid) {
    const state = states.get(grid);

    if (!state || !state.enabled || state.isAdjusting || !state.loopWidth) {
      return;
    }

    const start = state.anchorStart;
    const end = start + state.loopWidth;

    if (grid.scrollLeft < start - 2) {
      state.isAdjusting = true;
      setInstantScroll(grid, grid.scrollLeft + state.loopWidth);
      state.isAdjusting = false;
      return;
    }

    if (grid.scrollLeft >= end - 2) {
      state.isAdjusting = true;
      setInstantScroll(grid, grid.scrollLeft - state.loopWidth);
      state.isAdjusting = false;
    }
  }

  function enableGrid(grid) {
    const originals = getOriginalItems(grid);

    if (originals.length < 2) {
      return;
    }

    let state = states.get(grid);

    if (state && state.enabled) {
      measureGrid(grid, true);
      return;
    }

    const prependFragment = document.createDocumentFragment();
    const appendFragment = document.createDocumentFragment();

    originals.forEach(function (item) {
      prependFragment.appendChild(prepareClone(item, "prepend"));
      appendFragment.appendChild(prepareClone(item, "append"));
    });

    grid.prepend(prependFragment);
    grid.appendChild(appendFragment);

    state = {
      enabled: true,
      hasPositioned: false,
      isAdjusting: false,
      anchorStart: 0,
      loopWidth: 0,
      dragTimer: 0,
      onScroll: function () {
        onGridScroll(grid);
      }
    };

    states.set(grid, state);
    grid.addEventListener("scroll", state.onScroll, { passive: true });

    if (window.PointerEvent) {
      state.onPointerDown = function (event) {
        if (event.pointerType !== "touch") {
          return;
        }

        startTouchDrag(grid);
      };
      state.onPointerUp = function (event) {
        if (event.pointerType !== "touch") {
          return;
        }

        endTouchDrag(grid);
      };

      grid.addEventListener("pointerdown", state.onPointerDown, { passive: true });
      grid.addEventListener("pointerup", state.onPointerUp, { passive: true });
      grid.addEventListener("pointercancel", state.onPointerUp, { passive: true });
    } else {
      state.onTouchStart = function () {
        startTouchDrag(grid);
      };
      state.onTouchEnd = function () {
        endTouchDrag(grid);
      };

      grid.addEventListener("touchstart", state.onTouchStart, { passive: true });
      grid.addEventListener("touchend", state.onTouchEnd, { passive: true });
      grid.addEventListener("touchcancel", state.onTouchEnd, { passive: true });
    }

    window.requestAnimationFrame(function () {
      measureGrid(grid, false);
    });
  }

  function disableGrid(grid) {
    const state = states.get(grid);

    if (!state || !state.enabled) {
      return;
    }

    grid.removeEventListener("scroll", state.onScroll);

    if (state.onPointerDown) {
      grid.removeEventListener("pointerdown", state.onPointerDown);
      grid.removeEventListener("pointerup", state.onPointerUp);
      grid.removeEventListener("pointercancel", state.onPointerUp);
    }

    if (state.onTouchStart) {
      grid.removeEventListener("touchstart", state.onTouchStart);
      grid.removeEventListener("touchend", state.onTouchEnd);
      grid.removeEventListener("touchcancel", state.onTouchEnd);
    }

    window.clearTimeout(state.dragTimer);
    grid.classList.remove("is-touch-dragging");
    grid.querySelectorAll(".is-loop-clone").forEach(function (clone) {
      clone.remove();
    });

    state.enabled = false;
    state.hasPositioned = false;
    state.anchorStart = 0;
    state.loopWidth = 0;

    setInstantScroll(grid, 0);
  }

  function syncGrids() {
    grids.forEach(function (grid) {
      if (!mobileQuery.matches) {
        disableGrid(grid);
        return;
      }

      const originals = getOriginalItems(grid);
      const hasOverflow = grid.scrollWidth > grid.clientWidth + 6;

      if (originals.length < 2 || !hasOverflow) {
        disableGrid(grid);
        return;
      }

      enableGrid(grid);
    });
  }

  let resizeFrame = 0;

  function scheduleSync() {
    if (resizeFrame) {
      window.cancelAnimationFrame(resizeFrame);
    }

    resizeFrame = window.requestAnimationFrame(function () {
      syncGrids();
    });
  }

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", scheduleSync);
  } else if (typeof mobileQuery.addListener === "function") {
    mobileQuery.addListener(scheduleSync);
  }

  window.addEventListener("resize", scheduleSync, { passive: true });

  syncGrids();
}

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

    function startTouchSwipe(event) {
      const isTouchEvent = event.type.indexOf("touch") === 0 || event.pointerType === "touch";

      if (!isTouchEvent) {
        return;
      }

      viewport.classList.add("is-dragging");
      window.clearTimeout(scrollTimer);
    }

    function endTouchSwipe(event) {
      const isTouchEvent = event.type.indexOf("touch") === 0 || event.pointerType === "touch";

      if (!isTouchEvent) {
        return;
      }

      viewport.classList.remove("is-dragging");

      if (originalCards.length > 1) {
        scheduleNormalize();
      } else {
        updateUi();
      }
    }

    if (window.PointerEvent) {
      viewport.addEventListener("pointerdown", startTouchSwipe, { passive: true });
      viewport.addEventListener("pointerup", endTouchSwipe, { passive: true });
      viewport.addEventListener("pointercancel", endTouchSwipe, { passive: true });
    } else {
      viewport.addEventListener("touchstart", startTouchSwipe, { passive: true });
      viewport.addEventListener("touchend", endTouchSwipe, { passive: true });
      viewport.addEventListener("touchcancel", endTouchSwipe, { passive: true });
    }

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
