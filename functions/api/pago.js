export async function onRequestPost(context) {
  try {
    // 1. Recibimos la información del modal
    const requestData = await context.request.json();
    const { plan, nombre, correo, empresa } = requestData;
    
    // El precio base en dólares
    const montoUSD = plan === 'starter' ? 200.00 : 350.00;
    const apiuser = context.env.TILOPAY_USUARIO_API;
    const password = context.env.TILOPAY_PASSWORD_API;
    const apikey = context.env.TILOPAY_LLAVE_API;

    // ==========================================
    // PASO 1: LOGIN (Obtener el Token)
    // ==========================================
    const respuestaLogin = await fetch("https://app.tilopay.com/api/v1/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiuser: apiuser, password: password })
    });

    if (!respuestaLogin.ok) throw new Error("Fallo al autenticar credenciales con Tilopay");
    
    const dataLogin = await respuestaLogin.json();
    const token = dataLogin.access_token;

    // ==========================================
    // PASO 2: CONVERSIÓN DE DIVISAS (USD a CRC)
    // ==========================================
    // Consumimos una API rápida y gratuita para saber a cómo está el dólar hoy
    const respuestaDivisas = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    const dataDivisas = await respuestaDivisas.json();
    const tipoDeCambio = dataDivisas.rates.CRC; 
    
    // Multiplicamos los dólares por el tipo de cambio y redondeamos para que no queden decimales raros
    const montoColones = Math.round(montoUSD * tipoDeCambio);

    // ==========================================
    // PASO 3: FORMATEAR DATOS OBLIGATORIOS
    // ==========================================
    const partesNombre = nombre.trim().split(" ");
    const firstName = partesNombre[0] || "Cliente";
    const lastName = partesNombre.length > 1 ? partesNombre.slice(1).join(" ") : "QR";
    
    const telefonoNumeros = empresa.replace(/[^0-9]/g, '');
    const telefonoFinal = telefonoNumeros.length > 4 ? telefonoNumeros : "88888888";

    // ==========================================
    // PASO 4: SOLICITAR EL LINK DE PAGO EN COLONES
    // ==========================================
    const payloadPago = {
      redirect: "https://qrinnovationss.com",
      key: apikey,
      amount: montoColones.toString(), // Mandamos el monto convertido
      currency: "CRC", // Cambiamos de USD a CRC
      billToFirstName: firstName,
      billToLastName: lastName,
      billToAddress: "San Jose",
      billToAddress2: empresa.substring(0, 30),
      billToCity: "San Jose",
      billToState: "SJ",
      billToZipPostCode: "10101",
      billToCountry: "CR",
      billToTelephone: telefonoFinal,
      billToEmail: correo,
      orderNumber: "QR" + Date.now(),
      capture: "1",
      subscription: "0",
      platform: "api"
    };

    const respuestaPago = await fetch("https://app.tilopay.com/api/v1/processPayment", {
      method: "POST",
      headers: {
        "Authorization": `bearer ${token}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payloadPago)
    });

    const dataPago = await respuestaPago.json();

    // ==========================================
    // PASO 5: DEVOLVER EL LINK AL HTML
    // ==========================================
    if (dataPago && dataPago.url) {
      return new Response(JSON.stringify({ url: dataPago.url }), {
        headers: { "Content-Type": "application/json" },
        status: 200
      });
    } else {
      throw new Error("Tilopay no generó el URL de cobro");
    }

  } catch (error) {
    console.error("Error en el backend:", error);
    return new Response(JSON.stringify({ error: "Fallo procesando el pago" }), { 
      headers: { "Content-Type": "application/json" },
      status: 500 
    });
  }
}