// utils/emailTemplate.ts

interface EmailData {
  nombre_completo: string;
  // Permitimos null en la interfaz
  fecha_entrada?: string;
  hora_entrada?: string;
  fecha_salida?: string;
  hora_salida?: string;
  precio: number;
  num_reserva: number;
  comentarios: string | null;
  coche: string;
  matricula: string;
}

// --- Función para formatear fechas a dd/mm/yyyy ---
	const formatearFecha = (fechaStr: string | undefined) => {
		if(!fechaStr) return 'Sin fecha';
		// Truco: Si la fecha viene como "2025-12-17", creamos el objeto fecha
		// y lo pasamos a local 'es-ES' (España)
		const fecha = new Date(fechaStr);
		return fecha.toLocaleDateString('es-ES');
	};

export const getBookingEmailHtml = (data: EmailData): string => {
  // --- LÓGICA DE VISUALIZACIÓN ---
  // Preparamos los textos antes de inyectarlos en el HTML para mantenerlo limpio
  
  const entradaDisplay = `${formatearFecha(data.fecha_entrada)} ${data.hora_entrada || ""}`;

  const salidaDisplay = `${formatearFecha(data.fecha_salida)} ${data.hora_salida || ""}`;

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

        /* TEXTO INFORMATIVO MULTI-IDIOMA */
        .info-block {
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eeeeee;
        }
        .info-block:last-child {
            border-bottom: none;
        }
        .info-title {
            font-weight: bold;
            color: #ff6600;
            display: block;
            margin-bottom: 5px;
            text-transform: uppercase;
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
          <p>Hola <strong>${data.nombre_completo}</strong>,</p>

          <div class="info-block">
            <span class="info-title">CONFIRMACIÓN DE RESERVA</span>
            <p style="margin: 5px 0;">Muchas gracias por elegir los servicios de ALC VALET PARKING.</p>
            <p style="margin: 5px 0;"><strong>PUNTO DE ENCUENTRO AEROPUERTO:</strong> PLANTA DE SALIDAS/ EN EL PRINCIPIO DEL PARKING EXPRESS.</p>
            <p style="margin: 5px 0;"><strong>MÓVIL:</strong> 601 356 356 (NO POR VÍA WHATSAPP)</p>
            <p style="margin: 5px 0;">LLAME CON EL NÚMERO DE CONTACTO CON *15 O 20 MINUTOS DE ANTELACIÓN.</p>
          </div>

          <div class="info-block">
            <span class="info-title">BOOKING CONFIRMATION</span>
            <p style="margin: 5px 0;">Thank you very much for choosing the services of ALC VALET PARKING.</p>
            <p style="margin: 5px 0;"><strong>AIRPORT MEETING POINT:</strong> DEPARTURES FLOOR/ AT THE BEGINNING OF THE EXPRESS PARKING.</p>
            <p style="margin: 5px 0;"><strong>MOBILE:</strong> 601 356 356 (NOT VIA WHATSAPP)</p>
            <p style="margin: 5px 0;">CALL WITH THE CONTACT NUMBER WITH *15 OR 20 MINUTES IN ADVANCE.</p>
          </div>

          <div class="info-block">
             <span class="info-title">BOEKINGSBEVESTIGING</span>
             <p style="margin: 5px 0;">Hartelijk dank dat u voor de diensten van ALC VALET PARKING hebt gekozen.</p>
             <p style="margin: 5px 0;"><strong>VERZAMELPUNT OP DE LUCHTHAVEN:</strong> VERTREKVERDIEPING/ AAN HET BEGIN VAN DE EXPRESS PARKING.</p>
             <p style="margin: 5px 0;"><strong>MOBIEL:</strong> 601 356 356 (NIET VIA WHATSAPP)</p>
             <p style="margin: 5px 0;">BEL HET CONTACTNUMMER 15 OF 20 MINUTEN VAN TEVOREN.</p>
          </div>
          
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
              <span class="label">Precio Total: </span>
              <span class="value">${data.precio}€</span>
            </div>
            <div class="detail-row">
              <span class="label">Comentarios: </span>
              <span class="value">${data.comentarios ?? 'Sin comentarios'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Vehículo: </span>
              <span class="value">${data.coche} (${data.matricula})</span>
            </div>
          </div>

          <p>📎 Hemos adjuntado tu <strong>recibo en PDF</strong> a este correo.</p>

          <div class="btn-container">
            <a href="google.com/maps/place/Salidas+de+estacionamiento+exprés,+Aeropuerto+de+Alicante,+Alacant,+03195+L'Altet,+Alicante/@38.2875214,-0.5530595,3a,75y,292.99h,57.8t/data=!3m5!1e1!3m3!1sgoh4-bPzQJ5LkcAnLN7gig!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fpanoid%3Dgoh4-bPzQJ5LkcAnLN7gig%26w%3D900%26h%3D600%26ll%3D0.0,0.0%26yaw%3D292.0%26pitch%3D33.0%26thumbfov%3D98%26cb_client%3Dgmm.iv.android!4m2!3m1!1s0xd624b805ad3cc5d:0x800152e1058275e6?utm_source=mstt_0&g_ep=CAESBzI2LjMuMTEYACCBgQEqiAEsOTQyNjc3MjcsOTQyNzU0MDcsOTQyOTIxOTUsOTQyOTk1MzIsOTQyODQ0OTAsOTQyODA1NzYsOTQyMDczOTQsOTQyMDc1MDYsOTQyMDg1MDYsOTQyMTg2NTMsOTQyMjk4MzksOTQyNzUxNjgsOTQyNzk2MTksOTQyNjI3MzksMTAwNzk2MTg2QgJFUw%3D%3D&skid=db347f0e-c769-4577-8015-c0522b65c1d7&g_st=awb" class="btn">👉 Punto de encuentro</a>
          </div>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} ALC Valet Parking. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};