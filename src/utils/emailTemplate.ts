// utils/emailTemplate.ts

interface EmailData {
  nombre_completo: string;
  // Permitimos null en la interfaz
  fecha_entrada?: string;
  hora_entrada?: string;
  fecha_salida?: string;
  hora_salida?: string;
  coche: string;
  matricula: string;
  precio: number;
  num_reserva: number;
}

export const getBookingEmailHtml = (data: EmailData): string => {
  // --- LÓGICA DE VISUALIZACIÓN ---
  // Preparamos los textos antes de inyectarlos en el HTML para mantenerlo limpio
  
  const entradaDisplay = `${data.fecha_entrada || "Sin fecha"} ${data.hora_entrada || ""}`;

  const salidaDisplay = `${data.fecha_salida || "Sin fecha"} ${data.hora_salida || ""}`;

  // -------------------------------

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
        
        /* CABECERA NARANJA ESTILO LOGIN */
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
            background-color: #f9f9f9; 
            border: 1px solid #eeeeee; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 30px 0; 
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

        /* BOTÓN NARANJA */
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
        .footer-links {
            margin-bottom: 15px;
        }
        .footer-links span {
            color: #ff6600;
            font-weight: bold;
            margin: 0 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        
        <div class="header">
          <h1>ALC Valet Parking</h1>
          <p>Tu vehículo en las mejores manos</p>
        </div>
        
        <div class="content">
          <h2>Reserva Confirmada</h2>
          <p>Hola <strong>${data.nombre_completo}</strong>,</p>
          <p>Hemos recibido correctamente tu reserva. A continuación encontrarás el resumen de los detalles.</p>
          
          <div class="details-box">
            <div class="detail-row">
              <span class="label">Fecha Entrada: </span>
              <span class="value">${entradaDisplay}</span>
            </div>
            <div class="detail-row">
              <span class="label">Fecha Salida: </span>
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
              <span class="label">Precio Total: </span>
              <span class="value" style="color: #ff6600;">${data.precio} €</span>
            </div>
          </div>

          <p>📎 Hemos adjuntado tu <strong>ticket oficial en PDF</strong> a este correo. Es recomendable tenerlo a mano al llegar al aeropuerto.</p>

          <div class="btn-container">
            <a href="https://www.alcvaletparking.com" class="btn">Ir a la Web</a>
          </div>
        </div>

        <div class="footer">
          <div class="footer-links">
             <span>Contacto</span> • <span>Ayuda</span> • <span>Términos</span>
          </div>
          <p>© ${new Date().getFullYear()} ALC Valet Parking. Todos los derechos reservados.</p>
          <p>Ctra. Aeropuerto-Torrellano s/n CV-852, 03320 Torrellano</p>
        </div>
      </div>
    </body>
    </html>
  `;
};