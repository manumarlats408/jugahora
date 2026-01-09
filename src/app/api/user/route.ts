import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function PUT(request: Request) {
    // Crear cliente de Supabase y loguear información relevante
    console.log('Iniciando actualización del perfil');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Obtener la cookie de autenticación
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    console.log('Token obtenido:', token?.value);

    // Comprobar si el token existe
    if (!token) {
        console.error('Token no encontrado');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Decodificar el token para obtener el correo electrónico del usuario
        const payload = JSON.parse(Buffer.from(token.value.split('.')[1], 'base64').toString());
        const userEmail = payload.email;
        console.log('Correo electrónico extraído del token:', userEmail);

        // Verificar si el correo electrónico se obtuvo correctamente
        if (!userEmail) {
            console.error('Correo electrónico no encontrado en el token');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parsear el cuerpo de la solicitud para obtener los datos a actualizar
        const updatedData = await request.json();
        console.log('Datos a actualizar:', updatedData);

        // Verificar si el usuario existe antes de actualizar
        const { data: userExists, error: selectError } = await supabase
            .from('User')
            .select('*')
            .eq('email', userEmail)
        console.log('Resultado de búsqueda de usuario:', userExists);
        console.log('manu',selectError)
        
        if (selectError || !userExists) {
            console.error('Usuario no encontrado o error en la búsqueda:', selectError);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Intentar actualizar el perfil del usuario en la tabla 'User'
        const { data, error: updateError } = await supabase
        .from('User')
        .update({
            firstName: updatedData.firstName,
            lastName: updatedData.lastName,
            phoneNumber: updatedData.phoneNumber,
            address: updatedData.address,
            age: updatedData.age,
            preferredSide: updatedData.preferredSide || null,
            strengths: updatedData.strengths
            ? Array.isArray(updatedData.strengths)
                ? updatedData.strengths
                : updatedData.strengths.split(',').map((s: string) => s.trim())
            : [],
            weaknesses: updatedData.weaknesses
            ? Array.isArray(updatedData.weaknesses)
                ? updatedData.weaknesses
                : updatedData.weaknesses.split(',').map((s: string) => s.trim())
            : [],
            nivel: updatedData.nivel, // ← ✅ AGREGAR ESTA LÍNEA
        })
        .eq('email', userEmail);


        console.log('Resultado de actualización:', data);

        if (updateError) {
            console.error('Error al actualizar el perfil:', updateError);
            return NextResponse.json({ error: 'Error updating profile' }, { status: 500 });
        }

        // Respuesta exitosa
        console.log('Perfil actualizado con éxito');
        return NextResponse.json({ message: 'Profile updated successfully', updatedUser: data });

    } catch (error) {
        console.error('Error inesperado:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
