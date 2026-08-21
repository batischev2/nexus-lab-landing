(function () {
  var root = document.documentElement;
  var themeMeta = document.getElementById("theme-color");

  var applyTheme = function (theme) {
    root.setAttribute("data-theme", theme);
    if (themeMeta) themeMeta.setAttribute("content", theme === "light" ? "#f3f6f9" : "#0a0d11");
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute(
        "aria-label",
        theme === "light" ? "Включить тёмную тему" : "Включить светлую тему"
      );
    });
  };

  var currentTheme = function () {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  };

  if (!root.getAttribute("data-theme")) {
    var stored;
    try { stored = localStorage.getItem("theme"); } catch (e) { stored = null; }
    var initial = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    applyTheme(initial);
  } else {
    applyTheme(currentTheme());
  }

  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = currentTheme() === "light" ? "dark" : "light";
      try { localStorage.setItem("theme", next); } catch (e) {}
      applyTheme(next);
    });
  });

  var nav = document.getElementById("nav");
  if (nav) {
    var onScroll = function () {
      if (window.scrollY > 24) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Scroll reveal
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "64px 0px 0px 0px" });
    reveals.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add("in");
      } else {
        io.observe(el);
      }
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // Prefill package from hash / query for Direct A/B
  var params = new URLSearchParams(window.location.search);
  var offer = params.get("offer") || (location.hash === "#packages" ? "turnkey" : null);
  var select = document.getElementById("package");
  if (offer && select) {
    var map = {
      turnkey: "turnkey",
      funnel: "funnel",
      growth: "growth",
      audit: "audit",
      bot: "bot",
      site: "site",
      direct: "direct",
      other: "other"
    };
    if (map[offer]) select.value = map[offer];
  }

  document.querySelectorAll("[data-select]").forEach(function (wrap) {
    var native = wrap.querySelector("select");
    if (!native) return;
    wrap.classList.add("is-custom");

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "select__btn";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    btn.id = native.id + "-btn";
    var label = wrap.closest(".field") && wrap.closest(".field").querySelector("label");
    if (label) btn.setAttribute("aria-labelledby", label.id || (label.id = native.id + "-label"));

    var valueEl = document.createElement("span");
    valueEl.className = "select__value";
    var chevron = document.createElement("span");
    chevron.className = "select__chevron";
    chevron.setAttribute("aria-hidden", "true");
    btn.appendChild(valueEl);
    btn.appendChild(chevron);

    var list = document.createElement("ul");
    list.className = "select__list";
    list.setAttribute("role", "listbox");
    list.id = native.id + "-list";
    btn.setAttribute("aria-controls", list.id);

    var optionEls = [];
    Array.prototype.forEach.call(native.options, function (opt, i) {
      var li = document.createElement("li");
      li.className = "select__option";
      li.setAttribute("role", "option");
      li.dataset.value = opt.value;
      li.textContent = opt.text;
      li.id = native.id + "-opt-" + i;
      list.appendChild(li);
      optionEls.push(li);
    });

    var sync = function () {
      var current = native.options[native.selectedIndex];
      valueEl.textContent = current ? current.text : "";
      optionEls.forEach(function (li) {
        var on = li.dataset.value === native.value;
        li.classList.toggle("is-selected", on);
        li.setAttribute("aria-selected", on ? "true" : "false");
      });
    };

    var close = function () {
      wrap.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    };
    var open = function () {
      wrap.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
    };

    btn.addEventListener("click", function () {
      if (wrap.classList.contains("is-open")) close();
      else open();
    });
    list.addEventListener("click", function (e) {
      var li = e.target.closest(".select__option");
      if (!li) return;
      native.value = li.dataset.value;
      native.dispatchEvent(new Event("change", { bubbles: true }));
      sync();
      close();
      btn.focus();
    });
    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) close();
    });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
        var selected = list.querySelector(".is-selected") || optionEls[0];
        if (selected) selected.focus();
      }
    });
    optionEls.forEach(function (li) {
      li.tabIndex = -1;
      li.addEventListener("keydown", function (e) {
        var i = optionEls.indexOf(li);
        if (e.key === "Escape") { close(); btn.focus(); }
        if (e.key === "ArrowDown") { e.preventDefault(); optionEls[Math.min(i + 1, optionEls.length - 1)].focus(); }
        if (e.key === "ArrowUp") { e.preventDefault(); optionEls[Math.max(i - 1, 0)].focus(); }
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          native.value = li.dataset.value;
          native.dispatchEvent(new Event("change", { bubbles: true }));
          sync();
          close();
          btn.focus();
        }
      });
      li.addEventListener("mouseenter", function () {
        optionEls.forEach(function (el) { el.classList.remove("is-active"); });
        li.classList.add("is-active");
      });
    });

    wrap.appendChild(btn);
    wrap.appendChild(list);
    sync();
  });

  // Lead form — local success + Telegram deep link helper
  var form = document.getElementById("lead-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var name = form.name.value.trim();
      var contact = form.contact.value.trim();
      var pack = form.package.options[form.package.selectedIndex].text;

      if (typeof window.ym === "function" && window.NEXUS_METRIKA_ID) {
        window.ym(window.NEXUS_METRIKA_ID, "reachGoal", "lead_submit");
      }

      var text = [
        "Заявка с лендинга Лидогенераторной",
        "Имя: " + name,
        "Контакт: " + contact,
        "Интересует: " + pack
      ].join("\n");

      form.classList.add("is-success");

      var tg = "https://t.me/batischev97?text=" + encodeURIComponent(text);
      window.open(tg, "_blank", "noopener,noreferrer");
    });
  }

  // Goal clicks
  document.querySelectorAll("[data-goal]").forEach(function (el) {
    el.addEventListener("click", function () {
      var goal = el.getAttribute("data-goal");
      if (goal && typeof window.ym === "function" && window.NEXUS_METRIKA_ID) {
        window.ym(window.NEXUS_METRIKA_ID, "reachGoal", goal);
      }
    });
  });

  // Sticky mobile CTA: show after hero, hide over lead form
  var sticky = document.getElementById("sticky-cta");
  var hero = document.querySelector(".hero");
  var lead = document.getElementById("lead");
  if (sticky && hero && lead && "IntersectionObserver" in window) {
    var heroVisible = true;
    var leadVisible = false;
    var syncSticky = function () {
      var show = !heroVisible && !leadVisible && window.matchMedia("(max-width: 700px)").matches;
      sticky.hidden = !show;
      document.body.classList.toggle("has-sticky-cta", show);
    };
    var heroIo = new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
      syncSticky();
    }, { threshold: 0.15 });
    var leadIo = new IntersectionObserver(function (entries) {
      leadVisible = entries[0].isIntersecting;
      syncSticky();
    }, { threshold: 0.2 });
    heroIo.observe(hero);
    leadIo.observe(lead);
    window.addEventListener("resize", syncSticky, { passive: true });
    syncSticky();
  }

  // --- Yandex Metrika ---
  // Раскомментируйте и подставьте ID счётчика:
  // window.NEXUS_METRIKA_ID = 00000000;
  // (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  // m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0];
  // k.async=1;k.src=r;a.parentNode.insertBefore(k,a)})(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
  // ym(window.NEXUS_METRIKA_ID, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true });
})();
