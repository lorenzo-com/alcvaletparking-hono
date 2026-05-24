export interface ContractEmailData {
    num_contrato: number;
    cliente_nombre: string;
    cliente_email: string;
    cliente_telefono: string;
    cliente_cif?: string;
    cliente_direccion?: string;
    coche: string;
    matricula: string;
    tipo_plaza: string;
    fecha_inicio: string;
    fecha_fin: string;
    precio: number;
    metodo_pago?: string;
    pagado: boolean;
}

const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return '---';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const getContractEmailHtml = (contract: ContractEmailData): string => {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrato Confirmado</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #ff6600; padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">ALC VALET PARKING</h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">Contrato de Aparcamiento</p>
                        </td>
                    </tr>
                    
                    <!-- Contenido Principal -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 20px;">
                                Contrato Nº ${contract.num_contrato}
                            </h2>
                            
                            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                                Se ha generado un nuevo contrato de aparcamiento. A continuación se detallan los datos:
                            </p>
                            
                            <!-- Datos del Cliente -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                                        <strong style="color: #333333;">Cliente:</strong>
                                        <span style="color: #666666; margin-left: 10px;">${contract.cliente_nombre}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                                        <strong style="color: #333333;">Email:</strong>
                                        <span style="color: #666666; margin-left: 10px;">${contract.cliente_email}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                                        <strong style="color: #333333;">Teléfono:</strong>
                                        <span style="color: #666666; margin-left: 10px;">${contract.cliente_telefono}</span>
                                    </td>
                                </tr>
                                ${contract.cliente_cif ? `
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">
                                        <strong style="color: #333333;">CIF:</strong>
                                        <span style="color: #666666; margin-left: 10px;">${contract.cliente_cif}</span>
                                    </td>
                                </tr>
                                ` : ''}
                            </table>
                            
                            <!-- Datos del Vehículo -->
                            <h3 style="color: #ff6600; font-size: 16px; margin: 25px 0 15px 0; border-bottom: 2px solid #ff6600; padding-bottom: 5px;">
                                Datos del Vehículo
                            </h3>
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <strong style="color: #333333;">Vehículo:</strong>
                                        <span style="color: #666666; margin-left: 10px;">${contract.coche}</span>
                                    </td>
                                    <td style="padding: 8px 0;">
                                        <strong style="color: #333333;">Matrícula:</strong>
                                        <span style="color: #666666; margin-left: 10px;">${contract.matricula}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <strong style="color: #333333;">Tipo de Plaza:</strong>
                                        <span style="color: #666666; margin-left: 10px;">${contract.tipo_plaza}</span>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Duración del Contrato -->
                            <h3 style="color: #ff6600; font-size: 16px; margin: 25px 0 15px 0; border-bottom: 2px solid #ff6600; padding-bottom: 5px;">
                                Duración del Contrato
                            </h3>
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <strong style="color: #333333;">Fecha de Inicio:</strong>
                                        <span style="color: #666666; margin-left: 10px;">${formatearFecha(contract.fecha_inicio)}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <strong style="color: #333333;">Fecha de Fin:</strong>
                                        <span style="color: #666666; margin-left: 10px;">${formatearFecha(contract.fecha_fin)}</span>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Información de Pago -->
                            <h3 style="color: #ff6600; font-size: 16px; margin: 25px 0 15px 0; border-bottom: 2px solid #ff6600; padding-bottom: 5px;">
                                Información de Pago
                            </h3>
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <strong style="color: #333333;">Precio Total:</strong>
                                        <span style="color: #666666; margin-left: 10px;">${contract.precio} €</span>
                                    </td>
                                </tr>
                                ${contract.metodo_pago ? `
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <strong style="color: #333333;">Método de Pago:</strong>
                                        <span style="color: #666666; margin-left: 10px;">${contract.metodo_pago}</span>
                                    </td>
                                </tr>
                                ` : ''}
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <strong style="color: #333333;">Estado:</strong>
                                        <span style="color: ${contract.pagado ? '#28a745' : '#ffc107'}; margin-left: 10px; font-weight: bold;">
                                            ${contract.pagado ? 'PAGADO' : 'PENDIENTE'}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Footer del contenido -->
                            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                                El contrato adjunto incluye los términos y condiciones del servicio de aparcamiento.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                            <p style="color: #999999; font-size: 12px; margin: 0;">
                                <strong>ALC VALET PARKING</strong><br>
                                Ctra. Aeropuerto-Torellano s/n CV-852, 03320 Torrellano (Alicante)<br>
                                Tel: +34 601 356 356 | Email: info@alcvaletparking.com
                            </p>
                            <p style="color: #999999; font-size: 11px; margin: 10px 0 0 0;">
                                Este es un mensaje automático, por favor no responda a este correo.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
};
