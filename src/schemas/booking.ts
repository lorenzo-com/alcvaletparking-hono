import { z } from 'zod';

// Definimos el esquema Zod
export const createBookingSchema = z.object({
    // Fechas y horas
    fechaEntrada: z.iso.date({ error: "La fecha debe tener formato YYYY-MM-DD" }).optional(), // Espera formato YYYY-MM-DD
    horaEntrada: z.iso.time({ precision: -1, error: "La hora debe tener formato HH:MM" }).optional(),
    fechaSalida: z.iso.date({ error: "La fecha debe tener formato YYYY-MM-DD" }).optional(),
    horaSalida: z.iso.time({ precision: -1, error: "La hora debe tener formato HH:MM" }).optional(),

    // Datos del vehículo
    tipoPlaza: z.enum(['Plaza Aire Libre', 'Plaza Cubierta'], { error: "Debes elegir entre 'Plaza Aire Libre' o 'Plaza Cubierta'" }),
    coche: z.string({ error: "El modelo de coche es obligatorio" }).min(1),
    matricula: z.string().min(4).toUpperCase(),

    // Datos del vuelo y observaciones
    numVuelo: z.string().optional(),
    comentarios: z.string().max(500).optional(),

    // Datos del usuario/precio
    clienteId: z.uuid({ error: "El ID de usuario no es válido" }).optional(),
    precio: z.number({ error: "El precio debe ser un número" }).positive({ error: "EL precio debe ser mayor a 0" }),

    // Contacto y Conductor
    nombreCompleto: z.string({ error: "El nombre es obligatorio" }).min(3),
    telefono: z.string({ error: "El teléfono es obligatorio" }).min(9),
    email: z.email({ error: "El formato del email no es correcto" }),
    nosConociste: z.string({ error: "Como nos conociste es obligatorio" }),

    // Datos fiscales/dirección
    cif: z.string().min(6).optional(),
    nombreConductor: z.string().min(3).optional(), // Si es diferente al 'name' principal
    direccion: z.string().min(5).optional()
});