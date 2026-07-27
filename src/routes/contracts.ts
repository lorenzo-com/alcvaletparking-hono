import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { Bindings } from '../types';
import { generateContractPDF } from '../utils/emailService';
import { Buffer } from 'node:buffer';
import { getContractEmailHtml } from '../utils/contractEmailTemplate';
import { getContractExpiryHtml, ExpiringContract } from '../utils/contractExpiryTemplate';

const contracts = new Hono<{ Bindings: Bindings }>();

contracts.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);

        const { error } = await supabase.from('contratos').insert({
            cliente_id: body.cliente_id,
            coche: body.coche,
            matricula: body.matricula?.toUpperCase(),
            tipo_plaza: body.tipo_plaza,
            fecha_inicio: body.fecha_inicio,
            fecha_fin: body.fecha_fin,
            precio: body.precio,
            pagado: body.pagado,
            metodo_pago: body.metodo_pago || null,
            fecha_pago: body.fecha_pago || null
        });

        if (error) {
            return c.json({
                success: false,
                message: 'Error al guardar en la base de datos',
                details: error.message
            }, 500);
        }

        const { data: newContract, error: fetchError } = await supabase
            .from('contratos')
            .select(`
                *,
                clientes (
                    nombre,
                    telefono,
                    cif,
                    direccion,
                    usuarios (email)
                )
            `)
            .eq('cliente_id', body.cliente_id)
            .order('num_contrato', { ascending: false })
            .limit(1)
            .single();

        if (fetchError || !newContract) {
            return c.json({
                success: false,
                message: 'Error al obtener el contrato creado'
            }, 500);
        }

        try {
            const pdfUint8Array = generateContractPDF(newContract);
            const pdfBuffer = Buffer.from(pdfUint8Array);
            
            const htmlContent = getContractEmailHtml({
                num_contrato: newContract.num_contrato,
                cliente_nombre: newContract.clientes.nombre,
                cliente_email: newContract.clientes.usuarios?.email || 'info@alcvaletparking.com',
                cliente_telefono: newContract.clientes.telefono,
                cliente_cif: newContract.clientes.cif,
                cliente_direccion: newContract.clientes.direccion,
                coche: newContract.coche,
                matricula: newContract.matricula,
                tipo_plaza: newContract.tipo_plaza,
                fecha_inicio: newContract.fecha_inicio,
                fecha_fin: newContract.fecha_fin,
                precio: newContract.precio,
                metodo_pago: newContract.metodo_pago,
                pagado: newContract.pagado
            });

            const resend = new Resend(c.env.RESEND_API_KEY);

            await resend.emails.send({
                from: 'ALC Valet Parking <reservas@alcvaletparking.com>',
                to: 'info@alcvaletparking.com',
                subject: `Nuevo Contrato Generado - Contrato Nº ${newContract.num_contrato}`,
                html: htmlContent,
                attachments: [
                    {
                        filename: `Contrato_${newContract.num_contrato}.pdf`,
                        content: pdfBuffer
                    },
                ]
            });
        } catch (err) {
            console.error("Error generando/enviando PDF del contrato:", err);
        }

        return c.json({
            success: true,
            message: 'Contrato creado correctamente',
            data: newContract
        }, 201);
    } catch (e) {
        return c.json({
            success: false,
            message: 'Error interno del servidor',
            error_real: e instanceof Error ? e.message : String(e)
        }, 500);
    }
});

contracts.put('/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);

    const { data: updatedContract, error } = await supabase
        .from('contratos')
        .update({
            ...body,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
            *,
            clientes (
                nombre,
                telefono,
                cif,
                direccion,
                usuarios (email)
            )
        `)
        .single();

    if (error) {
        return c.json({ success: false, message: error.message }, 500);
    }

    try {
        const pdfUint8Array = generateContractPDF(updatedContract);
        const pdfBuffer = Buffer.from(pdfUint8Array);
        
        const htmlContent = getContractEmailHtml({
            num_contrato: updatedContract.num_contrato,
            cliente_nombre: updatedContract.clientes.nombre,
            cliente_email: updatedContract.clientes.usuarios?.email || 'info@alcvaletparking.com',
            cliente_telefono: updatedContract.clientes.telefono,
            cliente_cif: updatedContract.clientes.cif,
            cliente_direccion: updatedContract.clientes.direccion,
            coche: updatedContract.coche,
            matricula: updatedContract.matricula,
            tipo_plaza: updatedContract.tipo_plaza,
            fecha_inicio: updatedContract.fecha_inicio,
            fecha_fin: updatedContract.fecha_fin,
            precio: updatedContract.precio,
            metodo_pago: updatedContract.metodo_pago,
            pagado: updatedContract.pagado
        });

        const resend = new Resend(c.env.RESEND_API_KEY);

        await resend.emails.send({
            from: 'ALC Valet Parking <reservas@alcvaletparking.com>',
            to: 'info@alcvaletparking.com',
            subject: `Modificación Contrato - Contrato Nº ${updatedContract.num_contrato}`,
            html: htmlContent,
            attachments: [{
                filename: `Contrato_MOD_${updatedContract.num_contrato}.pdf`,
                content: pdfBuffer
            }]
        });
    } catch (err) {
        console.error("Error enviando email de actualización de contrato:", err);
    }

    return c.json({ success: true, data: updatedContract });
});

contracts.delete('/:id', async (c) => {
    const id = c.req.param('id');
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);

    const { data: contractToDelete } = await supabase
        .from('contratos')
        .select(`
            *,
            clientes (
                nombre,
                telefono,
                cif,
                direccion,
                usuarios (email)
            )
        `)
        .eq('id', id)
        .single();

    if (!contractToDelete) {
        return c.json({ success: false, message: 'Contrato no encontrado' }, 404);
    }

    const { error } = await supabase.from('contratos').delete().eq('id', id);

    if (error) {
        return c.json({ success: false, message: error.message }, 500);
    }

    return c.json({ success: true });
});

// Disparado por pg_cron (Supabase) una vez al día. Ver migración `cron_avisar_contratos_expirados`.
contracts.post('/check-expired', async (c) => {
    if (c.req.header('x-cron-secret') !== c.env.CRON_SECRET) {
        return c.json({ success: false, message: 'No autorizado' }, 401);
    }

    try {
        const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);

        // 'en-CA' devuelve el formato YYYY-MM-DD que espera la columna `date`.
        // Calculamos el día en hora española, no en UTC, para no adelantar el aviso.
        const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Madrid' });

        // Usamos <= en lugar de = para recuperar los contratos de días en los que
        // el cron o el envío hayan fallado, en vez de perder el aviso.
        const { data: expirados, error } = await supabase
            .from('contratos')
            .select(`
                id,
                num_contrato,
                coche,
                matricula,
                tipo_plaza,
                fecha_inicio,
                fecha_fin,
                precio,
                pagado,
                clientes (
                    nombre,
                    telefono
                )
            `)
            .lte('fecha_fin', hoy)
            .eq('aviso_expiracion_enviado', false)
            .order('fecha_fin', { ascending: true });

        if (error) {
            return c.json({
                success: false,
                message: 'Error al consultar los contratos expirados',
                details: error.message
            }, 500);
        }

        if (!expirados || expirados.length === 0) {
            return c.json({ success: true, enviados: 0, message: 'No hay contratos expirados pendientes de aviso' });
        }

        const contratosEmail: ExpiringContract[] = expirados.map((contrato: any) => ({
            num_contrato: contrato.num_contrato,
            cliente_nombre: contrato.clientes?.nombre || '---',
            cliente_telefono: contrato.clientes?.telefono || '---',
            coche: contrato.coche,
            matricula: contrato.matricula,
            tipo_plaza: contrato.tipo_plaza,
            fecha_inicio: contrato.fecha_inicio,
            fecha_fin: contrato.fecha_fin,
            precio: contrato.precio,
            pagado: contrato.pagado
        }));

        const resend = new Resend(c.env.RESEND_API_KEY);

        const { error: emailError } = await resend.emails.send({
            from: 'ALC Valet Parking <reservas@alcvaletparking.com>',
            to: 'info@alcvaletparking.com',
            subject: `⚠️ Contratos expirados (${contratosEmail.length}) - ${new Date(hoy).toLocaleDateString('es-ES')}`,
            html: getContractExpiryHtml(contratosEmail, hoy)
        });

        // Solo marcamos como avisados si el email ha salido, para reintentar mañana si falla.
        if (emailError) {
            return c.json({
                success: false,
                message: 'Error al enviar el email de aviso',
                details: emailError.message
            }, 500);
        }

        const { error: updateError } = await supabase
            .from('contratos')
            .update({ aviso_expiracion_enviado: true })
            .in('id', expirados.map((contrato: any) => contrato.id));

        if (updateError) {
            console.error('Aviso enviado pero no se pudieron marcar los contratos:', updateError.message);
        }

        return c.json({ success: true, enviados: contratosEmail.length });
    } catch (e) {
        return c.json({
            success: false,
            message: 'Error interno del servidor',
            error_real: e instanceof Error ? e.message : String(e)
        }, 500);
    }
});

export default contracts;
