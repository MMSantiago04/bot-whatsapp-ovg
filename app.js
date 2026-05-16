const express = require("express");
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "mi_token_123";
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// ─── Estado de conversación por usuario ───────────────────
const userState = {};

// ─── Función para enviar mensaje de texto ─────────────────
async function sendMessage(to, text) {
  await fetch(`https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { body: text },
    }),
  });
}

// ─── Función para enviar documento PDF ────────────────────
async function sendPDF(to, pdfUrl, filename) {
  await fetch(`https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "document",
      document: {
        link: pdfUrl,
        filename: filename,
      },
    }),
  });
}

// ─── PDFs por categoría (reemplaza los links con los archivos realels) ───
const PDFS = {
  // Empaques personalizados - Alimentos
  bolsas_domicilios: { url: "LINK_PDF_BOLSAS_DOMICILIOS", nombre: "Bolsas para Domicilios.pdf" },
  cajas_comida_rapida: { url: "LINK_PDF_CAJAS_COMIDA_RAPIDA", nombre: "Cajas Comidas Rápidas.pdf" },
  cajas_postres_pizza: { url: "LINK_PDF_CAJAS_POSTRES_PIZZA", nombre: "Cajas Postres y Pizza.pdf" },
  cajas_sushi_carnes: { url: "LINK_PDF_CAJAS_SUSHI_CARNES", nombre: "Cajas Sushi Crepes Carnes.pdf" },
  cajas_industria_alimentaria: { url: "LINK_PDF_CAJAS_INDUSTRIA_ALIMENTARIA", nombre: "Cajas Industria Alimentaria.pdf" },
  // Ropa y Zapatos
  bolsas_ropa_zapatos: { url: "LINK_PDF_BOLSAS_ROPA_ZAPATOS", nombre: "Bolsas Ropa y Zapatos.pdf" },
  cajas_ropa_zapatos: { url: "LINK_PDF_CAJAS_ROPA_ZAPATOS", nombre: "Cajas Ropa y Zapatos.pdf" },
  // Joyería y Accesorios
  bolsas_joyeria: { url: "LINK_PDF_BOLSAS_JOYERIA", nombre: "Bolsas Joyería y Accesorios.pdf" },
  cajas_joyeria: { url: "LINK_PDF_CAJAS_JOYERIA", nombre: "Cajas Joyería y Accesorios.pdf" },
  // Boutique y Maquillaje
  bolsas_boutique: { url: "LINK_PDF_BOLSAS_BOUTIQUE", nombre: "Bolsas Boutique y Maquillaje.pdf" },
  cajas_boutique: { url: "LINK_PDF_CAJAS_BOUTIQUE", nombre: "Cajas Boutique y Maquillaje.pdf" },
  // Industria
  bolsas_industria: { url: "LINK_PDF_BOLSAS_INDUSTRIA", nombre: "Bolsas para la Industria.pdf" },
  cajas_industria: { url: "LINK_PDF_CAJAS_INDUSTRIA", nombre: "Cajas para la Industria.pdf" },
};

// ─── Menús ────────────────────────────────────────────────
const MENU_PRINCIPAL = `🖐️ ¡HOLA! ¡Buen día! Estamos ON LINE 🟢

¿En qué te podemos colaborar? 🖐️
Selecciona una de las siguientes opciones:

1️⃣ Asesoría Comercial y Cotizaciones
2️⃣ Quiero Hacer un Pedido ya Cotizado
3️⃣ Administración y Contabilidad
4️⃣ Producción y Pedidos
5️⃣ Despachos y Logística
6️⃣ Otro`;

const MENU_LINEAS = `Cuéntanos en qué línea de trabajo ONLINE estás interesado:

1️⃣ Empaques, Bolsas y Cajas Personalizadas
2️⃣ Empaques Genéricos Sin Marca Al Detal
3️⃣ Impresos Publicitarios Y Material POP
4️⃣ Publicidad Exterior y Gran Formato
5️⃣ Promocionales y Merchandising
6️⃣ Regresar al Menú Anterior`;

const MENU_CATEGORIAS_EMPAQUES = `Muy bien 😊
Selecciona la categoría en la que estás interesado 🎁📦

1️⃣ Empaques para Alimentos y Restaurantes
2️⃣ Empaques para Ropa y Zapatos
3️⃣ Empaques para Joyería y Accesorios
4️⃣ Empaques para Boutique y Maquillaje
5️⃣ Industria y Otros Empaques
6️⃣ Catálogo de ventas al por menor
7️⃣ Regresar al Menú Anterior

_Te recordamos que la cantidad mínima para personalizar con tu marca son *200 unidades*. Si deseas menos unidades puedes consultar nuestro catálogo de ventas al por menor marcando la opción 6._`;

const MENU_ALIMENTOS = `Excelente. Selecciona la solución de empaque que estás buscando, así podremos recomendarte el empaque adecuado y a tu medida.

1️⃣ Bolsas para domicilio
2️⃣ Cajas para Comida Rápida
3️⃣ Cajas para Postres y Pizza
4️⃣ Cajas para Sushi, Crepes, Carnes y Otros
5️⃣ Cajas para la Industria Alimentaria
6️⃣ Regresar Menú Anterior`;

const MENU_ROPA = `Excelente. Selecciona la solución de empaque que estás buscando, así podremos recomendarte el empaque adecuado y a tu medida.

1️⃣ Bolsas para Ropa y Zapatos
2️⃣ Cajas para Ropa y Zapatos
3️⃣ Regresar Menú Anterior`;

const MENU_JOYERIA = `Excelente. Selecciona la solución de empaque que estás buscando, así podremos recomendarte el empaque adecuado y a tu medida.

1️⃣ Bolsas para Joyería y Accesorios
2️⃣ Cajas para Joyería y Accesorios
3️⃣ Regresar Menú Anterior`;

const MENU_BOUTIQUE = `Excelente. Selecciona la solución de empaque que estás buscando, así podremos recomendarte el empaque adecuado y a tu medida.

1️⃣ Bolsas para Boutique y Maquillaje
2️⃣ Cajas para Boutique y Maquillaje
3️⃣ Regresar Menú Anterior`;

const MENU_INDUSTRIA = `Excelente. Selecciona la solución de empaque que estás buscando, así podremos recomendarte el empaque adecuado y a tu medida.

1️⃣ Bolsas para la Industria
2️⃣ Cajas para la Industria
3️⃣ Regresar Menú Anterior`;

const MSG_ASESOR = `✅ Perfecto, en breve uno de nuestros asesores se comunicará contigo para ayudarte. ¡Gracias por contactar a *Online Vision Gráfica*! 🙌`;

const MSG_PEDIDO = `📦 Para continuar con tu pedido ya cotizado, en breve un asesor se comunicará contigo para coordinar los detalles. ¡Gracias! 🙌`;

const MSG_ADMIN = `🧾 Tu mensaje ha sido recibido por el área de *Administración y Contabilidad*. En breve te atenderemos. ¡Gracias!`;

const MSG_PRODUCCION = `🏭 Tu mensaje ha sido recibido por el área de *Producción y Pedidos*. En breve te atenderemos. ¡Gracias!`;

const MSG_DESPACHOS = `🚚 Tu mensaje ha sido recibido por el área de *Despachos y Logística*. En breve te atenderemos. ¡Gracias!`;

const MSG_OTRO = `💬 Tu mensaje ha sido recibido. En breve uno de nuestros asesores se comunicará contigo. ¡Gracias por contactar a *Online Vision Gráfica*! 🙌`;

const MSG_ERROR = `❌ Disculpa, no entendí qué opción has escogido. Intenta de nuevo.`;

const MSG_NECESITA_AYUDA = `🙋 Parece que estás teniendo dificultades. Vamos a asignarte un asesor para que te ayude personalmente. ¡En breve te contactamos! 😊`;

const CATALOGO_MENOR = `🛍️ Aquí está nuestro catálogo de ventas al por menor:\n👉 https://www.onlinevisiongrafica.com/catalogo-bolsa-y-cajas-sin-marca/`;

// ─── Función principal del flujo ──────────────────────────
async function handleMessage(from, text) {
  const input = text.trim().toLowerCase();
  const num = text.trim();

  // Inicializar estado si es nuevo usuario
  if (!userState[from]) {
    userState[from] = { step: "inicio", intentos: 0 };
  }

  const state = userState[from];

  // ── INICIO ──────────────────────────────────────────────
  if (state.step === "inicio") {
    await sendMessage(from, MENU_PRINCIPAL);
    userState[from] = { step: "menu_principal", intentos: 0 };
    return;
  }

  // ── MENÚ PRINCIPAL ──────────────────────────────────────
  if (state.step === "menu_principal") {
    if (num === "1") {
      await sendMessage(from, MENU_LINEAS);
      userState[from] = { step: "menu_lineas", intentos: 0 };
    } else if (num === "2") {
      await sendMessage(from, MSG_PEDIDO);
      userState[from] = { step: "inicio", intentos: 0 };
    } else if (num === "3") {
      await sendMessage(from, MSG_ADMIN);
      userState[from] = { step: "inicio", intentos: 0 };
    } else if (num === "4") {
      await sendMessage(from, MSG_PRODUCCION);
      userState[from] = { step: "inicio", intentos: 0 };
    } else if (num === "5") {
      await sendMessage(from, MSG_DESPACHOS);
      userState[from] = { step: "inicio", intentos: 0 };
    } else if (num === "6") {
      await sendMessage(from, MSG_OTRO);
      userState[from] = { step: "inicio", intentos: 0 };
    } else {
      await manejarError(from, "menu_principal", MENU_PRINCIPAL);
    }
    return;
  }

  // ── MENÚ LÍNEAS ─────────────────────────────────────────
  if (state.step === "menu_lineas") {
    if (num === "1") {
      await sendMessage(from, MENU_CATEGORIAS_EMPAQUES);
      userState[from] = { step: "menu_categorias", intentos: 0 };
    } else if (num === "2") {
      await sendMessage(from, `🛍️ Catálogo de Empaques Genéricos Sin Marca:\n👉 https://www.onlinevisiongrafica.com/catalogo-bolsa-y-cajas-sin-marca/\n\nEn breve un asesor te contactará. 😊`);
      userState[from] = { step: "inicio", intentos: 0 };
    } else if (num === "3") {
      await sendMessage(from, MSG_ASESOR);
      userState[from] = { step: "inicio", intentos: 0 };
    } else if (num === "4") {
      await sendMessage(from, MSG_ASESOR);
      userState[from] = { step: "inicio", intentos: 0 };
    } else if (num === "5") {
      await sendMessage(from, MSG_ASESOR);
      userState[from] = { step: "inicio", intentos: 0 };
    } else if (num === "6") {
      await sendMessage(from, MENU_PRINCIPAL);
      userState[from] = { step: "menu_principal", intentos: 0 };
    } else {
      await manejarError(from, "menu_lineas", MENU_LINEAS);
    }
    return;
  }

  // ── MENÚ CATEGORÍAS DE EMPAQUES PERSONALIZADOS ──────────
  if (state.step === "menu_categorias") {
    if (num === "1") {
      await sendMessage(from, MENU_ALIMENTOS);
      userState[from] = { step: "menu_alimentos", intentos: 0 };
    } else if (num === "2") {
      await sendMessage(from, MENU_ROPA);
      userState[from] = { step: "menu_ropa", intentos: 0 };
    } else if (num === "3") {
      await sendMessage(from, MENU_JOYERIA);
      userState[from] = { step: "menu_joyeria", intentos: 0 };
    } else if (num === "4") {
      await sendMessage(from, MENU_BOUTIQUE);
      userState[from] = { step: "menu_boutique", intentos: 0 };
    } else if (num === "5") {
      await sendMessage(from, MENU_INDUSTRIA);
      userState[from] = { step: "menu_industria", intentos: 0 };
    } else if (num === "6") {
      await sendMessage(from, CATALOGO_MENOR);
      userState[from] = { step: "inicio", intentos: 0 };
    } else if (num === "7") {
      await sendMessage(from, MENU_LINEAS);
      userState[from] = { step: "menu_lineas", intentos: 0 };
    } else {
      await manejarError(from, "menu_categorias", MENU_CATEGORIAS_EMPAQUES);
    }
    return;
  }

  // ── ALIMENTOS ────────────────────────────────────────────
  if (state.step === "menu_alimentos") {
    if (num === "1") {
      await sendMessage(from, `Este es nuestro catálogo de BOLSAS PARA DOMICILIOS, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu medida!* 📦`);
      await sendPDF(from, PDFS.bolsas_domicilios.url, PDFS.bolsas_domicilios.nombre);
      await sendMessage(from, MSG_ASESOR);
      userState[from] = { step: "inicio", intentos: 0 };
    } else if (num === "2") {
      await sendMessage(from, `Este es nuestro catálogo de CAJAS PARA COMIDAS RÁPIDAS, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu medida!* 📦`);
      await sendPDF(from, PDFS.cajas_comida_rapida.url, PDFS.cajas_comida_rapida.nombre);
      await sendMessage(from, MSG_ASESOR);
      userState[from] = { step: "inicio", intentos: 0 };
    } else if (num === "3") {
      await sendMessage(from, `Este es nuestro catálogo de CAJAS PARA POSTRES Y PIZZA, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu medida!* 📦`);
      await sendPDF(from, PDFS.cajas_postres_pizza.url, PDFS.cajas_postres_pizza.nombre);
      await sendMessage(from, MSG_ASESOR);
      userState[from] = { step: "inicio", intentos: 0 };
    } else if (num === "4") {
      await sendMessage(from, `Este es nuestro catálogo de CAJAS PARA SUSHI, CREPES, CARNES Y OTROS, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu medida!* 📦`);
      await sendPDF(from, PDFS.cajas_sushi_carnes.url, PDFS.cajas_sushi_carnes.nombre);
      await sendMessage(from, MSG_ASESOR);
      userState[from] = { step: "inicio", intentos: 0 };
    } else if (num === "5") {
      await sendMessage(from, `Este es nuestro catálogo de CAJAS PARA LA INDUSTRIA ALIMENTARIA, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu medida!* 📦`);
      await sendPDF(from, PDFS.cajas_industria_alimentaria.url, PDFS.cajas_industria_alimentaria.nombre);
      await sendMessage(from, MSG_ASESOR);
      userState[from] = { step: "inicio", intentos: 0 };
    } else if (num === "6") {
      await sendMessage(from, MENU_CATEGORIAS_EMPAQUES);
      userState[from] = { step: "menu_categorias", intentos: 0 };
    } else {
      await manejarError(from, "menu_alimentos", MENU_ALIMENTOS);
    }
    return;
  }

  // ── ROPA Y ZAPATOS ───────────────────────────────────────
  if (state.step === "menu_ropa") {
    if (num === "1") {
      await sendMessage(from, `Este es nuestro catálogo de BOLSAS PARA ROPA Y ZAPATOS, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu medida!* 👟`);
      await sendPDF(from, PDFS.bolsas_ropa_zapatos.url, PDFS.bolsas_ropa_zapatos.nombre);
      await sendMessage(from, MSG_ASESOR);
      userState[from] = { step: "inicio", intentos: 0 };
    } else if (num === "2") {
      await sendMessage(from, `Este es nuestro catálogo de CAJAS PARA ROPA Y ZAPATOS, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu medida!* 👟`);
      await sendPDF(from, PDFS.cajas_ropa_zapatos.url, PDFS.cajas_ropa_zapatos.nombre);
      await sendMessage(from, MSG_ASESOR);
      userState[from] = { step: "inicio", intentos: 0 };
    } else if (num === "3") {
      await sendMessage(from, MENU_CATEGORIAS_EMPAQUES);
      userState[from] = { step: "menu_categorias", intentos: 0 };
    } else {
      await manejarError(from, "menu_ropa", MENU_ROPA);
    }
    return;
  }

  // ── JOYERÍA Y ACCESORIOS ─────────────────────────────────
  if (state.step === "menu_joyeria") {
    if (num === "1") {
      await sendMessage(from, `Este es nuestro catálogo de BOLSAS PARA JOYERÍA Y ACCESORIOS, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu medida!* 💍`);
      await sendPDF(from, PDFS.bolsas_joyeria.url, PDFS.bolsas_joyeria.nombre);
      await sendMessage(from, MSG_ASESOR);
      userState[from] = { step: "inicio", intentos: 0 };
    } else if (num === "2") {
      await sendMessage(from, `Este es nuestro catálogo de CAJAS PARA JOYERÍA Y ACCESORIOS, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu medida!* 💍`);
      await sendPDF(from, PDFS.cajas_joyeria.url, PDFS.cajas_joyeria.nombre);
      await sendMessage(from, MSG_ASESOR);
      userState[from] = { step: "inicio", intentos: 0 };
    } else if (num === "3") {
      await sendMessage(from, MENU_CATEGORIAS_EMPAQUES);
      userState[from] = { step: "menu_categorias", intentos: 0 };
    } else {
      await manejarError(from, "menu_joyeria", MENU_JOYERIA);
    }
    return;
  }

  // ── BOUTIQUE Y MAQUILLAJE ────────────────────────────────
  if (state.step === "menu_boutique") {
    if (num === "1") {
      await sendMessage(from, `Este es nuestro catálogo de BOLSAS PARA BOUTIQUE Y MAQUILLAJE, si no encuentras el que necesitas, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu gusto y medida!* 💄`);
      await sendPDF(from, PDFS.bolsas_boutique.url, PDFS.bolsas_boutique.nombre);
      await sendMessage(from, MSG_ASESOR);
      userState[from] = { step: "inicio", intentos: 0 };
    } else if (num === "2") {
      await sendMessage(from, `Este es nuestro catálogo de CAJAS PARA BOUTIQUE Y MAQUILLAJE, si no encuentras el que necesitas, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu gusto y medida!* 💄`);
      await sendPDF(from, PDFS.cajas_boutique.url, PDFS.cajas_boutique.nombre);
      await sendMessage(from, MSG_ASESOR);
      userState[from] = { step: "inicio", intentos: 0 };
    } else if (num === "3") {
      await sendMessage(from, MENU_CATEGORIAS_EMPAQUES);
      userState[from] = { step: "menu_categorias", intentos: 0 };
    } else {
      await manejarError(from, "menu_boutique", MENU_BOUTIQUE);
    }
    return;
  }

  // ── INDUSTRIA ────────────────────────────────────────────
  if (state.step === "menu_industria") {
    if (num === "1") {
      await sendMessage(from, `Este es nuestro catálogo de BOLSAS PARA LA INDUSTRIA, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu medida!* 🏭`);
      await sendPDF(from, PDFS.bolsas_industria.url, PDFS.bolsas_industria.nombre);
      await sendMessage(from, MSG_ASESOR);
      userState[from] = { step: "inicio", intentos: 0 };
    } else if (num === "2") {
      await sendMessage(from, `Este es nuestro catálogo de CAJAS PARA LA INDUSTRIA, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu medida!* 🏭`);
      await sendPDF(from, PDFS.cajas_industria.url, PDFS.cajas_industria.nombre);
      await sendMessage(from, MSG_ASESOR);
      userState[from] = { step: "inicio", intentos: 0 };
    } else if (num === "3") {
      await sendMessage(from, MENU_CATEGORIAS_EMPAQUES);
      userState[from] = { step: "menu_categorias", intentos: 0 };
    } else {
      await manejarError(from, "menu_industria", MENU_INDUSTRIA);
    }
    return;
  }

  // Si no coincide nada, mostrar menú principal
  await sendMessage(from, MENU_PRINCIPAL);
  userState[from] = { step: "menu_principal", intentos: 0 };
}

// ─── Manejo de errores con máx 2 intentos ─────────────────
async function manejarError(from, step, menuActual) {
  const state = userState[from];
  state.intentos = (state.intentos || 0) + 1;

  if (state.intentos >= 2) {
    await sendMessage(from, MSG_NECESITA_AYUDA);
    userState[from] = { step: "inicio", intentos: 0 };
  } else {
    await sendMessage(from, MSG_ERROR);
    await sendMessage(from, menuActual);
    userState[from] = { step, intentos: state.intentos };
  }
}

// ─── Rutas ────────────────────────────────────────────────
app.get("/", (req, res) => res.send("SERVER OK 🚀"));

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ WEBHOOK VERIFIED");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  const body = req.body;
  if (body.object === "whatsapp_business_account") {
    const changes = body.entry?.[0]?.changes?.[0]?.value;
    const message = changes?.messages?.[0];
    if (message && message.type === "text") {
      const from = message.from;
      const text = message.text?.body;
      console.log(`📩 Mensaje de ${from}: ${text}`);
      await handleMessage(from, text);
    }
  }
  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🔥 Servidor corriendo");
});