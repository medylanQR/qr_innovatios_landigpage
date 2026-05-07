export async function onRequestPost(context) {
  try {
    // 1. Recibimos los datos del cliente desde el frontend
    const data = await context.request.json();
    
    // 2. Traemos las credenciales que guardaste en Cloudflare
    const apiKey = context.env.RESEND_API_KEY;
    const correoDestino = context.env.CORREO_AGENCIA;

    // 3. Diseñamos el correo corporativo en HTML
    const htmlCorreo = `
      <div style="font-family: system-ui, -apple-system, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #d11f8a; margin-bottom: 5px; font-weight: 900; text-transform: uppercase; font-style: italic;">🚨 Nuevo Despliegue Solicitado</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 0; font-weight: bold; letter-spacing: 1px;">QR INNOVATIONS INFRASTRUCTURE</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
            <p style="margin: 10px 0;"><strong>👤 Cliente:</strong> ${data.nombre || 'No registrado'}</p>
            <p style="margin: 10px 0;"><strong>✉️ Correo:</strong> ${data.correo || 'No registrado'}</p>
            <p style="margin: 10px 0;"><strong>🏢 Empresa / Tel:</strong> ${data.empresa || 'No registrado'}</p>
            <p style="margin: 10px 0;"><strong>📦 Plan Elegido:</strong> <span style="text-transform: uppercase; background-color: #673de6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${data.plan || 'N/A'}</span></p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="font-size: 12px; color: #94a3b8;">Por favor, verificar el panel de Tilopay para confirmar la liquidación de fondos e iniciar el despliegue del servidor asignado.</p>
      </div>
    `;

    // 4. Disparamos el correo a través de la API de Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'QR Bot <onboarding@resend.dev>', // Dominio seguro de prueba de Resend
        to: [correoDestino],
        subject: `💰 Nueva Venta QR - Plan ${data.plan ? data.plan.toUpperCase() : ''}`,
        html: htmlCorreo
      })
    });

    if (!response.ok) {
       const errorRes = await response.json();
       console.error("Error devuelto por Resend:", errorRes);
       throw new Error("Error procesando el envío con Resend");
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error("Fallo crítico en notificar.js:", error);
    return new Response(JSON.stringify({ error: "Fallo interno enviando correo" }), { status: 500 });
  }
}