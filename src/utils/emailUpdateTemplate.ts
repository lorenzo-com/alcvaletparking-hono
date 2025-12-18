// utils/emailUpdateTemplate.ts

interface EmailData {
  nombre_completo: string;
  fecha_entrada?: string;
  hora_entrada?: string;
  fecha_salida?: string;
  hora_salida?: string;
  coche: string;
  matricula: string;
  precio: number;
  num_reserva: number;
}

// --- Función para formatear fechas ---
const formatearFecha = (fechaStr: string | undefined) => {
  if (!fechaStr) return 'Sin fecha';
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString('es-ES');
};

export const getBookingUpdateEmailHtml = (data: EmailData): string => {
  
  const entradaDisplay = `${formatearFecha(data.fecha_entrada)} ${data.hora_entrada || ""}`;
  const salidaDisplay = `${formatearFecha(data.fecha_salida)} ${data.hora_salida || ""}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            background-color: #f6f9fc; 
            margin: 0;
            padding: 40px 20px; 
            color: #333333;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            border-radius: 8px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.05); 
        }
        
        /* CABECERA NARANJA */
        .header { 
            background-color: #ff6600; 
            color: #ffffff; 
            padding: 40px 20px; 
            text-align: center; 
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }

        .content { 
            padding: 40px; 
            line-height: 1.6; 
        }
        .content h2 {
            color: #1a1a1a;
            margin-top: 0;
        }

        /* CAJA DE DETALLES */
        .details-box { 
            background-color: #fff8f2; /* Un fondo ligeramente naranja muy suave para diferenciar */
            border: 1px solid #ffe0b2; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 30px 0; 
        }
        .detail-row { 
            display: flex; 
            justify-content: space-between; 
            border-bottom: 1px solid #ffe0b2; 
            padding: 12px 0; 
        }
        .detail-row:last-child { 
            border-bottom: none; 
        }
        .label { 
            font-weight: 600; 
            color: #666666; 
        }
        .value { 
            font-weight: bold; 
            color: #000000; 
            text-align: right;
        }

        /* BOTÓN */
        .btn-container {
            text-align: center;
            margin-top: 30px;
        }
        .btn { 
            display: inline-block; 
            background-color: #ff6600; 
            color: #ffffff !important; 
            padding: 14px 30px; 
            text-decoration: none; 
            border-radius: 50px; 
            font-weight: bold; 
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(255, 102, 0, 0.2);
        }
        .btn:hover {
            background-color: #e65c00;
        }

        /* FOOTER */
        .footer { 
            background-color: #f6f9fc; 
            padding: 30px; 
            text-align: center; 
            font-size: 12px; 
            color: #8898aa; 
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        
        <div class="header">
          <h1>ALC Valet Parking</h1>
          <p>Actualización de Reserva</p>
        </div>
        
        <div class="content">
          <h2>Reserva Modificada</h2>
          <p>Hola <strong>${data.nombre_completo}</strong>,</p>
          <p>Te confirmamos que los datos de tu reserva <strong>#${data.num_reserva}</strong> han sido actualizados correctamente.</p>
          <p>Estos son los detalles vigentes de tu reserva:</p>
          
          <div class="details-box">
            <div class="detail-row">
              <span class="label">Nueva Fecha Entrada: </span>
              <span class="value">${entradaDisplay}</span>
            </div>
            <div class="detail-row">
              <span class="label">Nueva Fecha Salida: </span>
              <span class="value">${salidaDisplay}</span>
            </div>
            <div class="detail-row">
              <span class="label">Vehículo: </span>
              <span class="value">${data.coche}</span>
            </div>
             <div class="detail-row">
              <span class="label">Matrícula: </span>
              <span class="value">${data.matricula}</span>
            </div>
            <div class="detail-row">
              <span class="label">Precio Actualizado: </span>
              <span class="value" style="color: #ff6600;">${data.precio}€</span>
            </div>
          </div>

          <p>📎 Hemos adjuntado el <strong>ticket actualizado</strong> en PDF a este correo. Por favor, desecha el anterior.</p>

          <div class="btn-container">
            <a href="https://www.alcvaletparking.com" class="btn">Ir a la Web</a>
          </div>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} ALC Valet Parking. Todos los derechos reservados.</p>
          <p>Ctra. Aeropuerto-Torrellano s/n CV-852, 03320 Torrellano</p>
        </div>
      </div>
    </body>
    </html>
  `;
};