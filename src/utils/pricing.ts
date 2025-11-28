import { TARIFAS } from "./tariffs";

export function calculateParkingPrice(fechaEntrada: string | undefined | null, fechaSalida: string | undefined | null, tipoPlaza: string | undefined | null): { totalPrice: number } {
    // Si falta algún dato, devolvemos 0 inmediatamente
    if (!fechaEntrada || !fechaSalida || !tipoPlaza) {
        return {
            totalPrice: 0,
        };
    }

    // Crear fechas (al no tener hora, JS asume UTC 00:00:00)
    const start = new Date(fechaEntrada);
    const end = new Date(fechaSalida);

    // Calcular diferencia en milisegundos
    const diffMs = end.getTime() - start.getTime();

    // Convertir a días
    // 1000ms * 60s * 60m * 24h = 86400000 ms/día
    let days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // Regla de negocio: Si entra y sale el mismo día (diferencia 0), cobramos 1 día
    if (days === 0) days = 1;

    // Buscar precio en tu tabla (Lógica "Floor")
    const tariffTable = TARIFAS[tipoPlaza as keyof typeof TARIFAS];

    if (!tariffTable) {
        throw new Error(`Tipo de plaza desconocido: ${tipoPlaza}`);
    }

    // Buscamos el rango
    const match = tariffTable.find((tier) => {
        return days >= tier.threshold;
    });

    // Si no encuentra (ej: days < 1), usa el último precio base
    const totalPrice = match ? match.price : tariffTable[tariffTable.length - 1].price;

    return { totalPrice };
}