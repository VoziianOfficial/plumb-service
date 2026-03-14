(function () {
  function initMobileMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-menu]");
    const navList = nav ? nav.querySelector(".nav-list") : null;
    const body = document.body;
    const mobileQuery = window.matchMedia("(max-width: 980px)");
    const isServicePage = body.classList.contains("service-page");
    const cookieHref = isServicePage ? "../cookie-policy.html#manage-cookies" : "cookie-policy.html#manage-cookies";
    const serviceItems = [
      { label: "All Services", href: isServicePage ? "../services.html" : "services.html" },
      { label: "Emergency Plumbing Help", href: isServicePage ? "emergency-plumbing-help.html" : "service-pages/emergency-plumbing-help.html" },
      { label: "Drain & Pipe Cleaning", href: isServicePage ? "drain-pipe-cleaning.html" : "service-pages/drain-pipe-cleaning.html" },
      { label: "Plumbing Installation", href: isServicePage ? "plumbing-installation.html" : "service-pages/plumbing-installation.html" },
      { label: "System Replacement", href: isServicePage ? "plumbing-system-replacement.html" : "service-pages/plumbing-system-replacement.html" },
      { label: "Leak Detection", href: isServicePage ? "hidden-leak-detection.html" : "service-pages/hidden-leak-detection.html" },
      { label: "Water Heater Repair", href: isServicePage ? "water-heater-repair-setup.html" : "service-pages/water-heater-repair-setup.html" },
      { label: "Toilet Repair", href: isServicePage ? "toilet-repair-installation.html" : "service-pages/toilet-repair-installation.html" },
      { label: "Faucet & Fixture", href: isServicePage ? "faucet-fixture-services.html" : "service-pages/faucet-fixture-services.html" }
    ];

    if (!toggle || !nav || !navList) {
      return;
    }

    if (!nav.querySelector(".mobile-nav-services")) {
      const servicesLink = Array.from(navList.querySelectorAll(".nav-link")).find(function (link) {
        const href = link.getAttribute("href") || "";
        return href === "services.html" || href === "../services.html";
      });

      if (servicesLink) {
        const wrapper = document.createElement("div");
        const header = document.createElement("div");
        const toggleButton = document.createElement("button");
        const toggleLabel = document.createElement("span");
        const toggleIcon = document.createElement("i");
        const panel = document.createElement("div");
        const panelInner = document.createElement("div");
        let isExpanded = servicesLink.classList.contains("is-active");

        wrapper.className = "mobile-nav-services";
        header.className = "mobile-nav-services__header";

        servicesLink.classList.add("mobile-nav-services__trigger");

        toggleButton.type = "button";
        toggleButton.className = "mobile-nav-services__toggle";
        toggleButton.setAttribute("aria-expanded", String(isExpanded));
        toggleButton.setAttribute("aria-controls", "mobile-nav-services-panel");

        toggleLabel.className = "mobile-nav-services__toggle-label";
        toggleIcon.className = "fa-solid fa-chevron-down";
        toggleIcon.setAttribute("aria-hidden", "true");
        toggleButton.append(toggleLabel, toggleIcon);

        panel.className = "mobile-nav-services__panel";
        panel.id = "mobile-nav-services-panel";
        panel.setAttribute("aria-hidden", String(!isExpanded));

        panelInner.className = "mobile-nav-services__panel-inner";

        serviceItems.forEach(function (item) {
          const link = document.createElement("a");
          const resolvedPath = new URL(item.href, window.location.href).pathname;

          link.className = "mobile-nav-service-link";
          link.href = item.href;
          link.textContent = item.label;

          if (resolvedPath === window.location.pathname) {
            link.classList.add("is-active");
          }

          panelInner.appendChild(link);
        });

        function syncServicesState() {
          wrapper.classList.toggle("is-open", isExpanded);
          toggleButton.setAttribute("aria-expanded", String(isExpanded));
          toggleLabel.textContent = isExpanded ? "Close list" : "Open list";
          panel.setAttribute("aria-hidden", String(!isExpanded));

          panelInner.querySelectorAll("a").forEach(function (link) {
            link.tabIndex = isExpanded ? 0 : -1;
          });
        }

        function toggleServices(event) {
          if (!mobileQuery.matches) {
            return;
          }

          if (event) {
            event.preventDefault();
          }

          isExpanded = !isExpanded;
          syncServicesState();
        }

        servicesLink.addEventListener("click", toggleServices);
        toggleButton.addEventListener("click", toggleServices);

        navList.insertBefore(wrapper, servicesLink);
        header.append(servicesLink, toggleButton);
        panel.appendChild(panelInner);
        wrapper.append(header, panel);

        syncServicesState();
      }
    }

    if (!nav.querySelector(".mobile-nav-close-row")) {
      const closeRow = document.createElement("div");
      const closeButton = document.createElement("button");

      closeRow.className = "mobile-nav-close-row";

      closeButton.className = "mobile-nav-close";
      closeButton.type = "button";
      closeButton.setAttribute("aria-label", "Close navigation menu");
      closeButton.textContent = "X";

      closeRow.appendChild(closeButton);
      navList.prepend(closeRow);

      closeButton.addEventListener("click", function () {
        closeMenu();
      });
    }

    if (!nav.querySelector(".mobile-nav-footer")) {
      const footer = document.createElement("div");
      const cookieLink = document.createElement("a");
      const contactMeta = document.createElement("div");
      const phoneLink = document.createElement("a");
      const address = document.createElement("p");

      footer.className = "mobile-nav-footer";

      cookieLink.className = "mobile-nav-cookie-button";
      cookieLink.href = cookieHref;
      cookieLink.textContent = "Cookie Settings";

      contactMeta.className = "mobile-nav-meta";

      phoneLink.className = "mobile-nav-meta__line";
      phoneLink.href = "tel:+13125550184";
      phoneLink.textContent = "(312) 555-0184";

      address.className = "mobile-nav-meta__line";
      address.textContent = "1847 West Addison Street, Chicago, IL 60613, United States";

      contactMeta.append(phoneLink, address);
      footer.append(cookieLink, contactMeta);
      navList.appendChild(footer);
    }

    const closeMenu = () => {
      if (!document.body.classList.contains("menu-open")) {
        return;
      }

      document.body.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    const openMenu = () => {
      if (document.body.classList.contains("menu-open")) {
        return;
      }

      document.body.classList.add("menu-open");
      toggle.setAttribute("aria-expanded", "true");
      navList.scrollTop = 0;
      window.dispatchEvent(new Event("blueroute:menu-open"));
    };

    toggle.addEventListener("click", function () {
      const isOpen = document.body.classList.contains("menu-open");
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navList.querySelectorAll("a, button").forEach(function (control) {
      control.addEventListener("click", function () {
        window.requestAnimationFrame(function () {
          control.blur();
        });
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) {
        closeMenu();
      }
    });
  }

  window.BlueRouteMenu = { init: initMobileMenu };
})();
