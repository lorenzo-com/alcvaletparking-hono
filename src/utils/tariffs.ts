// Definimos el tipo para asegurar que no metemos datos raros
type TariffTier = { threshold: number; price: number };

// Ordenamos de MAYOR A MENOR para facilitar la búsqueda (lógica "floor")
const TARIFA_CUBIERTA: TariffTier[] = [
  { threshold: 301, price: 550 },
  { threshold: 300, price: 505 },
  { threshold: 281, price: 490 },
  { threshold: 261, price: 465 },
  { threshold: 230, price: 420 },
  { threshold: 200, price: 380 },
  { threshold: 180, price: 350 },
  { threshold: 159, price: 310 },
  { threshold: 140, price: 285 },
  { threshold: 121, price: 260 },
  { threshold: 101, price: 230 },
  { threshold: 81, price: 200 },
  { threshold: 61, price: 160 },
  { threshold: 51, price: 140 },
  { threshold: 43, price: 120 },
  { threshold: 33, price: 110 },
  { threshold: 29, price: 90 },
  { threshold: 25, price: 80 },
  { threshold: 21, price: 70 },
  { threshold: 18, price: 65 },
  { threshold: 15, price: 60 },
  { threshold: 12, price: 55 },
  { threshold: 9, price: 50 },
  { threshold: 7, price: 45 },
  { threshold: 5, price: 40 },
  { threshold: 3, price: 35 },
  { threshold: 1, price: 30 },
];

const TARIFA_AIRE_LIBRE: TariffTier[] = [
  { threshold: 300, price: 317 }, 
  { threshold: 281, price: 295 },
  { threshold: 260, price: 265 },
  { threshold: 230, price: 250 },
  { threshold: 201, price: 235 },
  { threshold: 182, price: 215 },
  { threshold: 140, price: 200 },
  { threshold: 121, price: 190 },
  { threshold: 101, price: 170 },
  { threshold: 81, price: 150 },
  { threshold: 61, price: 130 },
  { threshold: 51, price: 115 },
  { threshold: 43, price: 105 },
  { threshold: 33, price: 90 },
  { threshold: 29, price: 80 },
  { threshold: 25, price: 70 },
  { threshold: 21, price: 65 },
  { threshold: 18, price: 60 },
  { threshold: 15, price: 55 },
  { threshold: 12, price: 50 },
  { threshold: 9, price: 45 },
  { threshold: 7, price: 40 },
  { threshold: 5, price: 35 },
  { threshold: 3, price: 30 },
  { threshold: 1, price: 25 },
];

export const TARIFAS = {
  'Plaza Cubierta': TARIFA_CUBIERTA,
  'Plaza Aire Libre': TARIFA_AIRE_LIBRE
} as const;