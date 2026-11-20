/* ===== PARA CONFIGURAR LA PÁGINA, CAMBIA SOLO ESTA PARTE ===== */
const CONFIG = {
  tiktokUsuario: "agrupacion.tierra",
  instagramPerfil:
    "https://www.instagram.com/tierra.mia.cr?utm_source=ig_web_button_share_sheet&fqnt=ZDNlZDc0MzIxNw==",
  // Enlace CSV de la hoja de Google (Archivo > Compartir > Publicar en la web > CSV)
  hojaCSV:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT7LzOHIcjAUvBkmr9nRDitOLnUf8ovfjJ0JnRDOX2IgEeiKB6BZYIvNCdB7w9jSYZGWUVjiUVehRyR/pub?gid=0&single=true&output=csv",
  // Enlace de la aplicación web de Google Apps Script (termina en /exec)
  formularioURL:
    "https://script.google.com/macros/s/AKfycbwdjufLKLVZXAz9BfcFUYqZlm9ETru5llTmat0k7LcU5yN3htSkb_EPexJvloneU380aw/exec",
  maxTiktoks: 4,
  maxInstagram: 6,
  // Álbumes: cada uno es como una carpeta. Al tocarlo se abren sus fotos.
  albumes: [
    {
      titulo: "Momentos",
      fotos: [
        { src: "images/ensayos/1.png", titulo: "Ensayo en el salón" },
        { src: "images/ensayos/2.png", titulo: "Ensayo general" },
        { src: "images/ensayos/3.png", titulo: "Ensayo general" },
        { src: "images/ensayos/4.png", titulo: "Ensayo general" },
      ],
    },
    {
      titulo: "Presentaciones",
      fotos: [
        {
          src: "images/presentaciones/1.jpg",
          titulo: "Presentación en Tilarán",
        },
        {
          src: "images/presentaciones/2.jpg",
          titulo: "Presentación en el festival",
        },
      ],
    },
  ],
  encargados: [
    {
      nombre: "Berith Daniela Ortiz Salas",
      tel: "50684041676",
      vista: "8404 1676",
    },
    {
      nombre: "Hugo David Rojas Pérez",
      tel: "50672152008",
      vista: "7215 2008",
    },
  ],
};
/* ============================================================== */

const $ = (id) => document.getElementById(id);
const loadScript = (src) => {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.body.appendChild(s);
};
const perfilTT = "https://www.tiktok.com/@" + CONFIG.tiktokUsuario;

// Convierte el texto CSV de la hoja de Google en filas y columnas
function parseCSV(t) {
  const rows = [];
  let r = [],
    c = "",
    q = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (q) {
      if (ch === '"') {
        if (t[i + 1] === '"') {
          c += '"';
          i++;
        } else q = false;
      } else c += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") {
      r.push(c);
      c = "";
    } else if (ch === "\n") {
      r.push(c);
      rows.push(r);
      r = [];
      c = "";
    } else if (ch !== "\r") c += ch;
  }
  if (c || r.length) {
    r.push(c);
    rows.push(r);
  }
  return rows;
}

// Descarga la hoja de Google y devuelve una lista de {tipo, enlace}
async function cargarHoja() {
  if (!CONFIG.hojaCSV) return [];
  try {
    const res = await fetch(CONFIG.hojaCSV + "&t=" + Date.now());
    if (!res.ok) throw new Error("Respuesta " + res.status);
    return parseCSV(await res.text())
      .slice(1)
      .map((f) => ({
        tipo: (f[0] || "").trim().toLowerCase(),
        enlace: (f[1] || "").trim(),
      }))
      .filter((x) => x.enlace);
  } catch (e) {
    console.error("No se pudo leer la hoja:", e);
    return [];
  }
}

// Muestra los videos de TikTok y las publicaciones de Instagram
async function init() {
  const items = await cargarHoja();

  // TikTok: se toma el número del video del enlace; lo más nuevo (última fila) sale primero
  const ids = items
    .filter((x) => x.tipo === "tiktok")
    .map((x) => (x.enlace.match(/video\/(\d+)/) || [])[1])
    .filter(Boolean)
    .reverse()
    .slice(0, CONFIG.maxTiktoks);
  if (ids.length) {
    $("track").innerHTML = ids
      .map(
        (id) =>
          `<blockquote class="tiktok-embed" cite="${perfilTT}/video/${id}" data-video-id="${id}"><section></section></blockquote>`,
      )
      .join("");
    loadScript("https://www.tiktok.com/embed.js");
  } else {
    $("track").innerHTML =
      '<div class="empty">Pronto subiremos videos aquí. Mientras tanto, míralos en nuestro perfil de TikTok.</div>';
  }

  // Instagram
  const posts = items
    .filter((x) => x.tipo === "instagram" && x.enlace.includes("instagram.com"))
    .map((x) => x.enlace.split("?")[0])
    .reverse()
    .slice(0, CONFIG.maxInstagram);
  if (posts.length) {
    $("igPosts").innerHTML = posts
      .map(
        (u) =>
          `<blockquote class="instagram-media" data-instgrm-permalink="${u}" data-instgrm-version="14"></blockquote>`,
      )
      .join("");
    loadScript("https://www.instagram.com/embed.js");
  } else {
    $("igPosts").hidden = true;
  }
}

$("ttLink").href = perfilTT;
$("igLink").href = CONFIG.instagramPerfil;
$("ttFoot").href = perfilTT;
$("igFoot").href = CONFIG.instagramPerfil;
$("prev").onclick = () =>
  $("track").scrollBy({ left: -360, behavior: "smooth" });
$("next").onclick = () =>
  $("track").scrollBy({ left: 360, behavior: "smooth" });
init();

// Galería en álbumes
if (CONFIG.albumes.length) {
  $("gallery").innerHTML = CONFIG.albumes
    .map((a, i) => {
      const portada = a.portada || (a.fotos[0] && a.fotos[0].src) || "";
      const n = a.fotos.length;
      return `<button class="album" type="button" data-i="${i}" aria-label="Abrir álbum ${a.titulo}">
      ${portada ? `<img src="${portada}" alt="" loading="lazy">` : ""}
      <span>${a.titulo}<small>${n} ${n === 1 ? "foto" : "fotos"}</small></span></button>`;
    })
    .join("");
} else {
  $("gallery").innerHTML = ["ensayos", "presentaciones"]
    .map(
      (t) =>
        `<div class="album vacio"><span>${t}<small>Pronto</small></span></div>`,
    )
    .join("");
}

// Modal con todas las fotos del álbum
const lb = $("lb"),
  grid = $("lbGrid");
let fotosAct = [],
  idx = 0;

function abrirAlbum(i) {
  const a = CONFIG.albumes[i];
  fotosAct = a.fotos;
  $("lbTitle").textContent = a.titulo;
  grid.innerHTML = a.fotos
    .map(
      (f, k) =>
        `<figure tabindex="0" data-k="${k}"><img src="${f.src}" alt="${f.titulo || a.titulo}" loading="lazy"></figure>`,
    )
    .join("");
  lb.showModal();
  lb.scrollTop = 0;
}

$("gallery").addEventListener("click", (e) => {
  const b = e.target.closest(".album[data-i]");
  if (b) abrirAlbum(+b.dataset.i);
});

// Visor: una foto grande con flechas a los lados
const visor = $("visor"),
  vImg = $("vImg");

function mostrar(k) {
  idx = (k + fotosAct.length) % fotosAct.length; // al llegar al final da la vuelta
  const f = fotosAct[idx];
  vImg.src = f.src;
  vImg.alt = f.titulo || "";
  $("vCount").textContent = idx + 1 + " / " + fotosAct.length;
}
function abrirVisor(k) {
  mostrar(k);
  visor.showModal();
}

// Tocar una foto del álbum abre el visor
grid.addEventListener("click", (e) => {
  const fig = e.target.closest("figure");
  if (fig) abrirVisor(+fig.dataset.k);
});
grid.addEventListener("keydown", (e) => {
  const fig = e.target.closest("figure");
  if (fig && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    abrirVisor(+fig.dataset.k);
  }
});

// Flechas con el mouse o el dedo
$("vPrev").onclick = () => mostrar(idx - 1);
$("vNext").onclick = () => mostrar(idx + 1);
$("vClose").onclick = () => visor.close();
visor.addEventListener("click", (e) => {
  if (e.target === visor) visor.close(); // tocar el fondo cierra
});

// Flechas del teclado
document.addEventListener("keydown", (e) => {
  if (!visor.open) return;
  if (e.key === "ArrowRight") {
    e.preventDefault();
    mostrar(idx + 1);
  }
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    mostrar(idx - 1);
  }
});

// Deslizar con el dedo en el celular
let x0 = null;
visor.addEventListener(
  "touchstart",
  (e) => {
    x0 = e.touches[0].clientX;
  },
  { passive: true },
);
visor.addEventListener("touchend", (e) => {
  if (x0 === null) return;
  const dx = e.changedTouches[0].clientX - x0;
  x0 = null;
  if (Math.abs(dx) > 50) mostrar(idx + (dx < 0 ? 1 : -1));
});

$("lbClose").onclick = () => lb.close();
lb.addEventListener("click", (e) => {
  if (e.target === lb) lb.close();
});

// Encargados: solo WhatsApp
$("phones").insertAdjacentHTML(
  "beforeend",
  CONFIG.encargados
    .map((e) => {
      const ini = e.nombre
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase();
      const msg = encodeURIComponent(
        "Hola, quiero información para unirme a Tierra Mía",
      );
      return `<div class="enc">
        <span class="enc-ini" aria-hidden="true">${ini}</span>
        <div class="enc-info"><b>${e.nombre}</b><small>${e.vista}</small></div>
        <a class="wa" href="https://wa.me/${e.tel}?text=${msg}" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp a ${e.nombre}">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>
          WhatsApp
        </a>
      </div>`;
    })
    .join(""),
);

// Formulario (modal)
const dlg = $("dlg"),
  form = $("form"),
  st = $("status");
const fallo = "No se pudo enviar. Intenta de nuevo o escríbenos por WhatsApp.";
$("mail").onclick = () => {
  form.hidden = false;
  $("sent").hidden = true;
  st.textContent = "";
  dlg.showModal();
};
["mx", "cancel", "ok"].forEach((i) => ($(i).onclick = () => dlg.close()));
dlg.addEventListener("click", (e) => {
  if (e.target === dlg) dlg.close();
});
form.onsubmit = async (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  if (!CONFIG.formularioURL) {
    st.textContent =
      "El formulario aún no está activado. Escríbenos por WhatsApp.";
    return;
  }
  $("send").disabled = true;
  st.textContent = "Enviando…";
  try {
    const r = await fetch(CONFIG.formularioURL, {
      method: "POST",
      body: new URLSearchParams(new FormData(form)),
    });
    const j = await r.json();
    if (j.ok) {
      form.hidden = true;
      $("sent").hidden = false;
      form.reset();
      st.textContent = "";
    } else st.textContent = j.error || fallo;
  } catch (err) {
    st.textContent = fallo;
  }
  $("send").disabled = false;
};
$("yr").textContent = new Date().getFullYear();

// Aparición suave de los contenidos al hacer scroll
if ("IntersectionObserver" in window) {
  document.documentElement.classList.add("js-reveal");
  const els = [
    ...document.querySelectorAll(
      "section h2, section .lead, .arrows, #igLink, .track, .igPosts, .album, .contact .card, .enc",
    ),
  ];
  els.forEach((el) => {
    el.classList.add("reveal");
    const i = [...el.parentElement.children].indexOf(el);
    el.style.setProperty("--d", Math.min(i, 6) * 90 + "ms");
  });
  const io = new IntersectionObserver(
    (entradas) =>
      entradas.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
  );
  els.forEach((el) => io.observe(el));
}
