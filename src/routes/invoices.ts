import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { generateInvoicePDF } from '../utils/emailService';
import { Buffer } from 'node:buffer';
import { Bindings } from '../types';

const invoices = new Hono<{ Bindings: Bindings }>();

// GET /invoices/check/:reservaId
// Comprueba si existe factura y devuelve los datos para imprimir
invoices.get('/check/:reservaId', async (c) => {
    const reservaId = c.req.param('reservaId');
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);

    // 1. Buscar la factura
    const { data: factura, error } = await supabase
        .from('facturas')
        .select('*')
        .eq('reserva_id', reservaId)
        .maybeSingle(); // maybeSingle no lanza error si es null

    if (error) return c.json({ success: false, message: error.message }, 500);

    // Si NO existe factura, avisamos al frontend para que pida método de pago
    if (!factura) {
        return c.json({ success: false, exists: false }, 200);
    }

    // Si existe, buscamos los datos de la reserva para completar el PDF
    const { data: reserva } = await supabase
        .from('reservas')
        .select('*')
        .eq('id', reservaId)
        .single();

    // Devolvemos todo combinado
    return c.json({
        success: true,
        exists: true,
        data: { ...reserva, ...factura } // Mezclamos reserva y factura (num_factura, metodo_pago)
    });
});

// POST /generate
// Genera y descarga el PDF. Crea la factura si no existe.
invoices.post('/generate', async (c) => {
    const body = await c.req.json();
    const { reservaId, metodoPago } = body; // metodoPago es opcional si la factura ya existe
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);

    let facturaData;

    // 1. Buscamos si ya existe la factura
    const { data: existingFactura } = await supabase
        .from('facturas')
        .select('*')
        .eq('reserva_id', reservaId)
        .maybeSingle();

    if (existingFactura) {
        // YA EXISTE: Usamos sus datos
        facturaData = existingFactura;
    } else {
        // NO EXISTE: Creamos una nueva
        if (!metodoPago) {
            return c.json({ success: false, message: 'Falta método de pago' }, 400);
        }

        // a) Obtener secuencia
        const { data: secData } = await supabase.from('factura_secuencia').select('siguiente_numero').single();
        if (!secData) return c.json({ success: false, message: 'Error secuencia' }, 500);
        
        const nextNum = secData.siguiente_numero;

        // b) Crear factura
        const { data: newFactura, error: insError } = await supabase
            .from('facturas')
            .insert({
                reserva_id: reservaId,
                num_factura: nextNum,
                metodo_pago: metodoPago
            })
            .select()
            .single();

        if (insError) return c.json({ success: false, message: insError.message }, 500);

        // c) Actualizar secuencia (+1)
        await supabase.from('factura_secuencia').update({ siguiente_numero: nextNum + 1 }).gt('siguiente_numero', 0);

        facturaData = newFactura;

        // --- ENVIAR CORREO AL ADMINISTRADOR CON EL PDF ---
        // Obtenemos datos de la reserva para el correo
        const { data: reservaData } = await supabase
            .from('reservas')
            .select('*')
            .eq('id', reservaId)
            .single();

        try {
            const pdfDataForEmail = {
                ...reservaData,
                num_factura: nextNum,
                metodo_pago: metodoPago,
                forma_pago: metodoPago
            };
            const pdfBytes = generateInvoicePDF(pdfDataForEmail);
            const pdfBuffer = Buffer.from(pdfBytes);

            const resend = new Resend(c.env.RESEND_API_KEY);
            await resend.emails.send({
                from: 'ALC Valet Parking <reservas@alcvaletparking.com>',
                to: 'info@alcvaletparking.com',
                subject: `Nueva Factura Generada - Factura Nº ${nextNum}`,
                html: `<p>Se ha generado una nueva factura:</p>
                       <ul>
                         <li><strong>Nº Factura:</strong> ${nextNum}</li>
                         <li><strong>Cliente:</strong> ${reservaData?.nombre_completo || 'No disponible'}</li>
                         <li><strong>Importe:</strong> ${reservaData?.precio || '0'} €</li>
                         <li><strong>Método de pago:</strong> ${metodoPago}</li>
                       </ul>
                       <p>Adjunto encontrará el PDF de la factura.</p>`,
                attachments: [
                    {
                        filename: `Factura_${nextNum}.pdf`,
                        content: pdfBuffer
                    }
                ]
            });
        } catch (emailErr) {
            console.error('Error enviando correo de factura:', emailErr);
        }
    }

    // 2. Obtenemos datos completos de la reserva
    const { data: reserva } = await supabase
        .from('reservas')
        .select('*')
        .eq('id', reservaId)
        .single();

    if (!reserva) return c.json({ success: false, message: 'Reserva no encontrada' }, 404);

    // 3. Preparamos datos combinados para el PDF
    const pdfData = {
        ...reserva,
        num_factura: facturaData.num_factura,
        metodo_pago: facturaData.metodo_pago, // Usamos el de la factura, no el de la reserva
        forma_pago: facturaData.metodo_pago   // Por si tu template usa este nombre
    };

    // 4. Generamos el PDF en el Backend
    try {
        const pdfBytes = generateInvoicePDF(pdfData);
        const pdfArrayBuffer = pdfBytes.buffer as ArrayBuffer;

        // 5. Devolvemos el archivo binario
        return c.body(pdfArrayBuffer, 200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Factura_${facturaData.num_factura}.pdf"`
        });
    } catch (e) {
        console.error(e);
        return c.json({ success: false, message: 'Error generando PDF' }, 500);
    }
});

// GET /api/invoices/sequence -> Consultar el siguiente número
invoices.get('/sequence', async (c) => {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
    
    // Asumimos que tu tabla tiene id=TRUE como vimos en la imagen
    const { data, error } = await supabase
        .from('factura_secuencia')
        .select('siguiente_numero')
        .single();

    if (error) return c.json({ success: false, message: error.message }, 500);
    
    return c.json({ success: true, numero: data.siguiente_numero });
});

// PUT /api/invoices/sequence -> Modificar manualmente
invoices.put('/sequence', async (c) => {
    const body = await c.req.json();
    const { nuevoNumero } = body;
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);

    // Validación básica de seguridad
    if (!nuevoNumero || typeof nuevoNumero !== 'number') {
        return c.json({ success: false, message: 'Número inválido' }, 400);
    }

    const { error } = await supabase
        .from('factura_secuencia')
        .update({ siguiente_numero: nuevoNumero })
        // Usamos el filtro gt(0) como truco para actualizar la única fila existente
        // O si prefieres ser estricto: .eq('id', true) según tu captura de pantalla
        .gt('siguiente_numero', 0); 

    if (error) return c.json({ success: false, message: error.message }, 500);

    return c.json({ success: true, message: 'Secuencia actualizada correctamente' });
});

export { invoices };