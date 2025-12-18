// utils/emailCancellationTemplate.ts

interface EmailData {
  nombre_completo: string;
  num_reserva: number;
  fecha_entrada?: string;
  fecha_salida?: string;
  coche: string;
  matricula: string;
}

// --- Función para formatear fechas ---
const formatearFecha = (fechaStr: string | undefined) => {
  if (!fechaStr) return '---';
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString('es-ES');
};

export const getBookingCancellationEmailHtml = (data: EmailData): string => {
  
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
        
        /* CABECERA (Gris oscuro o Rojo suave para diferenciar cancelación) */
        .header { 
            background-color: #333333; 
            color: #ffffff; 
            padding: 40px 20px; 
            text-align: center; 
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        
        .content { 
            padding: 40px; 
            line-height: 1.6; 
        }
        .content h2 {
            color: #d32f2f; /* Rojo para destacar la cancelación */
            margin-top: 0;
        }

        /* CAJA DE DETALLES */
        .details-box { 
            background-color: #f9f9f9; 
            border: 1px solid #eeeeee; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 30px 0; 
            opacity: 0.7; /* Un poco más apagado para indicar "pasado" */
        }
        .detail-row { 
            display: flex; 
            justify-content: space-between; 
            border-bottom: 1px solid #eeeeee; 
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
        </div>
        
        <div class="content">
          <h2>Reserva Cancelada</h2>
          <p>Hola <strong>${data.nombre_completo}</strong>,</p>
          <p>Te confirmamos que tu reserva ha sido <strong>cancelada correctamente</strong> tal y como has solicitado.</p>
          
          <div class="details-box">
            <div class="detail-row">
              <span class="label">Nº Reserva: </span>
              <span class="value">#${data.num_reserva}</span>
            </div>
            <div class="detail-row">
              <span class="label">Fechas Previstas: </span>
              <span class="value">${formatearFecha(data.fecha_entrada)} - ${formatearFecha(data.fecha_salida)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Vehículo: </span>
              <span class="value">${data.coche} (${data.matricula})</span>
            </div>
          </div>

          <p>Esperamos volver a verte pronto en tu próximo viaje.</p>

          <div class="btn-container">
            <a href="https://www.alcvaletparking.com" class="btn">Hacer Nueva Reserva</a>
          </div>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} ALC Valet Parking.</p>
          <p>Ctra. Aeropuerto-Torrellano s/n CV-852, 03320 Torrellano</p>
        </div>
      </div>
    </body>
    </html>
  `;
};