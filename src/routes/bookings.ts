import { Hono } from 'hono';
import { createBookingSchema } from '../schemas/booking';

const bookings = new Hono();

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

    return c.json({
        success: true,
        data: data
    }, 201);
});

export default bookings;