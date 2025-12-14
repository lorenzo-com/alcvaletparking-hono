import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { createBookingSchema } from '../schemas/booking';
import { Bindings } from '../types';
import { calculatePriceSchema } from '../schemas/pricing';
import { calculateParkingPrice } from '../utils/pricing';

const bookings = new Hono<{ Bindings: Bindings }>();

// POST /bookings
bookings.post('/', async (c) => {
    try {
        // Obtenemos el JSON "crudo" (tipo any/unknown)
        const body = await c.req.json();

        // Validamos manualmente usando .safeParse()
        // Esto no lanza error, sino que devuelve un objeto con resultado
        const result = createBookingSchema.safeParse(body);

        // Comprobamos si falló
        if (!result.success) {
            // Recorremos los errores y creamos un array limpio
            const formattedErrors = result.error.issues.map((issue) => {
                return {
                    campo: issue.path[0], // El nombre del campo (ej: "dateIn")
                    mensaje: issue.message // El mensaje de error
                };
            });

            return c.json({
                success: false,
                message: 'Datos de reserva inválidos',
                errors: formattedErrors
            }, 400);
        };

        // Si todo va bien, usamos los datos LIMPIOS y TIPADOS
        const data = result.data;
        // Iniciar Supabase (Usando las variables de entorno de Hono)
        const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);

        // Datos del cliente
        let clienteData = {};

        // USUARIO ESTA REGISTRADO (Buscamos en BD su información)
        if (data.clienteId) {
            const { data: perfil, error } = await supabase
                .from('clientes')
                .select(`
                    nombre,
                    telefono,
                    direccion,
                    cif,
                    nos_conociste,
                    usuarios (email)
                    `)
                .eq('id', data.clienteId)
                .single();

            if (error || !perfil) {
                return c.json({
                    success: false,
                    message: `No se ha encontrado el usuario con id ${data.clienteId}`
                }, 500);
            }

            clienteData = {
                nombre_completo: perfil.nombre,
                email: perfil.usuarios?.[0]?.email,
                telefono: perfil.telefono,
                direccion: perfil.direccion,
                cif: perfil.cif,
                nos_conociste: perfil.nos_conociste
            }
        } else {
            clienteData = {
                nombre_completo: data.nombreCompleto,
                email: data.email,
                telefono: data.telefono,
                nos_conociste: data.nosConociste,
                cif: data.cif || null,
                direccion: data.direccion || null,
                nombre_conductor: data.nombreConductor || null
            }
        };

        // Re-calcumos el precio por seguridad (Para que desde el frontend no nos envien cualquier precio)
        const { totalPrice } = calculateParkingPrice(data.fechaEntrada, data.fechaSalida, data.tipoPlaza);

        // Es buena práctica convertir camelCase a snake_case para SQL
        const reservaPayload = {
            fecha_entrada: data.fechaEntrada || null,
            hora_entrada: data.horaEntrada || null,
            fecha_salida: data.fechaSalida || null,
            hora_salida: data.horaSalida || null,
            tipo_plaza: data.tipoPlaza,
            coche: data.coche,
            matricula: data.matricula,
            num_vuelo: data.numVuelo || null,
            comentarios: data.comentarios || null,

            cliente_id: data.clienteId || null, // Importante: Este ID debe existir en auth.users o tu tabla de users
            precio: totalPrice,

            ...clienteData
        };

        // Insertar en Supabase
        const { data: newBooking, error } = await supabase
            .from('reservas')
            .insert(reservaPayload)
            .select()
            .single();

        // 5. Manejar error de base de datos
        if (error) {
            return c.json({
                success: false,
                message: 'Error al guardar en la base de datos',
                details: error.message
            }, 500);
        }

        return c.json({
            success: true,
            message: 'Reserva creada correctamente',
            data: newBooking
        }, 201);
    } catch (e) {
        return c.json({
            success: false,
            message: 'Error interno del servidor',
            error_real: e instanceof Error ? e.message : String(e)
        }, 500);
    }
});

// POST /bookings/pricing
// Calculamos el precio de la reserva
bookings.post('/pricing', async (c) => {
    const body = await c.req.json();

    // Validamos los campos de fecha, hora y tipo de plaza
    const result = calculatePriceSchema.safeParse(body);

    if (!result.success) {
        return c.json({ success: false, errors: result.error.issues }, 400);
    }

    const { fechaEntrada, fechaSalida, tipoPlaza } = result.data;

    try {
        // Usamos la utilidad
        const calculation = calculateParkingPrice(fechaEntrada, fechaSalida, tipoPlaza);

        // Devolvemos el cálculo al frontend
        return c.json({
            success: true,
            data: calculation
            // Esto devolverá: { totalPrice: 30 }
        });
    } catch (e) {
        return c.json({
            success: false,
            message: e instanceof Error ? e.message : "Error al calcular"
        }, 400);
    }
});

export default bookings;