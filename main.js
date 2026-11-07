(function () {
  var WA = "https://wa.me/61433427505";
  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(location.search);

  // Mobile menu
  var btn = document.querySelector(".menu-btn"), menu = $("menu");
  if (btn && menu) {
    btn.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Home: live sample website
  if ($("s-site")) {
    var kinds = {
      bakery: { name: "Tendai's Bakery", head: "Fresh bread every morning in Avondale.", sub: "Order by WhatsApp and collect on your way to work.", tag: "Order on WhatsApp", cards: ["Bread & rolls", "Birthday cakes", "Find us"], bg: "#FFF6E8", hero: "#FFC63D", blob: "#FF9F5A", ink: "#3B2208", light: false, c: ["#FFE3B8", "#FFD6C4", "#F3E8D6"] },
      salon: { name: "Rufaro's Salon", head: "Braids, wigs and nails in Borrowdale.", sub: "Book your chair in two taps. Walk-ins welcome.", tag: "Book a chair", cards: ["Braids", "Nails", "Prices"], bg: "#FFF1F5", hero: "#E0638F", blob: "#FFD1E0", ink: "#3D0F22", light: true, c: ["#FFD6E4", "#F9E2FF", "#FFE9DD"] },
      hardware: { name: "Moyo Hardware", head: "Cement, roofing and tools in Bulawayo.", sub: "Get a quote today. Delivery across the city.", tag: "Ask for a quote", cards: ["Building", "Plumbing", "Delivery"], bg: "#F1F7F4", hero: "#2E8B57", blob: "#9BE3B8", ink: "#0E2A1A", light: true, c: ["#D6F0E2", "#E3EEE8", "#FFF0C7"] },
      school: { name: "Sunrise Academy", head: "Small classes. Big futures. Gweru.", sub: "Enrolling now for Form 1 and ECD.", tag: "Apply for 2027", cards: ["Admissions", "Fees", "Contact"], bg: "#EFF4FF", hero: "#4C6EF5", blob: "#A9C1FF", ink: "#0F1B4D", light: true, c: ["#DCE6FF", "#E9E2FF", "#DDF5F7"] }
    };
    var current = "bakery", typed = "";
    var slug = function (s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24) || "yourbusiness"; };
    var render = function () {
      var k = kinds[current], name = typed || k.name;
      $("s-name").textContent = name;
      $("s-url").textContent = slug(name);
      $("s-head").textContent = k.head; $("s-sub").textContent = k.sub; $("s-tag").textContent = k.tag;
      $("s-site").style.background = k.bg; $("s-site").style.color = k.ink;
      $("s-hero").style.background = k.hero; $("s-hero").style.color = k.light ? "#fff" : k.ink;
      $("s-blob").style.background = k.blob; $("s-logo").style.background = k.hero;
      ["s-c1", "s-c2", "s-c3"].forEach(function (id, i) { $(id).textContent = k.cards[i]; $(id).style.background = k.c[i]; });
    };
    document.querySelectorAll(".pickers button").forEach(function (b) {
      b.addEventListener("click", function () {
        current = b.dataset.kind;
        document.querySelectorAll(".pickers button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        render();
      });
    });
    $("bizname").addEventListener("input", function (e) { typed = e.target.value.trim(); render(); });
    render();
  }

  // Partners: earnings calculator
  if ($("sites")) {
    var money = function (n) { return "$" + (Math.round(n * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); };
    var calc = function () {
      var n = +$("sites").value;
      var web = $("c-web") ? +$("c-web").value : 180, host = $("c-host") ? +$("c-host").value : 15;
      $("sites-out").textContent = n;
      $("earn-once").textContent = money(n * web * 0.3);
      $("earn-month").textContent = money(n * host * 0.2);
    };
    ["sites", "c-web", "c-host"].forEach(function (id) { if ($(id)) $(id).addEventListener("input", calc); });
    calc();
  }

  // Domains: check on WhatsApp
  if ($("domain-form")) {
    $("domain-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("domain").value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\s+/g, "").split(".")[0];
      var d = name + $("tld").value;
      window.open(WA + "?text=" + encodeURIComponent("Hi Nexora, is " + d + " available? How much is it per year?"), "_blank", "noopener");
    });
  }

  // Contact: prefill and send on WhatsApp
  if ($("lead")) {
    if (params.get("biz")) $("f-biz").value = params.get("biz");
    if (params.get("plan")) {
      var want = params.get("plan");
      Array.prototype.forEach.call($("f-plan").options, function (o) { if (o.text === want) $("f-plan").value = o.value; });
    }
    $("lead").addEventListener("submit", function (e) {
      e.preventDefault();
      var t = "Hi Nexora, I'm interested in: " + $("f-plan").value + "\n\nName: " + $("f-name").value + "\nBusiness: " + $("f-biz").value + ($("f-msg").value ? "\n\n" + $("f-msg").value : "");
      window.open(WA + "?text=" + encodeURIComponent(t), "_blank", "noopener");
    });
  }

  if ($("yr")) $("yr").textContent = new Date().getFullYear();
})();
