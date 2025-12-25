// simulator.js
const { io } = require("socket.io-client");

// Cole aqui o ID que saiu no seed-pg.js (ex: 1)
const ENTREGADOR_ID = 1;

const socket = io("http://localhost:3000", { transports: ["websocket"] });

let lat = -23.5505;
let lng = -46.6333;

socket.on("connect", () => {
  console.log("🟢 Simulador conectado:", socket.id);

  setInterval(() => {
    lat += 0.00015;
    lng += 0.00015;

    socket.emit("localizacao", {
      entregadorId: ENTREGADOR_ID,
      latitude: lat,
      longitude: lng,
    });

    console.log("📍 Enviando:", lat.toFixed(6), lng.toFixed(6));
  }, 1000);
});

socket.on("connect_error", (err) => {
  console.log("❌ Erro conexão simulador:", err.message);
});
