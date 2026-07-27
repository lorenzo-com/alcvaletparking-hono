export interface ExpiringContract {
    num_contrato: number;
    cliente_nombre: string;
    cliente_telefono: string;
    coche: string;
    matricula: string;
    tipo_plaza: string;
    fecha_inicio: string;
    fecha_fin: string;
    precio: number;
    pagado: boolean;
}

const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return '---';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES');
};

export const getContractExpiryHtml = (contracts: ExpiringContract[], fechaAviso: string): string => {
    const filas = contracts.map(contract => `
        <tr>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eeeeee; color: #333333; font-weight: bold;">
                ${contract.num_contrato}
            </td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eeeeee; color: #666666;">
                ${contract.cliente_nombre}<br>
                <span style="font-size: 12px; color: #999999;">${contract.cliente_telefono}</span>
            </td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eeeeee; color: #666666;">
                ${contract.matricula}<br>
                <span style="font-size: 12px; color: #999999;">${contract.coche}</span>
            </td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eeeeee; color: #666666;">
                ${contract.tipo_plaza}
            </td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eeeeee; color: #666666;">
                ${formatearFecha(contract.fecha_fin)}
            </td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eeeeee; color: #666666; text-align: right;">
                ${contract.precio} €
            </td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eeeeee; text-align: center;">
                <span style="color: ${contract.pagado ? '#28a745' : '#dc3545'}; font-weight: bold; font-size: 12px;">
                    ${contract.pagado ? 'PAGADO' : 'PENDIENTE'}
                </span>
            </td>
        </tr>
    `).join('');

    const pendientesPago = contracts.filter(contract => !contract.pagado).length;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contratos que expiran</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 700px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

                    <!-- Header -->
                    <tr>
                        <td style="background-color: #ff6600; padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">ALC VALET PARKING</h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">Aviso de Contratos Expirados</p>
                        </td>
                    </tr>

                    <!-- Contenido Principal -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 20px;">
                                ${contracts.length === 1 ? '1 contrato ha expirado' : `${contracts.length} contratos han expirado`}
                            </h2>

                            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 25px 0;">
                                Los siguientes contratos han llegado a su fecha de finalización a día ${formatearFecha(fechaAviso)}.
                                Conviene contactar con los clientes para gestionar la renovación o la retirada del vehículo.
                            </p>

                            <!-- Tabla de contratos -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                                <thead>
                                    <tr style="background-color: #f8f8f8;">
                                        <th style="padding: 10px 8px; text-align: left; color: #ff6600; font-size: 12px; border-bottom: 2px solid #ff6600;">Nº</th>
                                        <th style="padding: 10px 8px; text-align: left; color: #ff6600; font-size: 12px; border-bottom: 2px solid #ff6600;">Cliente</th>
                                        <th style="padding: 10px 8px; text-align: left; color: #ff6600; font-size: 12px; border-bottom: 2px solid #ff6600;">Vehículo</th>
                                        <th style="padding: 10px 8px; text-align: left; color: #ff6600; font-size: 12px; border-bottom: 2px solid #ff6600;">Plaza</th>
                                        <th style="padding: 10px 8px; text-align: left; color: #ff6600; font-size: 12px; border-bottom: 2px solid #ff6600;">Fecha Fin</th>
                                        <th style="padding: 10px 8px; text-align: right; color: #ff6600; font-size: 12px; border-bottom: 2px solid #ff6600;">Precio</th>
                                        <th style="padding: 10px 8px; text-align: center; color: #ff6600; font-size: 12px; border-bottom: 2px solid #ff6600;">Pago</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${filas}
                                </tbody>
                            </table>

                            ${pendientesPago > 0 ? `
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fff3cd; border-left: 4px solid #ffc107;">
                                <tr>
                                    <td style="padding: 15px;">
                                        <strong style="color: #856404; font-size: 14px;">Atención:</strong>
                                        <span style="color: #856404; font-size: 14px;">
                                            ${pendientesPago === 1
                                                ? '1 de estos contratos tiene el pago pendiente.'
                                                : `${pendientesPago} de estos contratos tienen el pago pendiente.`}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                            ` : ''}
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
