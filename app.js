const express = require("express");
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "mi_token_123";
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

const userState = {};

async function sendMessage(to, text) {
  await fetch(`https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to, type: "text", text: { body: text } }),
  });
}

async function sendPDF(to, pdfUrl, filename) {
  await fetch(`https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to, type: "document", document: { link: pdfUrl, filename } }),
  });
}

const PDFS = {
  bolsas_domicilios:          { url: "LINK_PDF_BOLSAS_DOMICILIOS",          nombre: "Bolsas para Domicilios.pdf" },
  cajas_comida_rapida:        { url: "LINK_PDF_CAJAS_COMIDA_RAPIDA",        nombre: "Cajas Comidas Rápidas.pdf" },
  cajas_postres_pizza:        { url: "LINK_PDF_CAJAS_POSTRES_PIZZA",        nombre: "Cajas Postres y Pizza.pdf" },
  cajas_sushi_carnes:         { url: "LINK_PDF_CAJAS_SUSHI_CARNES",         nombre: "Cajas Sushi Crepes Carnes.pdf" },
  cajas_industria_alimentaria:{ url: "LINK_PDF_CAJAS_INDUSTRIA_ALIMENTARIA",nombre: "Cajas Industria Alimentaria.pdf" },
  bolsas_ropa_zapatos:        { url: "LINK_PDF_BOLSAS_ROPA_ZAPATOS",        nombre: "Bolsas Ropa y Zapatos.pdf" },
  cajas_ropa_zapatos:         { url: "LINK_PDF_CAJAS_ROPA_ZAPATOS",         nombre: "Cajas Ropa y Zapatos.pdf" },
  bolsas_joyeria:             { url: "LINK_PDF_BOLSAS_JOYERIA",             nombre: "Bolsas Joyería y Accesorios.pdf" },
  cajas_joyeria:              { url: "LINK_PDF_CAJAS_JOYERIA",              nombre: "Cajas Joyería y Accesorios.pdf" },
  bolsas_boutique:            { url: "LINK_PDF_BOLSAS_BOUTIQUE",            nombre: "Bolsas Boutique y Maquillaje.pdf" },
  cajas_boutique:             { url: "LINK_PDF_CAJAS_BOUTIQUE",             nombre: "Cajas Boutique y Maquillaje.pdf" },
  bolsas_industria:           { url: "LINK_PDF_BOLSAS_INDUSTRIA",           nombre: "Bolsas para la Industria.pdf" },
  cajas_industria:            { url: "LINK_PDF_CAJAS_INDUSTRIA",            nombre: "Cajas para la Industria.pdf" },
  bolsas_sin_marca:           { url: "LINK_PDF_BOLSAS_SIN_MARCA",           nombre: "Bolsas sin marca.pdf" },
  cajas_comida_generica:      { url: "LINK_PDF_CAJAS_COMIDA_GENERICA",      nombre: "Cajas para comida Generica.pdf" },
  cajas_accesorios_otros:     { url: "LINK_PDF_CAJAS_ACCESORIOS_OTROS",     nombre: "Cajas para accesorios y otros.pdf" },
};

const MENU_PRINCIPAL = `🖐️ ¡HOLA! ¡Buen día! Estamos ON LINE 🟢\n\n¿En qué te podemos colaborar? 🖐️\nSelecciona una de las siguientes opciones:\n\n1️⃣ Asesoría Comercial y Cotizaciones\n2️⃣ Quiero Hacer un Pedido ya Cotizado\n3️⃣ Administración y Contabilidad\n4️⃣ Producción y Pedidos\n5️⃣ Despachos y Logística\n6️⃣ Otro`;
const MENU_LINEAS = `Cuéntanos en qué línea de trabajo ONLINE estás interesado:\n\n1️⃣ Empaques, Bolsas y Cajas Personalizadas\n2️⃣ Empaques Genéricos Sin Marca Al Detal\n3️⃣ Impresos Publicitarios Y Material POP\n4️⃣ Publicidad Exterior y Gran Formato\n5️⃣ Promocionales y Merchandising\n6️⃣ Regresar al Menú Anterior`;
const MENU_CATEGORIAS = `Muy bien 😊\nSelecciona la categoría en la que estás interesado 🎁📦\n\n1️⃣ Empaques para Alimentos y Restaurantes\n2️⃣ Empaques para Ropa y Zapatos\n3️⃣ Empaques para Joyería y Accesorios\n4️⃣ Empaques para Boutique y Maquillaje\n5️⃣ Industria y Otros Empaques\n6️⃣ Catálogo de ventas al por menor\n7️⃣ Regresar al Menú Anterior\n\n_Te recordamos que la cantidad mínima para personalizar con tu marca son *200 unidades*. Si deseas menos unidades puedes consultar nuestro catálogo de ventas al por menor marcando la opción 6._`;
const MENU_ALIMENTOS = `Excelente. Selecciona la solución de empaque que estás buscando:\n\n1️⃣ Bolsas para domicilio\n2️⃣ Cajas para Comida Rápida\n3️⃣ Cajas para Postres y Pizza\n4️⃣ Cajas para Sushi, Crepes, Carnes y Otros\n5️⃣ Cajas para la Industria Alimentaria\n6️⃣ Regresar Menú Anterior`;
const MENU_ROPA = `Excelente. Selecciona la solución de empaque que estás buscando:\n\n1️⃣ Bolsas para Ropa y Zapatos\n2️⃣ Cajas para Ropa y Zapatos\n3️⃣ Regresar Menú Anterior`;
const MENU_JOYERIA = `Excelente. Selecciona la solución de empaque que estás buscando:\n\n1️⃣ Bolsas para Joyería y Accesorios\n2️⃣ Cajas para Joyería y Accesorios\n3️⃣ Regresar Menú Anterior`;
const MENU_BOUTIQUE = `Excelente. Selecciona la solución de empaque que estás buscando:\n\n1️⃣ Bolsas para Boutique y Maquillaje\n2️⃣ Cajas para Boutique y Maquillaje\n3️⃣ Regresar Menú Anterior`;
const MENU_INDUSTRIA = `Excelente. Selecciona la solución de empaque que estás buscando:\n\n1️⃣ Bolsas para la Industria\n2️⃣ Cajas para la Industria\n3️⃣ Regresar Menú Anterior`;
const MENU_GENERICOS = `Muy bien 😊\nSelecciona la categoría en la que estás interesado 🎁📦\n\n1️⃣ Bolsas para domicilios\n2️⃣ Cajas para Comidas Rápidas\n3️⃣ Cajas para Accesorios y Otros\n4️⃣ Regresar al Menú Anterior\n\n_Te recordamos que la cantidad mínima para venta al detal es *10 unidades*._`;
const MENU_IMPRESOS = `MUY BUEN DÍA!, estás comunicado con el ÁREA de IMPRESOS PUBLICITARIOS, IMPRESIÓN LITOGRÁFICA Y MATERIAL POP, aquí te ayudamos con todo lo referente a impresión de VOLANTES, AFICHES, CARPETAS, CUADERNOS, REVISTAS, PLEGABLES, TARJETAS ETC.\n\n¿Esto es lo que estás buscando?\n\n1️⃣ Sí\n2️⃣ No`;
const MENU_PUBLICIDAD = `MUY BUEN DÍA!, estás comunicado con el ÁREA de PUBLICIDAD EXTERIOR Y DE GRAN FORMATO, aquí te ayudamos con todo lo referente a impresión de PENDONES, VALLAS, VINILOS PARA PARED, ESTRUCTURAS, TROPEZONES, AVISOS, ETC.\n\n¿Esto es lo que estás buscando?\n\n1️⃣ Sí\n2️⃣ No`;
const MENU_PUBLICIDAD_SI = `Muy bien 😊\nSelecciona el producto en el que estás interesado 🎁📦\n\n1️⃣ Pendones, pasacalles y vallas\n2️⃣ Estructuras portátiles\n3️⃣ Vinilos adhesivos y branding\n4️⃣ Avisos y fachadas\n5️⃣ Otros`;
const MENU_PROMOCIONALES = `MUY BUEN DÍA!, estás comunicado con el ÁREA de PROMOCIONALES Y MERCHANDISING, aquí te ayudamos con todo lo referente a impresión de PROMOCIONALES, GORRAS, MANILLAS, BOTENES, ETC.\n\n¿Esto es lo que estás buscando?\n\n1️⃣ Sí\n2️⃣ No`;

const MSG_ASESOR =         `✅ Perfecto, en breve uno de nuestros asesores se comunicará contigo. ¡Gracias por contactar a *Online Vision Gráfica*! 🙌`;
const MSG_PEDIDO =         `📦 Para continuar con tu pedido ya cotizado, en breve un asesor se comunicará contigo. ¡Gracias! 🙌`;
const MSG_ADMIN =          `🧾 Tu mensaje ha sido recibido por el área de *Administración y Contabilidad*. En breve te atenderemos. ¡Gracias!`;
const MSG_PRODUCCION =     `🏭 Tu mensaje ha sido recibido por el área de *Producción y Pedidos*. En breve te atenderemos. ¡Gracias!`;
const MSG_DESPACHOS =      `🚚 Tu mensaje ha sido recibido por el área de *Despachos y Logística*. En breve te atenderemos. ¡Gracias!`;
const MSG_OTRO =           `💬 Tu mensaje ha sido recibido. En breve un asesor se comunicará contigo. ¡Gracias por contactar a *Online Vision Gráfica*! 🙌`;
const MSG_ERROR =          `❌ Disculpa, no entendí qué opción has escogido. Intenta de nuevo.`;
const MSG_NECESITA_AYUDA = `🙋 Parece que estás teniendo dificultades. Vamos a asignarte un asesor para que te ayude personalmente. ¡En breve te contactamos! 😊`;
const MSG_OTRO_SERVICIO =  `Confírmame, por favor ¿Cuál de los siguientes servicios estás buscando?`;
const CATALOGO_MENOR =     `🛍️ Aquí está nuestro catálogo de ventas al por menor:\n👉 https://www.onlinevisiongrafica.com/catalogo-bolsa-y-cajas-sin-marca/`;

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

async function handleMessage(from, text) {
  const num = text.trim();
  if (!userState[from]) userState[from] = { step: "inicio", intentos: 0 };
  const state = userState[from];

  if (state.step === "inicio") {
    await sendMessage(from, MENU_PRINCIPAL);
    userState[from] = { step: "menu_principal", intentos: 0 };
    return;
  }

  if (state.step === "menu_principal") {
    if (num === "1") { await sendMessage(from, MENU_LINEAS); userState[from] = { step: "menu_lineas", intentos: 0 }; }
    else if (num === "2") { await sendMessage(from, MSG_PEDIDO); userState[from] = { step: "inicio", intentos: 0 }; }
    else if (num === "3") { await sendMessage(from, MSG_ADMIN); userState[from] = { step: "inicio", intentos: 0 }; }
    else if (num === "4") { await sendMessage(from, MSG_PRODUCCION); userState[from] = { step: "inicio", intentos: 0 }; }
    else if (num === "5") { await sendMessage(from, MSG_DESPACHOS); userState[from] = { step: "inicio", intentos: 0 }; }
    else if (num === "6") { await sendMessage(from, MSG_OTRO); userState[from] = { step: "inicio", intentos: 0 }; }
    else { await manejarError(from, "menu_principal", MENU_PRINCIPAL); }
    return;
  }

  if (state.step === "menu_lineas") {
    if (num === "1") { await sendMessage(from, MENU_CATEGORIAS); userState[from] = { step: "menu_categorias", intentos: 0 }; }
    else if (num === "2") { await sendMessage(from, MENU_GENERICOS); userState[from] = { step: "menu_genericos", intentos: 0 }; }
    else if (num === "3") { await sendMessage(from, MENU_IMPRESOS); userState[from] = { step: "menu_impresos", intentos: 0 }; }
    else if (num === "4") { await sendMessage(from, MENU_PUBLICIDAD); userState[from] = { step: "menu_publicidad", intentos: 0 }; }
    else if (num === "5") { await sendMessage(from, MENU_PROMOCIONALES); userState[from] = { step: "menu_promocionales", intentos: 0 }; }
    else if (num === "6") { await sendMessage(from, MENU_PRINCIPAL); userState[from] = { step: "menu_principal", intentos: 0 }; }
    else { await manejarError(from, "menu_lineas", MENU_LINEAS); }
    return;
  }

  if (state.step === "menu_categorias") {
    if (num === "1") { await sendMessage(from, MENU_ALIMENTOS); userState[from] = { step: "menu_alimentos", intentos: 0 }; }
    else if (num === "2") { await sendMessage(from, MENU_ROPA); userState[from] = { step: "menu_ropa", intentos: 0 }; }
    else if (num === "3") { await sendMessage(from, MENU_JOYERIA); userState[from] = { step: "menu_joyeria", intentos: 0 }; }
    else if (num === "4") { await sendMessage(from, MENU_BOUTIQUE); userState[from] = { step: "menu_boutique", intentos: 0 }; }
    else if (num === "5") { await sendMessage(from, MENU_INDUSTRIA); userState[from] = { step: "menu_industria", intentos: 0 }; }
    else if (num === "6") { await sendMessage(from, CATALOGO_MENOR); userState[from] = { step: "inicio", intentos: 0 }; }
    else if (num === "7") { await sendMessage(from, MENU_LINEAS); userState[from] = { step: "menu_lineas", intentos: 0 }; }
    else { await manejarError(from, "menu_categorias", MENU_CATEGORIAS); }
    return;
  }

  if (state.step === "menu_alimentos") {
    if (num === "1") { await sendMessage(from, `Este es nuestro catálogo de BOLSAS PARA DOMICILIOS, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu medida!* 📦`); await sendPDF(from, PDFS.bolsas_domicilios.url, PDFS.bolsas_domicilios.nombre); await sendMessage(from, MSG_ASESOR); userState[from] = { step: "inicio", intentos: 0 }; }
    else if (num === "2") { await sendMessage(from, `Este es nuestro catálogo de CAJAS PARA COMIDAS RÁPIDAS, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu medida!* 📦`); await sendPDF(from, PDFS.cajas_comida_rapida.url, PDFS.cajas_comida_rapida.nombre); await sendMessage(from, MSG_ASESOR); userState[from] = { step: "inicio", intentos: 0 }; }
    else if (num === "3") { await sendMessage(from, `Este es nuestro catálogo de CAJAS PARA POSTRES Y PIZZA, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu medida!* 📦`); await sendPDF(from, PDFS.cajas_postres_pizza.url, PDFS.cajas_postres_pizza.nombre); await sendMessage(from, MSG_ASESOR); userState[from] = { step: "inicio", intentos: 0 }; }
    else if (num === "4") { await sendMessage(from, `Este es nuestro catálogo de CAJAS PARA SUSHI, CREPES, CARNES Y OTROS, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu medida!* 📦`); await sendPDF(from, PDFS.cajas_sushi_carnes.url, PDFS.cajas_sushi_carnes.nombre); await sendMessage(from, MSG_ASESOR); userState[from] = { step: "inicio", intentos: 0 }; }
    else if (num === "5") { await sendMessage(from, `Este es nuestro catálogo de CAJAS PARA LA INDUSTRIA ALIMENTARIA, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu medida!* 📦`); await sendPDF(from, PDFS.cajas_industria_alimentaria.url, PDFS.cajas_industria_alimentaria.nombre); await sendMessage(from, MSG_ASESOR); userState[from] = { step: "inicio", intentos: 0 }; }
    else if (num === "6") { await sendMessage(from, MENU_CATEGORIAS); userState[from] = { step: "menu_categorias", intentos: 0 }; }
    else { await manejarError(from, "menu_alimentos", MENU_ALIMENTOS); }
    return;
  }

  if (state.step === "menu_ropa") {
    if (num === "1") { await sendMessage(from, `Este es nuestro catálogo de BOLSAS PARA ROPA Y ZAPATOS, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu medida!* 👟`); await sendPDF(from, PDFS.bolsas_ropa_zapatos.url, PDFS.bolsas_ropa_zapatos.nombre); await sendMessage(from, MSG_ASESOR); userState[from] = { step: "inicio", intentos: 0 }; }
    else if (num === "2") { await sendMessage(from, `Este es nuestro catálogo de CAJAS PARA ROPA Y ZAPATOS, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu medida!* 👟`); await sendPDF(from, PDFS.cajas_ropa_zapatos.url, PDFS.cajas_ropa_zapatos.nombre); await sendMessage(from, MSG_ASESOR); userState[from] = { step: "inicio", intentos: 0 }; }
    else if (num === "3") { await sendMessage(from, MENU_CATEGORIAS); userState[from] = { step: "menu_categorias", intentos: 0 }; }
    else { await manejarError(from, "menu_ropa", MENU_ROPA); }
    return;
  }

  if (state.step === "menu_joyeria") {
    if (num === "1") { await sendMessage(from, `Este es nuestro catálogo de BOLSAS PARA JOYERÍA Y ACCESORIOS, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu medida!* 💍`); await sendPDF(from, PDFS.bolsas_joyeria.url, PDFS.bolsas_joyeria.nombre); await sendMessage(from, MSG_ASESOR); userState[from] = { step: "inicio", intentos: 0 }; }
    else if (num === "2") { await sendMessage(from, `Este es nuestro catálogo de CAJAS PARA JOYERÍA Y ACCESORIOS, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu medida!* 💍`); await sendPDF(from, PDFS.cajas_joyeria.url, PDFS.cajas_joyeria.nombre); await sendMessage(from, MSG_ASESOR); userState[from] = { step: "inicio", intentos: 0 }; }
    else if (num === "3") { await sendMessage(from, MENU_CATEGORIAS); userState[from] = { step: "menu_categorias", intentos: 0 }; }
    else { await manejarError(from, "menu_joyeria", MENU_JOYERIA); }
    return;
  }

  if (state.step === "menu_boutique") {
    if (num === "1") { await sendMessage(from, `Este es nuestro catálogo de BOLSAS PARA BOUTIQUE Y MAQUILLAJE, si no encuentras el que necesitas, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu gusto y medida!* 💄`); await sendPDF(from, PDFS.bolsas_boutique.url, PDFS.bolsas_boutique.nombre); await sendMessage(from, MSG_ASESOR); userState[from] = { step: "inicio", intentos: 0 }; }
    else if (num === "2") { await sendMessage(from, `Este es nuestro catálogo de CAJAS PARA BOUTIQUE Y MAQUILLAJE, si no encuentras el que necesitas, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu gusto y medida!* 💄`); await sendPDF(from, PDFS.cajas_boutique.url, PDFS.cajas_boutique.nombre); await sendMessage(from, MSG_ASESOR); userState[from] = { step: "inicio", intentos: 0 }; }
    else if (num === "3") { await sendMessage(from, MENU_CATEGORIAS); userState[from] = { step: "menu_categorias", intentos: 0 }; }
    else { await manejarError(from, "menu_boutique", MENU_BOUTIQUE); }
    return;
  }

  if (state.step === "menu_industria") {
    if (num === "1") { await sendMessage(from, `Este es nuestro catálogo de BOLSAS PARA LA INDUSTRIA, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu medida!* 🏭`); await sendPDF(from, PDFS.bolsas_industria.url, PDFS.bolsas_industria.nombre); await sendMessage(from, MSG_ASESOR); userState[from] = { step: "inicio", intentos: 0 }; }
    else if (num === "2") { await sendMessage(from, `Este es nuestro catálogo de CAJAS PARA LA INDUSTRIA, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, lo *diseñamos a tu medida!* 🏭`); await sendPDF(from, PDFS.cajas_industria.url, PDFS.cajas_industria.nombre); await sendMessage(from, MSG_ASESOR); userState[from] = { step: "inicio", intentos: 0 }; }
    else if (num === "3") { await sendMessage(from, MENU_CATEGORIAS); userState[from] = { step: "menu_categorias", intentos: 0 }; }
    else { await manejarError(from, "menu_industria", MENU_INDUSTRIA); }
    return;
  }

  if (state.step === "menu_genericos") {
    if (num === "1") { await sendMessage(from, `Este es nuestro catálogo de BOLSAS PARA DOMICILIOS, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, podríamos fabricarla pero *a partir de 200 unidades, recuerda! a mayor cantidad más económico el valor unitario!*`); await sendPDF(from, PDFS.bolsas_sin_marca.url, PDFS.bolsas_sin_marca.nombre); await sendMessage(from, MSG_ASESOR); userState[from] = { step: "inicio", intentos: 0 }; }
    else if (num === "2") { await sendMessage(from, `Este es nuestro catálogo de CAJAS PARA COMIDAS RÁPIDAS, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, podríamos fabricarla pero *a partir de 200 unidades, a mayor cantidad más económico el valor unitario!*`); await sendPDF(from, PDFS.cajas_comida_generica.url, PDFS.cajas_comida_generica.nombre); await sendMessage(from, MSG_ASESOR); userState[from] = { step: "inicio", intentos: 0 }; }
    else if (num === "3") { await sendMessage(from, `Este es nuestro catálogo de CAJAS PARA ACCESORIOS Y OTROS, si no encuentras una apropiada, *¡NO HAY PROBLEMA!*, podríamos fabricarla pero *a partir de 200 unidades a mayor cantidad más económico, el valor unitario!*`); await sendPDF(from, PDFS.cajas_accesorios_otros.url, PDFS.cajas_accesorios_otros.nombre); await sendMessage(from, MSG_ASESOR); userState[from] = { step: "inicio", intentos: 0 }; }
    else if (num === "4") { await sendMessage(from, MENU_LINEAS); userState[from] = { step: "menu_lineas", intentos: 0 }; }
    else { await manejarError(from, "menu_genericos", MENU_GENERICOS); }
    return;
  }

  if (state.step === "menu_impresos") {
    if (num === "1") { await sendMessage(from, `En unos minutos uno de nuestros asesores te atenderá!! 😊`); await sendMessage(from, MSG_ASESOR); userState[from] = { step: "inicio", intentos: 0 }; }
    else if (num === "2") { await sendMessage(from, MSG_OTRO_SERVICIO); await sendMessage(from, MENU_LINEAS); userState[from] = { step: "menu_lineas", intentos: 0 }; }
    else { await manejarError(from, "menu_impresos", MENU_IMPRESOS); }
    return;
  }

  if (state.step === "menu_publicidad") {
    if (num === "1") { await sendMessage(from, MENU_PUBLICIDAD_SI); userState[from] = { step: "menu_publicidad_si", intentos: 0 }; }
    else if (num === "2") { await sendMessage(from, MSG_OTRO_SERVICIO); await sendMessage(from, MENU_LINEAS); userState[from] = { step: "menu_lineas", intentos: 0 }; }
    else { await manejarError(from, "menu_publicidad", MENU_PUBLICIDAD); }
    return;
  }

  if (state.step === "menu_publicidad_si") {
    if (["1","2","3","4","5"].includes(num)) { await sendMessage(from, `En unos minutos uno de nuestros asesores te atenderá!! 😊`); await sendMessage(from, MSG_ASESOR); userState[from] = { step: "inicio", intentos: 0 }; }
    else { await manejarError(from, "menu_publicidad_si", MENU_PUBLICIDAD_SI); }
    return;
  }

  if (state.step === "menu_promocionales") {
    if (num === "1") { await sendMessage(from, `En unos minutos uno de nuestros asesores te atenderá!! 😊`); await sendMessage(from, MSG_ASESOR); userState[from] = { step: "inicio", intentos: 0 }; }
    else if (num === "2") { await sendMessage(from, MSG_OTRO_SERVICIO); await sendMessage(from, MENU_LINEAS); userState[from] = { step: "menu_lineas", intentos: 0 }; }
    else { await manejarError(from, "menu_promocionales", MENU_PROMOCIONALES); }
    return;
  }

  await sendMessage(from, MENU_PRINCIPAL);
  userState[from] = { step: "menu_principal", intentos: 0 };
}

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
