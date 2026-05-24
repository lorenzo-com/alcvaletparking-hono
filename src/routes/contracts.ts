import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { Bindings } from '../types';
import { generateContractPDF } from '../utils/emailService';
import { Buffer } from 'node:buffer';
import { getContractEmailHtml } from '../utils/contractEmailTemplate';

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

export default contracts;
