import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { Bindings } from '../types';

const users = new Hono<{ Bindings: Bindings }>();

// Helper: crea cliente Supabase con service role key
function getSupabase(c: { env: Bindings }) {
    return createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

// ─── GET /api/users ─────────────────────────────────────────────────────────
// Lista todos los usuarios con rol 'administrador' o 'trabajador'
users.get('/', async (c) => {
    const supabase = getSupabase(c);

    const { data, error } = await supabase
        .from('vista_usuarios')
        .select('*');

    if (error) {
        return c.json({ success: false, message: error.message }, 500);
    }

    // Admins primero, luego por fecha desc
    const staff = (data ?? []).sort((a, b) => {
        if (a.rol !== b.rol) return a.rol === 'administrador' ? -1 : 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return c.json({ success: true, data: staff });
});

// ─── POST /api/users ─────────────────────────────────────────────────────────
// Crea un nuevo usuario (admin o trabajador)
users.post('/', async (c) => {
    const body = await c.req.json();

    const schema = z.object({
        email: z.string().email('Email inválido'),
        password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
        nombre: z.string().min(1, 'El nombre es obligatorio'),
        rol: z.enum(['administrador', 'trabajador'])
    });

    
    const result = schema.safeParse(body);
    if (!result.success) {
        return c.json({ success: false, errors: result.error.issues }, 400);
    }

    const { email, password, nombre, rol } = result.data;
    const supabase = getSupabase(c);

    // Obtener rol_id de la tabla roles
    const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('nombre', rol)
        .single();

    if (roleError || !roleData) {
        console.error('Rol no encontrado:', roleError?.message);
        return c.json({ success: false, message: 'Rol no encontrado en la base de datos' }, 400);
    }

    const rolId = roleData.id;

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Confirmar email automáticamente
        user_metadata: { nombre },
        app_metadata: { rol }
    });

    if (authError) {
        console.error('Auth error:', authError.message);
        return c.json({ success: false, message: authError.message }, 500);
    }

    const newUser = authData.user;

    // Insertar en tabla pública 'usuarios'
    const { error: userError } = await supabase
        .from('usuarios')
        .insert({ id: newUser.id, rol_id: rolId, email });

    if (userError) {
        console.error('Error tabla usuarios:', userError.message);
    }

    // Si es administrador, insertar también en tabla 'administradores'
        const { error: adminError } = await supabase
            .from('administradores')
            .insert({ id: newUser.id, nombre });

        if (adminError) {
            // No fallamos todo, solo lo registramos
            console.error('Error insertando en tabla administradores:', adminError.message);
        }

    return c.json({
        success: true,
        data: {
            id: newUser.id,
            email: newUser.email,
            nombre,
            rol,
            activo: true,
            created_at: newUser.created_at
        }
    }, 201);
});

// ─── PUT /api/users/:id ───────────────────────────────────────────────────────
// Edita la información de un usuario
users.put('/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();

    const schema = z.object({
        email: z.string().email('Email inválido').optional(),
        nombre: z.string().min(1, 'El nombre es obligatorio'),
        rol: z.enum(['administrador', 'trabajador']),
        password: z.string().min(6).optional().or(z.literal(''))
    });

    const result = schema.safeParse(body);
    if (!result.success) {
        return c.json({ success: false, errors: result.error.issues }, 400);
    }

    const { email, nombre, rol, password } = result.data;
    const supabase = getSupabase(c);

    // Obtener usuario actual para comparar rol
    const { data: currentData, error: fetchError } = await supabase.auth.admin.getUserById(id);
    if (fetchError || !currentData.user) {
        return c.json({ success: false, message: 'Usuario no encontrado' }, 404);
    }

    const oldRol = currentData.user.app_metadata?.rol;

    // Construir payload de actualización
    const updatePayload: {
        user_metadata: { nombre: string };
        app_metadata: { rol: string };
        email?: string;
        password?: string;
    } = {
        user_metadata: { nombre },
        app_metadata: { rol }
    };
    if (email) updatePayload.email = email;
    if (password && password.trim() !== '') updatePayload.password = password;

    // Obtener nuevo rol_id
    const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('nombre', rol)
        .single();

    if (roleError || !roleData) {
        return c.json({ success: false, message: 'Rol no encontrado en la base de datos' }, 400);
    }

    const { data: updatedData, error: updateError } = await supabase.auth.admin.updateUserById(
        id,
        updatePayload
    );

    if (updateError) {
        return c.json({ success: false, message: updateError.message }, 500);
    }

    // Actualizar tabla pública usuarios usando upsert (por si el usuario no existía ahí antes)
    const currentEmail = email || currentData.user.email || '';
    const { error: userUpdateError } = await supabase
        .from('usuarios')
        .upsert({ id, rol_id: roleData.id, email: currentEmail });

    if (userUpdateError) {
        console.error('Error actualizando tabla usuarios:', userUpdateError.message);
    }

    // Sincronizar tabla administradores según cambio de rol
    if (oldRol !== 'administrador' && rol === 'administrador') {
        // Pasó a ser admin: insertar en tabla administradores
        await supabase.from('administradores').upsert({ id, nombre });
    } else if (oldRol === 'administrador' && rol === 'trabajador') {
        // Dejó de ser admin: eliminar de tabla administradores
        await supabase.from('administradores').delete().eq('id', id);
    } else if (rol === 'administrador') {
        // Sigue siendo admin, actualizar nombre
        await supabase.from('administradores').update({ nombre }).eq('id', id);
    }

    const u = updatedData.user;
    return c.json({
        success: true,
        data: {
            id: u.id,
            email: u.email ?? '',
            nombre: u.user_metadata?.nombre ?? nombre,
            rol,
            activo: !u.banned_until || new Date(u.banned_until) < new Date(),
            created_at: u.created_at
        }
    });
});

// ─── PATCH /api/users/:id/toggle-status ─────────────────────────────────────
// Activa o desactiva un usuario (ban/unban)
users.patch('/:id/toggle-status', async (c) => {
    const id = c.req.param('id');
    const supabase = getSupabase(c);

    // Obtener estado actual del usuario
    const { data: currentData, error: fetchError } = await supabase.auth.admin.getUserById(id);
    if (fetchError || !currentData.user) {
        return c.json({ success: false, message: 'Usuario no encontrado' }, 404);
    }

    const u = currentData.user;
    const isCurrentlyBanned = u.banned_until && new Date(u.banned_until) > new Date();

    // Alternar estado
    const banDuration = isCurrentlyBanned ? 'none' : '876000h'; // 100 años = desactivado

    const { data: updatedData, error: updateError } = await supabase.auth.admin.updateUserById(id, {
        ban_duration: banDuration
    });

    if (updateError) {
        return c.json({ success: false, message: updateError.message }, 500);
    }

    const updated = updatedData.user;
    const nuevoActivo = !updated.banned_until || new Date(updated.banned_until) < new Date();

    return c.json({
        success: true,
        activo: nuevoActivo,
        message: nuevoActivo ? 'Usuario activado correctamente' : 'Usuario desactivado correctamente'
    });
});

// ─── DELETE /api/users/:id ───────────────────────────────────────────────────
// Elimina un trabajador (los administradores no se pueden borrar desde el panel)
users.delete('/:id', async (c) => {
    const id = c.req.param('id');
    const supabase = getSupabase(c);

    // Verificar que existe y que NO es administrador
    const { data: currentData, error: fetchError } = await supabase.auth.admin.getUserById(id);
    if (fetchError || !currentData.user) {
        return c.json({ success: false, message: 'Usuario no encontrado' }, 404);
    }

    const rol = currentData.user.app_metadata?.rol;
    if (rol === 'administrador') {
        return c.json(
            {
                success: false,
                message:
                    'Los administradores no se pueden eliminar desde el panel. Contacta con el informático.'
            },
            403
        );
    }

    // Primero eliminar de la tabla usuarios para evitar errores de Foreign Key
    const { error: userDeleteError } = await supabase.from('usuarios').delete().eq('id', id);
    if (userDeleteError) {
        console.error('Error eliminando de tabla usuarios:', userDeleteError.message);
    }

    // También eliminar de administradores preventivamente
    await supabase.from('administradores').delete().eq('id', id);

    // Finalmente eliminar de Supabase Auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(id);
    if (deleteError) {
        return c.json({ success: false, message: deleteError.message }, 500);
    }

    return c.json({ success: true, message: 'Trabajador eliminado correctamente' });
});

export default users;
