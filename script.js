"use strict";

/* =========================================================
   CONFIGURAÇÃO PADRÃO (usada apenas se a API não responder)
========================================================= */
let WHATSAPP_NUMBER = "5521996431650";
let PRODUCTS = [];
let VIDEOS = [];

// Conteúdo de reserva, exibido só se o servidor estiver fora do ar.
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: "Vestido Essência",
    category: "Vestidos",
    price: "R$ 189,90",
    encomenda: "nao",
    image: "img/daily.jpg",
  },
  {
    id: 2,
    name: "Conjunto Áurea",
    category: "Conjuntos",
    price: "R$ 219,90",
    encomenda: "nao",
    image: "img/daily 0.jpg",
  },
  {
    id: 3,
    name: "Blusa Encanto",
    category: "Blusas",
    price: "R$ 99,90",
    encomenda: "nao",
    image: "img/daily2.jpg",
  },
];
const FALLBACK_VIDEOS = [
  {
    id: 1,
    title: "Bastidores da coleção",
    type: "local",
    url: "img/video1.mp4",
  },
];

/* =========================================================
   WHATSAPP
========================================================= */
function normalizeWhatsApp(value) {
  return String(value || "").replace(/\D/g, "") || "5521996431650";
}

function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function bindWhatsAppLinks(scope = document) {
  scope
    .querySelectorAll(".whatsapp-link[data-whatsapp-msg]")
    .forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        openWhatsApp(
          link.dataset.whatsappMsg || "Olá! Vim pelo site da Daily Fashion.",
        );
      });
    });
}

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        m
      ],
  );
}

/* =========================================================
   CATÁLOGO — renderização, filtros e modal de detalhes
========================================================= */
function isEncomenda(product) {
  return String(product?.encomenda || "").toLowerCase() === "sim";
}

function renderCatalogFilters() {
  const wrap = document.getElementById("catalogFilters");
  if (!wrap) return;
  const categories = [
    "Todas",
    ...new Set(PRODUCTS.map((p) => p.category).filter(Boolean)),
  ];
  wrap.innerHTML = categories
    .map(
      (cat, i) =>
        `<button type="button" class="filter-tab${i === 0 ? " active" : ""}" data-filter="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`,
    )
    .join("");

  wrap.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      wrap
        .querySelectorAll(".filter-tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      renderCatalog(tab.dataset.filter);
    });
  });
}

function renderCatalog(filter = "Todas") {
  const grid = document.getElementById("catalogGrid");
  if (!grid) return;
  const items =
    filter === "Todas"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === filter);

  if (!items.length) {
    grid.innerHTML = `<p class="muted-note">Nenhuma peça publicada nesta categoria no momento.</p>`;
    return;
  }

  grid.innerHTML = items
    .map((p) => {
      const encomenda = isEncomenda(p);
      return `
    <div class="card product-card" data-id="${p.id}">
      <div class="product-img">
        <img src="${escapeHtml(p.image || "")}" alt="${escapeHtml(p.name || "")}" loading="lazy">
        <span class="tag ${encomenda ? "tag-encomenda" : "tag-pronta"}">${encomenda ? "Sob encomenda" : "Pronta entrega"}</span>
      </div>
      <div class="product-info">
        <h3>${escapeHtml(p.name || "")}</h3>
        <p class="product-price">${escapeHtml(p.price || "Consulte")}</p>
        <div class="product-actions">
          <button type="button" class="btn btn-small btn-outline product-details" data-id="${p.id}">VER DETALHES</button>
          <button type="button" class="btn btn-small product-buy" data-id="${p.id}">COMPRAR</button>
        </div>
      </div>
    </div>`;
    })
    .join("");

  grid.querySelectorAll(".product-details, .product-img img").forEach((el) => {
    el.addEventListener("click", () =>
      openProductModal(
        findProduct(el.dataset.id || el.closest(".product-card")?.dataset.id),
      ),
    );
  });

  grid.querySelectorAll(".product-buy").forEach((btn) => {
    btn.addEventListener("click", () =>
      buyProduct(findProduct(btn.dataset.id)),
    );
  });
}

function findProduct(id) {
  return PRODUCTS.find((p) => String(p.id) === String(id));
}

function buyMessage(product) {
  const encomenda = isEncomenda(product);
  return encomenda
    ? `Olá! Gostaria de encomendar a peça "${product.name}" (${product.price || "consulte"}, sob encomenda${product.prazo ? ", prazo aproximado " + product.prazo : ""}). Poderia me passar mais detalhes e a forma de pagamento?`
    : `Olá! Tenho interesse na peça "${product.name}" (${product.price || "consulte"}). Ela está disponível para pronta entrega?`;
}

function buyProduct(product) {
  if (!product) return;
  addToCart(product);
}

function openProductModal(product) {
  if (!product) return;
  const modal = document.getElementById("productModal");
  if (!modal) return;
  const encomenda = isEncomenda(product);

  document.getElementById("productModalImage").src = product.image || "";
  document.getElementById("productModalImage").alt = product.name || "";
  document.getElementById("productModalName").textContent = product.name || "";
  document.getElementById("productModalDesc").textContent =
    product.description || "";
  document.getElementById("productModalPrice").textContent =
    product.price || "Consulte";

  const tagEl = document.getElementById("productModalTag");
  tagEl.textContent = encomenda
    ? `Sob encomenda${product.prazo ? " · " + product.prazo : ""}`
    : "Pronta entrega";
  tagEl.className = "tag " + (encomenda ? "tag-encomenda" : "tag-pronta");

  const buyBtn = document.getElementById("productModalBuy");
  buyBtn.dataset.whatsappMsg = buyMessage(product);
  buyBtn.dataset.productId = product.id;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeProductModal() {
  const modal = document.getElementById("productModal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

/* =========================================================
   VÍDEOS — Instagram, Facebook, YouTube e arquivos
========================================================= */
function detectEmbedKind(urlValue, explicitType) {
  const link = String(urlValue || "");
  const type = String(explicitType || "").toLowerCase();
  if (type === "instagram" || /instagram\.com\/(p|reel|tv)\//i.test(link))
    return "instagram";
  if (type === "facebook" || /facebook\.com|fb\.watch/i.test(link))
    return "facebook";
  if (type === "youtube" || /youtube\.com|youtu\.be/i.test(link))
    return "youtube";
  return "local";
}

function instagramEmbedSrc(urlValue) {
  const clean = String(urlValue || "")
    .split("?")[0]
    .replace(/\/$/, "");
  return `${clean}/embed/captioned/`;
}

function facebookEmbedSrc(urlValue) {
  const href = encodeURIComponent(String(urlValue || ""));
  return `https://www.facebook.com/plugins/video.php?href=${href}&show_text=false&autoplay=true`;
}

function youtubeEmbedSrc(urlValue) {
  const id =
    String(urlValue || "").match(
      /(?:embed\/|v=|youtu\.be\/)([A-Za-z0-9_-]{11})/,
    )?.[1] || "";
  return id
    ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
    : "";
}

function renderVideos() {
  const grid = document.getElementById("videoGrid");
  if (!grid) return;

  if (!VIDEOS.length) {
    grid.innerHTML = `<p class="muted-note">Nenhum vídeo publicado no momento.</p>`;
    return;
  }

  grid.innerHTML = VIDEOS.map((v) => {
    const kind = detectEmbedKind(v.url, v.type);
    const isFile = kind === "local";
    const badge =
      {
        local: "Vídeo",
        youtube: "YouTube",
        instagram: "Instagram",
        facebook: "Facebook",
      }[kind] || "Vídeo";
    const thumb = isFile
      ? `<video src="${escapeHtml(v.url)}" muted playsinline preload="metadata" aria-hidden="true"></video>`
      : `<div class="video-thumb-placeholder">▶</div>`;

    return `
    <button class="video-item" type="button" data-id="${v.id}">
      ${thumb}
      <span class="video-badge">${badge}</span>
      <span class="play-icon" aria-hidden="true">▶</span>
      <span class="video-label">${escapeHtml(v.title || v.caption || "Vídeo")}</span>
    </button>`;
  }).join("");

  grid.querySelectorAll(".video-item").forEach((btn) => {
    btn.addEventListener("click", () =>
      openVideoModal(VIDEOS.find((v) => String(v.id) === btn.dataset.id)),
    );
  });
}

function openVideoModal(video) {
  if (!video) return;
  const modal = document.getElementById("videoModal");
  const frame = document.getElementById("videoModalFrame");
  if (!modal || !frame) return;

  frame.replaceChildren();
  const kind = detectEmbedKind(video.url, video.type);

  if (kind === "local") {
    const el = document.createElement("video");
    el.src = video.url;
    el.controls = true;
    el.autoplay = true;
    el.playsInline = true;
    el.setAttribute("aria-label", video.title || "Vídeo");
    frame.appendChild(el);
  } else {
    let src = "";
    if (kind === "instagram") src = instagramEmbedSrc(video.url);
    else if (kind === "facebook") src = facebookEmbedSrc(video.url);
    else if (kind === "youtube") src = youtubeEmbedSrc(video.url);

    if (!src) {
      frame.innerHTML = `<p class="video-error">Link do vídeo ainda não configurado.</p>`;
    } else {
      const iframe = document.createElement("iframe");
      iframe.src = src;
      iframe.title = video.title || "Vídeo";
      iframe.loading = "lazy";
      iframe.setAttribute(
        "allow",
        "autoplay; encrypted-media; picture-in-picture; web-share; clipboard-write",
      );
      iframe.setAttribute("allowfullscreen", "");
      frame.appendChild(iframe);
    }
  }

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeVideoModal() {
  const modal = document.getElementById("videoModal");
  const frame = document.getElementById("videoModalFrame");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (frame) frame.replaceChildren();
}

/* =========================================================
   CARREGAMENTO DOS DADOS (painel → API → site)
========================================================= */
async function hydrateSite() {
  try {
    const response = await fetch("/api/public", { cache: "no-store" });
    if (!response.ok) throw new Error("API indisponível");
    const data = await response.json();
    WHATSAPP_NUMBER = normalizeWhatsApp(data.settings?.whatsapp);
    PRODUCTS = Array.isArray(data.products) ? data.products : [];
    VIDEOS = Array.isArray(data.videos) ? data.videos : [];
  } catch (error) {
    console.warn("Modo de contingência: exibindo conteúdo de reserva.", error);
    PRODUCTS = FALLBACK_PRODUCTS;
    VIDEOS = FALLBACK_VIDEOS;
  }
  renderCatalogFilters();
  renderCatalog();
  renderMiniShowcase();
  renderVideos();
}

/* =========================================================
   HERO + CARRINHO + PEDIDOS
========================================================= */
let cart = JSON.parse(localStorage.getItem("dailyFashionCart") || "[]");
let heroIndex = 0,
  heroTimer = null;
function moneyNumber(v) {
  const n = String(v || "")
    .replace(/[^0-9,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}
function money(v) {
  return Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
function saveCart() {
  localStorage.setItem("dailyFashionCart", JSON.stringify(cart));
  renderCart();
}
function addToCart(product) {
  if (!product) return;
  const row = cart.find((x) => String(x.product_id) === String(product.id));
  if (row) row.quantity++;
  else
    cart.push({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  saveCart();
  document.getElementById("pedido")?.scrollIntoView({ behavior: "smooth" });
}
function renderCart() {
  const wrap = document.getElementById("cartItems"),
    count = document.getElementById("cartCount"),
    totalEl = document.getElementById("cartTotal");
  if (!wrap) return;
  const totalItems = cart.reduce((a, x) => a + Number(x.quantity || 0), 0),
    total = cart.reduce(
      (a, x) => a + moneyNumber(x.price) * Number(x.quantity || 0),
      0,
    );
  count.textContent = `${totalItems} ${totalItems === 1 ? "item" : "itens"}`;
  totalEl.textContent = money(total);
  if (!cart.length) {
    wrap.innerHTML =
      '<p class="muted-note">Seu carrinho está vazio. Escolha uma peça no catálogo.</p>';
    return;
  }
  wrap.innerHTML = cart
    .map(
      (x, i) =>
        `<div class="cart-row"><img src="${escapeHtml(x.image || "")}" alt="${escapeHtml(x.name)}"><div><strong>${escapeHtml(x.name)}</strong><br><small>${escapeHtml(x.price || "Consulte")}</small></div><div class="cart-controls"><button type="button" data-cart="minus" data-i="${i}">−</button><span>${x.quantity}</span><button type="button" data-cart="plus" data-i="${i}">+</button><button type="button" data-cart="remove" data-i="${i}">×</button></div></div>`,
    )
    .join("");
  wrap.querySelectorAll("[data-cart]").forEach(
    (b) =>
      (b.onclick = () => {
        const i = Number(b.dataset.i),
          a = b.dataset.cart;
        if (a === "plus") cart[i].quantity++;
        if (a === "minus") cart[i].quantity--;
        if (a === "remove" || cart[i].quantity <= 0) cart.splice(i, 1);
        saveCart();
      }),
  );
}
function initHero() {
  const slides = [...document.querySelectorAll(".hero-slide")],
    dots = document.getElementById("heroDots");
  if (!slides.length) return;
  function setHeroImages() {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    slides.forEach((s) => {
      const image = isMobile && s.dataset.mobileImage ? s.dataset.mobileImage : s.dataset.image;
      s.style.backgroundImage = `url("${image}")`;
    });
  }
  setHeroImages();
  window.addEventListener("resize", setHeroImages);
  dots.innerHTML = slides
    .map(
      (_, i) =>
        `<button type="button" data-i="${i}" class="${i === 0 ? "active" : ""}" aria-label="Slide ${i + 1}"></button>`,
    )
    .join("");
  function show(i) {
    heroIndex = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle("active", n === heroIndex));
    dots
      .querySelectorAll("button")
      .forEach((b, n) => b.classList.toggle("active", n === heroIndex));
  }
  dots.querySelectorAll("button").forEach(
    (b) =>
      (b.onclick = () => {
        show(Number(b.dataset.i));
        reset();
      }),
  );
  document.getElementById("heroPrev")?.addEventListener("click", () => {
    show(heroIndex - 1);
    reset();
  });
  document.getElementById("heroNext")?.addEventListener("click", () => {
    show(heroIndex + 1);
    reset();
  });
  function reset() {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => show(heroIndex + 1), 5000);
  }
  reset();
}
function renderMiniShowcase() {
  const el = document.getElementById("miniGrid");
  if (!el) return;
  el.innerHTML = PRODUCTS.slice(0, 4)
    .map(
      (p) =>
        `<article class="mini-card"><img src="${escapeHtml(p.image || "")}" alt="${escapeHtml(p.name || "")}" loading="lazy"><div>${escapeHtml(p.name || "")}</div></article>`,
    )
    .join("");
}
async function submitOrder(form) {
  if (!cart.length) throw Error("Adicione pelo menos uma peça ao carrinho.");
  const fd = new FormData(form);
  const total = cart.reduce(
    (a, x) => a + moneyNumber(x.price) * Number(x.quantity || 0),
    0,
  );
  const data = {
    ...Object.fromEntries(fd),
    items: cart.map((x) => ({
      product_id: x.product_id,
      name: x.name,
      price: x.price,
      quantity: x.quantity,
    })),
    total: money(total),
  };
  const r = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const d = await r.json();
  if (!r.ok) throw Error(d.error || "Não foi possível registrar o pedido");
  cart = [];
  saveCart();
  return d;
}

/* =========================================================
   INICIALIZAÇÃO
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  // Efeito simples no menu ao rolar
  window.addEventListener("scroll", function () {
    const header = document.querySelector("header");
    header.classList.toggle("ativo", window.scrollY > 50);
  });

  initHero();
  renderCart();
  document.getElementById("checkoutBtn")?.addEventListener("click", () => {
    if (!cart.length) {
      document.getElementById("checkoutStatus").textContent =
        "Adicione uma peça antes de finalizar.";
      return;
    }
    const m = document.getElementById("checkoutModal");
    m.classList.add("open");
    m.setAttribute("aria-hidden", "false");
  });
  document.getElementById("checkoutClose")?.addEventListener("click", () => {
    const m = document.getElementById("checkoutModal");
    m.classList.remove("open");
    m.setAttribute("aria-hidden", "true");
  });
  document
    .getElementById("checkoutForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const st = document.getElementById("checkoutFormStatus");
      try {
        st.textContent = "Registrando pedido...";
        const d = await submitOrder(e.target);
        st.textContent = `Pedido ${d.order_number} registrado. Abrindo WhatsApp...`;
        const msg = `Olá! Meu pedido é ${d.order_number}. Gostaria de confirmar o atendimento.`;
        setTimeout(() => openWhatsApp(msg), 350);
        setTimeout(() => {
          document.getElementById("checkoutModal").classList.remove("open");
          e.target.reset();
          st.textContent = "";
        }, 900);
      } catch (err) {
        st.textContent = err.message;
      }
    });
  hydrateSite();
  bindWhatsAppLinks();

  document.getElementById("productModalBuy")?.addEventListener("click", (e) => {
    e.preventDefault();
    const id = e.currentTarget.dataset.productId;
    const p = findProduct(id);
    if (p) {
      addToCart(p);
      closeProductModal();
    } else
      openWhatsApp(
        e.currentTarget.dataset.whatsappMsg ||
          "Olá! Tenho interesse nesta peça da Daily Fashion.",
      );
  });

  document
    .getElementById("productModalClose")
    ?.addEventListener("click", closeProductModal);
  document.getElementById("productModal")?.addEventListener("click", (e) => {
    if (e.target.id === "productModal") closeProductModal();
  });

  document
    .getElementById("videoModalClose")
    ?.addEventListener("click", closeVideoModal);
  document.getElementById("videoModal")?.addEventListener("click", (e) => {
    if (e.target.id === "videoModal") closeVideoModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeProductModal();
      closeVideoModal();
    }
  });
});
