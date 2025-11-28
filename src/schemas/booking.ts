import { z } from 'zod';

// Definimos el esquema Zod
export const createBookingSchema = z.object({
    // Fechas y horas (podrías validarlas como regex o isoString)
    dateIn: z.iso.date({ error: "La fecha debe tener formato YYYY-MM-DD" }).optional(), // Espera formato YYYY-MM-DD
    hourIn: z.iso.time({ precision: -1, error: "La hora debe tener formato HH:MM" }).optional(),
    dateOut: z.iso.date({ error: "La fecha debe tener formato YYYY-MM-DD" }).optional(),
    hourOut: z.iso.time({ precision: -1, error: "La hora debe tener formato HH:MM" }).optional(),

    // Datos del vehículo
    spotType: z.enum(['Plaza Aire Libre', 'Plaza Cubierta'], { error: "Debes elegir entre 'Plaza Aire Libre' o 'Plaza Cubierta'" }),
    carModel: z.string({error: "El modelo de coche es obligatorio"}).min(1),
    licensePlate: z.string().min(4).toUpperCase(), // Matricula

    // Datos del vuelo y observaciones
    flightNumber: z.string().optional(),
    observations: z.string().max(500).optional(),

    // Datos del usuario/pago
    userId: z.uuid({ error: "El ID de usuario no es válido" }).optional(),
    price: z.number({ error: "El precio debe ser un número" }).positive({ error: "EL precio debe ser mayor a 0" }),

    // Contacto y Conductor
    name: z.string({error: "El nombre es obligatorio"}).min(3),
    phone: z.string({error: "El teléfono es obligatorio"}).min(9),
    email: z.email({ error: "El formato del email no es correcto" }),
    referralSource: z.string({error: "Como nos conociste es obligatorio"}), // "Como nos has conocido"

    // Datos fiscales/dirección
    cif: z.string().min(6).optional(),
    driverName: z.string().min(3).optional(), // Si es diferente al 'name' principal
    address: z.string().min(5).optional()
});