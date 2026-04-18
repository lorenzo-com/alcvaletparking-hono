import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { Bindings } from '../types';

const pricing = new Hono<{ Bindings: Bindings }>();

// GET /api/pricing
// Devuelve todas las tarifas agrupadas por tipo de plaza
pricing.get('/', async (c) => {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);

    const { data, error } = await supabase
        .from('tarifas')
        .select('id, tipo_plaza, threshold, price, updated_at')
        .order('tipo_plaza', { ascending: true })
        .order('threshold', { ascending: false });

    if (error) {
        return c.json({ success: false, message: error.message }, 500);
    }

    // Agrupamos por tipo_plaza para facilitar el renderizado en el frontend
    const grouped = data.reduce<Record<string, typeof data>>((acc, tarifa) => {
        if (!acc[tarifa.tipo_plaza]) {
            acc[tarifa.tipo_plaza] = [];
        }
        acc[tarifa.tipo_plaza].push(tarifa);
        return acc;
    }, {});

    return c.json({ success: true, data: grouped });
});

// PUT /api/pricing/:id
// Actualiza el precio de una tarifa concreta (solo admin)
pricing.put('/:id', async (c) => {
    const id = parseInt(c.req.param('id'), 10);

    if (isNaN(id)) {
        return c.json({ success: false, message: 'ID de tarifa inválido' }, 400);
    }

    const body = await c.req.json();

    const updateSchema = z.object({
        price: z.number({ error: 'El precio debe ser un número' }).positive({ message: 'El precio debe ser mayor que 0' })
    });

    const result = updateSchema.safeParse(body);

    if (!result.success) {
        return c.json({ success: false, errors: result.error.issues }, 400);
    }

    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);

    const { data, error } = await supabase
        .from('tarifas')
        .update({
            price: result.data.price,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('id, tipo_plaza, threshold, price, updated_at')
        .single();

    if (error) {
        return c.json({ success: false, message: error.message }, 500);
    }

    if (!data) {
        return c.json({ success: false, message: `Tarifa con id ${id} no encontrada` }, 404);
    }

    return c.json({ success: true, data });
});

export default pricing;
