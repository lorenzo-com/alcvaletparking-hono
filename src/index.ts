import { Hono } from 'hono';
import { logger } from 'hono/logger';
import bookings from './routes/bookings';
import { cors } from 'hono/cors';

const app = new Hono();

// --- CONFIGURACIÓN CORS ---
app.use('/*', cors({
    origin: [
        // 'http://localhost:4321', // Astro en desarrollo
        // 'http://localhost:5173', // Svelte (Vite) en desarrollo
        'https://alcvaletparking.com', // dominio de producción (Astro)
        'https://admin.alcvaletparking.com' // dominio de admin (Svelte)
    ],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'apikey', 'X-Client-Info'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600, // Cachea la respuesta de pre-flight por 10 minutos
    credentials: true, // IMPORTANTE: Permite enviar cookies o headers de autorización
}))

app.use('*', logger());

app.route('/api/bookings', bookings);

export default app;