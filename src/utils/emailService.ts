import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface BookingData {
    id: string;
    fecha_entrada: string;
    hora_entrada: string;
    fecha_salida: string;
    hora_salida: string;
    coche: string;
    matricula: string;
    tipo_plaza: string;
    terminal_entrada: string;
    terminal_salida: string;
    num_vuelo?: string;
    precio: number;
    comentarios?: string;
    nombre_completo: string;
    telefono: string;
    cif?: string;
    nombre_conductor?: string;
    direccion?: string;
    num_reserva: number;
}

export const generateBookingPDF = (reservation: BookingData): Uint8Array => {
    const doc = new jsPDF();

    // --- HEADER (Título y Fecha) ---

    // Título (Izq)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Recibo de Aparcamiento", 14, 20);

    // Fecha (Derecha)
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const today = new Date().toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    // Calculamos el ancho del texto para alinearlo a la derecha (margen derecho ~195)
    const dateWidth = doc.getTextWidth(today);
    doc.text(today, 195 - dateWidth, 20);

    // --- DATOS EMPRESA E IMÁGENES ---
    let yPos = 30; // Posición vertical inicial

    // Texto de la empresa (Izquierda)
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const companyLines = [
        "ALC VALET PARKING",
        "E72706781",
        "Ctra. Aeropuerto-Torellano s/n CV-852",
        "03320 Torrellano (Alicante)",
        "Oficina +34 601 356 356",
        "Móvil +34 601 356 356",
        "info@alcvaletparking.com",
        "www.alcvaletparking.com"
    ];

    companyLines.forEach(line => {
        doc.text(line, 14, yPos);
        yPos += 5; // Salto de línea
    });

    // --- LÍNEA SEPARADORA ---
    // Java: LineSeparator line
    doc.setDrawColor(0);
    doc.line(14, yPos + 5, 195, yPos + 5);

    yPos += 15; // Espacio tras la línea

    // --- TABLA DATOS CLIENTE ---
    const clientData = [
        ["Recibo Nº", reservation.num_reserva],
        ["Nombre Completo/Razón Social:", reservation.nombre_completo],
        ["CIF:", reservation.cif || "---"],
        ["Nombre del conductor:", reservation.nombre_conductor || "---"],
        ["Dirección de facturación:", reservation.direccion || "---"],
        ["Teléfono:", reservation.telefono]
    ];

    autoTable(doc, {
        startY: yPos,
        head: [],
        body: clientData,
        theme: 'plain', // Sin bordes (Rectangle.NO_BORDER)
        styles: { cellPadding: 1, fontSize: 10 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 60 }, // Primera columna negrita
            1: { fontStyle: 'bold' } // Segunda columna negrita (según tu Java)
        },
    });

    // --- LÍNEA SEPARADORA ---
    let finalY = (doc as any).lastAutoTable.finalY + 5;
    doc.line(14, finalY, 195, finalY);
    finalY += 10;

    // --- TABLA CONTRATO (RESERVA) ---
    // Primero dibujamos los datos
    const reservationData = [
        ["Marca, Modelo y Color:", reservation.coche],
        ["Matrícula:", reservation.matricula],
        ["Tipo de plaza:", reservation.tipo_plaza],
        ["Fecha Entrada:", `${reservation.fecha_entrada || "Sin fecha"} ${reservation.hora_entrada || ""}`],
        ["Fecha Salida:", `${reservation.fecha_salida || "Sin fecha"} ${reservation.hora_salida || ""}`],
        ["Terminal (Entrada):", reservation.terminal_entrada],
        ["Terminal (Vuelta):", reservation.terminal_salida],
        ["Nº Vuelo de vuelta:", reservation.num_vuelo || ""]
    ];

    autoTable(doc, {
        startY: finalY,
        body: reservationData,
        theme: 'plain',
        styles: { cellPadding: 1, fontSize: 10 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50 }, // Etiquetas negrita
            1: { halign: 'right', cellWidth: 60 }   // Valores alineados derecha
        },
        margin: { right: 80 } // Dejamos espacio a la derecha para la foto del coche
    });

    finalY = (doc as any).lastAutoTable.finalY + 5;
    doc.line(14, finalY, 195, finalY);
    finalY += 10;

    // --- TABLAS PRECIO Y OBSERVACIONES (Lado a lado) ---
    const pageHeight = doc.internal.pageSize.height;
    // Chequeo de salto de página si estamos muy abajo
    if (finalY > pageHeight - 60) {
        doc.addPage();
        finalY = 20;
    }

    // Tabla Precio (Izquierda)
    autoTable(doc, {
        startY: finalY,
        body: [
            ["Precio Estancia", `${reservation.precio} €`],
            ["TOTAL", `${reservation.precio} €`]
        ],
        theme: 'grid', // Java: priceCell.setBorder(Rectangle.BOX)
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 40 },
            1: { halign: 'right', fontStyle: 'bold', cellWidth: 40 }
        },
        margin: { right: 115 } // Forzamos que se quede a la izquierda
    });

    // Tabla Observaciones (Derecha)
    // Usamos el mismo startY para que salgan paralelas
    autoTable(doc, {
        startY: finalY,
        body: [
            ["Observaciones:"],
            [reservation.comentarios || "Sin observaciones"]
        ],
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: { 0: { fontStyle: 'bold' } },
        margin: { left: 110 } // Forzamos que empiece a la derecha
    });

    finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.line(14, finalY, 195, finalY);
    finalY += 10;

    // --- FIRMAS ---
    const boxHeight = 30;
    const boxWidth = 80;
    
    // Caja Cliente (Izquierda)
    doc.setFont("helvetica", "bold");
    doc.text("Conforme Cliente", 14 + (boxWidth/2), finalY, { align: 'center' });
    doc.rect(14, finalY + 2, boxWidth, boxHeight); // El recuadro

    // Caja ALC (Derecha)
    doc.text("Conforme ALC", 110 + (boxWidth/2), finalY, { align: 'center' });
    doc.rect(110, finalY + 2, boxWidth, boxHeight); // El recuadro

    // --- RETORNAR BUFFER ---
    const pdfArrayBuffer = doc.output('arraybuffer');
    return new Uint8Array(pdfArrayBuffer);
}