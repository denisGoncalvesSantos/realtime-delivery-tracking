// ====== CONFIG ======
const API_URL = "http://localhost:3000";
const socket = io(API_URL, { transports: ["websocket"] });

// ====== MAPA ======
const map = L.map("map").setView([-23.5505, -46.6333], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

// Camadas
const markersLayer = L.layerGroup().addTo(map);
const routesLayer = L.layerGroup().addTo(map);
const areaLayer = L.layerGroup().addTo(map);

// ====== ESTADO ======
const state = {
  entregadores: new Map(),
  markers: new Map(),
  selectedId: null,
  areaBounds: null,
};

// ====== ELEMENTOS ======
const elList = document.getElementById("lista") || document.getElementById("list");
const elSearch = document.getElementById("search");
const elAtivo = document.getElementById("fAtivo");
const elInativo = document.getElementById("fInativo");
const btnAll = document.getElementById("btnAll");
const btnClear = document.getElementById("btnClear");
const elStats = document.getElementById("stats");

// ====== HELPERS ======
function hasCoords(loc) {
  return loc && typeof loc.latitude === "number" && typeof loc.longitude === "number";
}

function latLng(loc) {
  return [loc.latitude, loc.longitude];
}

function createMarkerIcon(status) {
  const color = status === "ativo" ? "#40ff40" : "#ff4040";
  return L.divIcon({
    className: "",
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};border:2px solid #111;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

// ====== FILTROS ======
function passesFilters(ent) {
  const q = (elSearch?.value || "").trim().toLowerCase();
  const okName = !q || (ent.nome || "").toLowerCase().includes(q);

  const st = ent.status || "ativo";
  const okStatus =
    (st === "ativo" && elAtivo?.checked) ||
    (st === "inativo" && elInativo?.checked);

  const okArea =
    !state.areaBounds ||
    (ent.localizacaoAtual &&
      state.areaBounds.contains(
        L.latLng(ent.localizacaoAtual.latitude, ent.localizacaoAtual.longitude)
      ));

  return okName && okStatus && okArea;
}

// ====== STATS ======
function updateStats() {
  const all = Array.from(state.entregadores.values());

  const total = all.length;
  const ativos = all.filter(e => e.status === "ativo").length;
  const inativos = all.filter(e => e.status === "inativo").length;
  const visiveis = all.filter(passesFilters).length;

  if (!elStats) return;

  elStats.innerHTML = `
    <div class="stat">Total: <b>${total}</b></div>
    <div class="stat">Ativos: <b>${ativos}</b></div>
    <div class="stat">Inativos: <b>${inativos}</b></div>
    <div class="stat">Visíveis: <b>${visiveis}</b></div>
  `;
}

// ====== ROTAS ======
function drawAllRoutes() {
  routesLayer.clearLayers();

  for (const ent of state.entregadores.values()) {
    if (!passesFilters(ent) || !ent.rota) continue;

    // Percorrido (histórico)
    if (Array.isArray(ent.historicoLocalizacao) && ent.historicoLocalizacao.length > 1) {
      const hist = ent.historicoLocalizacao.map(latLng);
      L.polyline(hist, {
        color: ent._id === state.selectedId ? "#00ff00" : "#66ff66",
        weight: ent._id === state.selectedId ? 6 : 3,
      }).addTo(routesLayer);
    }

    // Rota planejada (cinza)
    const points = [];
    if (ent.rota.inicio) points.push(latLng(ent.rota.inicio));
    ent.rota.checkpoints?.forEach(cp => points.push(latLng(cp)));
    if (ent.rota.fim) points.push(latLng(ent.rota.fim));

    if (points.length > 1) {
      L.polyline(points, {
        color: "#999",
        dashArray: "6,6",
        weight: 3,
      }).addTo(routesLayer);
    }
  }
}

// ====== RENDER ======
function render() {
  // LISTA
  if (elList) {
    elList.innerHTML = "";
    for (const ent of state.entregadores.values()) {
      if (!passesFilters(ent)) continue;

      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div class="name">${ent.nome}</div>
        <div class="small">Status: ${ent.status}</div>
      `;

      div.onclick = () => {
        state.selectedId = ent._id;
        drawAllRoutes();
      };

      elList.appendChild(div);
    }
  }

  // MARKERS
  for (const [id, mk] of state.markers.entries()) {
    const ent = state.entregadores.get(id);
    if (!ent) continue;

    if (passesFilters(ent)) {
      if (!markersLayer.hasLayer(mk)) mk.addTo(markersLayer);
    } else {
      if (markersLayer.hasLayer(mk)) markersLayer.removeLayer(mk);
    }
  }

  drawAllRoutes();
  updateStats();
}

// ====== UPSERT ======
function upsertEntregador(ent) {
  state.entregadores.set(ent._id, ent);

  if (hasCoords(ent.localizacaoAtual)) {
    const pos = latLng(ent.localizacaoAtual);
    let mk = state.markers.get(ent._id);

    if (!mk) {
      mk = L.marker(pos, { icon: createMarkerIcon(ent.status) })
        .addTo(markersLayer)
        .bindPopup(ent.nome);
      state.markers.set(ent._id, mk);
    } else {
      mk.setLatLng(pos);
    }
  }

  render();
}

// ====== EVENTOS UI ======
elSearch?.addEventListener("input", render);
elAtivo?.addEventListener("change", render);
elInativo?.addEventListener("change", render);

btnAll && (btnAll.onclick = () => {
  const latlngs = [];
  markersLayer.eachLayer(l => l.getLatLng && latlngs.push(l.getLatLng()));
  if (latlngs.length) map.fitBounds(L.latLngBounds(latlngs).pad(0.2));
});

btnClear && (btnClear.onclick = () => {
  state.selectedId = null;
  routesLayer.clearLayers();
});

// ====== FILTRO POR ÁREA ======
map.on("click", (e) => {
  if (!state.areaBounds) {
    state.areaBounds = L.latLngBounds(e.latlng, e.latlng);
  } else {
    state.areaBounds.extend(e.latlng);
  }

  areaLayer.clearLayers();
  L.rectangle(state.areaBounds, { color: "#0066ff", weight: 2 }).addTo(areaLayer);

  render();
});

// ====== BOOT ======
async function loadInitial() {
  const res = await fetch(`${API_URL}/entregadores`);
  const data = await res.json();
  data.forEach(upsertEntregador);
}

socket.on("entregadorAtualizado", upsertEntregador);
loadInitial();
