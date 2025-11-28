import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { createBookingSchema } from '../schemas/booking';
import { Bindings } from '../types';

const bookings = new Hono<{ Bindings: Bindings }>();

// POST /bookings
bookings.post('/', async (c) => {
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

    // Es buena práctica convertir camelCase a snake_case para SQL
    const dbData = {
        fecha_entrada: data.fechaEntrada,
        hora_entrada: data.horaEntrada,
        fecha_salida: data.fechaSalida,
        hora_salida: data.horaSalida,
        tipo_plaza: data.tipoPlaza,
        coche: data.coche,
        matricula: data.matricula,
        num_vuelo: data.numVuelo,
        comentarios: data.comentarios,
        // TODO: cliente_id: data.clienteId, // Importante: Este ID debe existir en auth.users o tu tabla de users
        precio: data.precio,
        nombre_completo: data.nombreCompleto,
        telefono: data.telefono,
        email: data.email,
        nos_conociste: data.nosConociste,
        cif: data.cif,
        nombre_conductor: data.nombreConductor,
        direccion: data.direccion
    };

    // Insertar en Supabase
    const { data: insertedBooking, error } = await supabase
        .from('reservas')
        .insert(dbData)
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
        data: insertedBooking
    }, 201);
});

export default bookings;