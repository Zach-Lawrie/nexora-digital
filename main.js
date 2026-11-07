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
      cakes: { name: "Yunice's Bakery", head: "Cakes for every celebration.", sub: "Weddings, birthdays, baby showers and more. Order on WhatsApp.", tag: "Order a cake", cards: ["Wedding cakes", "Birthday cakes", "Cupcakes"], bg: "#FFF4F7", hero: "#FFB3C8", blob: "#FFD9E4", ink: "#4A1530", light: false, c: ["#FFE4EC", "#FFF1D6", "#E3F4FE"], pics: ["wedding", "birthday", "cupcake"], heroPic: "birthday" },
      salon: { name: "Rufaro's Salon", head: "Braids, wigs and nails in Borrowdale.", sub: "Book your chair in two taps. Walk-ins welcome.", tag: "Book a chair", cards: ["Braids", "Nails", "Prices"], bg: "#FFF1F5", hero: "#E0638F", blob: "#FFD1E0", ink: "#3D0F22", light: true, c: ["#FFD6E4", "#F9E2FF", "#FFE9DD"] },
      hardware: { name: "Moyo Hardware", head: "Cement, roofing and tools in Bulawayo.", sub: "Get a quote today. Delivery across the city.", tag: "Ask for a quote", cards: ["Building", "Plumbing", "Delivery"], bg: "#F1F7F4", hero: "#2E8B57", blob: "#9BE3B8", ink: "#0E2A1A", light: true, c: ["#D6F0E2", "#E3EEE8", "#FFF0C7"] },
      school: { name: "Sunrise Academy", head: "Small classes. Big futures. Gweru.", sub: "Enrolling now for Form 1 and ECD.", tag: "Apply for 2027", cards: ["Admissions", "Fees", "Contact"], bg: "#EFF4FF", hero: "#4C6EF5", blob: "#A9C1FF", ink: "#0F1B4D", light: true, c: ["#DCE6FF", "#E9E2FF", "#DDF5F7"] }
    };
    var CAKES = {
      wedding: '<svg viewBox="0 0 100 100"><rect x="12" y="88" width="76" height="5" rx="2.5" fill="#E7C9D4"/><rect x="18" y="66" width="64" height="23" rx="5" fill="#fff"/><rect x="26" y="46" width="48" height="21" rx="5" fill="#FFF8F0"/><rect x="34" y="28" width="32" height="19" rx="5" fill="#fff"/><path d="M18 73h64M26 53h48M34 35h32" stroke="#FF8FB1" stroke-width="3"/><circle cx="30" cy="80" r="2.5" fill="#FF8FB1"/><circle cx="50" cy="80" r="2.5" fill="#FF8FB1"/><circle cx="70" cy="80" r="2.5" fill="#FF8FB1"/><path d="M50 27c-3-6-12-3-8 3l8 7 8-7c4-6-5-9-8-3z" fill="#FF5C8A"/></svg>',
      birthday: '<svg viewBox="0 0 100 100"><rect x="12" y="86" width="76" height="5" rx="2.5" fill="#E7C9D4"/><rect x="20" y="50" width="60" height="37" rx="7" fill="#8A4B33"/><path d="M20 58q0-8 8-8h44q8 0 8 8v3q-4 7-8 0-4 9-8 0-4 7-8 0-4 9-8 0-4 7-8 0-4 9-8 0-4 7-8 0z" fill="#FFD3E0"/><rect x="34" y="32" width="5" height="18" rx="2" fill="#7CC8F8"/><rect x="47.5" y="30" width="5" height="20" rx="2" fill="#B6EE3A"/><rect x="61" y="32" width="5" height="18" rx="2" fill="#7CC8F8"/><ellipse cx="36.5" cy="27" rx="3" ry="5" fill="#FFC43D"/><ellipse cx="50" cy="25" rx="3" ry="5" fill="#FFC43D"/><ellipse cx="63.5" cy="27" rx="3" ry="5" fill="#FFC43D"/><g fill="#fff"><rect x="28" y="72" width="5" height="2" rx="1" transform="rotate(30 30 73)"/><rect x="44" y="76" width="5" height="2" rx="1" transform="rotate(-25 46 77)"/><rect x="60" y="72" width="5" height="2" rx="1" transform="rotate(20 62 73)"/><rect x="68" y="79" width="5" height="2" rx="1" transform="rotate(-35 70 80)"/></g></svg>',
      cupcake: '<svg viewBox="0 0 100 100"><path d="M30 58h40l-6 30H36z" fill="#9AD0F5"/><path d="M38 58l3 30M50 58v30M62 58l-3 30" stroke="#fff" stroke-width="2.5" opacity=".7"/><circle cx="38" cy="54" r="11" fill="#FFB5CB"/><circle cx="62" cy="54" r="11" fill="#FFB5CB"/><circle cx="50" cy="44" r="13" fill="#FFC9D8"/><path d="M50 30q3-8 9-9" stroke="#3E8E2F" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="50" cy="31" r="5.5" fill="#E8335D"/></svg>'
    };
    CAKES.chapel = '<svg viewBox="0 0 100 100"><circle cx="50" cy="60" r="36" fill="#F7CF5F"/><path d="M30 92V58l20-18 20 18v34z" fill="#fff"/><path d="M50 40V16M42 24h16" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M44 92V77a6 6 0 0 1 12 0v15z" fill="#2F4A8A"/><rect x="37" y="61" width="7" height="9" rx="2" fill="#9DB4E0"/><rect x="56" y="61" width="7" height="9" rx="2" fill="#9DB4E0"/><rect x="16" y="91" width="68" height="4" rx="2" fill="#fff" opacity=".7"/></svg>';
    CAKES.chapelLogo = '<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="7" fill="#2F4A8A"/><path d="M7 19.5v-7l5-4 5 4v7z" fill="#fff"/><path d="M12 8.5V3.5M10 5.5h4" stroke="#F2C14E" stroke-width="1.8" stroke-linecap="round"/></svg>';
    CAKES.mic = '<svg viewBox="0 0 100 100"><rect x="38" y="14" width="24" height="46" rx="12" fill="#2F4A8A"/><path d="M28 48a22 22 0 0 0 44 0" stroke="#2F4A8A" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M50 70v14M36 86h28" stroke="#2F4A8A" stroke-width="5" stroke-linecap="round"/></svg>';
    CAKES.calendar = '<svg viewBox="0 0 100 100"><rect x="18" y="24" width="64" height="62" rx="9" fill="#fff" stroke="#C99A2E" stroke-width="4"/><path d="M18 33a9 9 0 0 1 9-9h46a9 9 0 0 1 9 9v9H18z" fill="#F2C14E"/><path d="M34 16v14M66 16v14" stroke="#C99A2E" stroke-width="5" stroke-linecap="round"/><circle cx="38" cy="58" r="5" fill="#2F4A8A"/><circle cx="62" cy="58" r="5" fill="#C99A2E"/><circle cx="38" cy="74" r="5" fill="#C99A2E"/><circle cx="62" cy="74" r="5" fill="#2F4A8A"/></svg>';
    CAKES.heart = '<svg viewBox="0 0 100 100"><path d="M50 84C20 62 14 46 22 34c8-11 22-9 28 2 6-11 20-13 28-2 8 12 2 28-28 50z" fill="#4CAF7A"/></svg>';
    kinds.church = { name: "Great Hope SDA Church", head: "Welcome home. Worship with us this Sabbath.", sub: "Sabbath School at 9am, Divine Service at 11am. Everyone is welcome.", tag: "Plan your visit", cards: ["Sermons", "Events", "Give"], bg: "#F3F6FB", hero: "#2F4A8A", blob: "#F2C14E", ink: "#14213D", light: true, c: ["#E3EAF7", "#FFF3D1", "#E6F4EA"], pics: ["mic", "calendar", "heart"], heroPic: "chapel", logoPic: "chapelLogo" };
    var current = "salon", typed = "";
    var slug = function (s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24) || "yourbusiness"; };
    var render = function () {
      var k = kinds[current], name = typed || k.name;
      $("s-name").textContent = name;
      $("s-url").textContent = slug(name);
      $("s-head").textContent = k.head; $("s-sub").textContent = k.sub; $("s-tag").textContent = k.tag;
      $("s-site").style.background = k.bg; $("s-site").style.color = k.ink;
      $("s-hero").style.background = k.hero; $("s-hero").style.color = k.light ? "#fff" : k.ink;
      $("s-blob").style.background = k.blob; $("s-logo").style.background = k.logoPic ? "transparent" : k.hero; $("s-logo").innerHTML = k.logoPic ? CAKES[k.logoPic] : "";
      ["s-c1", "s-c2", "s-c3"].forEach(function (id, i) {
        var el = $(id); el.textContent = "";
        if (k.pics) { var pic = document.createElement("span"); pic.className = "card-pic"; pic.innerHTML = CAKES[k.pics[i]]; el.appendChild(pic); }
        el.appendChild(document.createTextNode(k.cards[i])); el.style.background = k.c[i];
      });
      $("s-pic").innerHTML = k.heroPic ? CAKES[k.heroPic] : "";
      $("s-blob").style.display = k.heroPic ? "none" : "";
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
