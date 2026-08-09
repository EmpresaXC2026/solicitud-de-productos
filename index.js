const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");

// Los valores reales se configuran con:
//   firebase functions:secrets:set TELEGRAM_BOT_TOKEN
//   firebase functions:secrets:set TELEGRAM_CHAT_ID
// (nunca se escriben aquí en el código)
const TELEGRAM_BOT_TOKEN = defineSecret("TELEGRAM_BOT_TOKEN");
const TELEGRAM_CHAT_ID = defineSecret("TELEGRAM_CHAT_ID");

function construirMensaje(data) {
  const lineas = [
    "📋 *NUEVA SOLICITUD DE PRODUCTOS*",
    "",
    "*Datos personales*",
    `Nombre: ${data.nombreCompleto || "-"}`,
    `Fecha de nacimiento: ${data.fechaNacimiento || "-"}`,
    `DPI: ${data.dpi || "-"}`,
    `NIT: ${data.nit || "-"}`,
    `Teléfono: ${data.telefono || "-"} (${data.compania || "-"})`,
    `Correo: ${data.correo || "-"}`,
    `Nivel académico: ${data.nivelAcademico || "-"}`,
    `Dirección domicilio: ${data.direccionDomicilio || "-"}`,
    `Dirección entrega: ${data.direccionEntrega || "-"}`,
    `Departamento: ${data.departamento || "-"}`,
    `Municipio: ${data.municipio || "-"}`,
    "",
    "*Área laboral*",
    `Ingreso mensual: Q${data.ingresoMensual || "-"}`,
    `Egreso mensual: Q${data.egresoMensual || "-"}`,
    `Empresa: ${data.nombreEmpresa || "-"}`,
    `Año inicio de labores: ${data.anioInicioLabores || "-"}`,
    `Puesto: ${data.puesto || "-"}`,
    `Teléfono empresa: ${data.telefonoEmpresa || "-"}`,
    `Profesión u oficio: ${data.profesionOficio || "-"}`,
    `Referencia 1: ${data.referencia1Nombre || "-"} - ${data.referencia1Telefono || "-"}`,
    `Referencia 2: ${data.referencia2Nombre || "-"} - ${data.referencia2Telefono || "-"}`,
    "",
    "*Beneficiario*",
    `Nombre: ${data.beneficiarioNombre || "-"}`,
    `Teléfono: ${data.beneficiarioTelefono || "-"}`,
    `Fecha de nacimiento: ${data.beneficiarioFechaNacimiento || "-"}`,
    `Parentesco: ${data.beneficiarioParentesco || "-"}`
  ];

  if (data.dpiFrenteUrl) lineas.push("", `Foto DPI frente: ${data.dpiFrenteUrl}`);
  if (data.dpiVersoUrl) lineas.push(`Foto DPI verso: ${data.dpiVersoUrl}`);

  return lineas.join("\n");
}

exports.notificarNuevaSolicitud = onDocumentCreated(
  {
    document: "usuarios/{docId}",
    secrets: [TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID],
    region: "us-central1"
  },
  async (event) => {
    const snap = event.data;
    if (!snap) {
      logger.warn("Evento sin datos, se omite.");
      return;
    }
    const data = snap.data();
    const mensaje = construirMensaje(data);

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN.value()}/sendMessage`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID.value(),
          text: mensaje,
          parse_mode: "Markdown"
        })
      });

      const result = await res.json();

      if (!res.ok || !result.ok) {
        logger.error("Error al enviar Telegram:", result);
      } else {
        logger.info("Telegram enviado correctamente:", result);
      }
    } catch (err) {
      logger.error("Excepción al enviar Telegram:", err);
    }
  }
);
