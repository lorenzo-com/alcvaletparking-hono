import { z } from 'zod';

export const calculatePriceSchema = z.object({
    // Fechas y tipo de plaza
    fechaEntrada: z.iso.date({ error: "La fecha debe tener formato YYYY-MM-DD" }), // Espera formato YYYY-MM-DD
    fechaSalida: z.iso.date({ error: "La fecha debe tener formato YYYY-MM-DD" }),
    tipoPlaza: z.enum(['Plaza Aire Libre', 'Plaza Cubierta'], { error: "Debes elegir entre 'Plaza Aire Libre' o 'Plaza Cubierta'" }),
});