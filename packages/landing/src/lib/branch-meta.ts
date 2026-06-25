// Fallback hero images for branches that haven't uploaded a gallery yet.
// Keyed by the canonical branch address as stored in the DB.
export const BRANCH_FALLBACK_IMAGES: Record<string, string> = {
  'Байзакова 280, 3 этаж': '/images/branches/baizakova.jpg',
  'Кожамкулова 136': '/images/branches/kozhamkulova.jpg',
  'Кабанбай батыра 147': '/images/branches/kabanbai.jpg',
  'Макатаева 45, 3 этаж': '/images/branches/makataeva.jpg',
};

// Direct 2GIS short links per branch address. Falls back to a search URL
// when the address isn't in the map.
const GIS_LINKS: Record<string, string> = {
  'Байзакова 280, 3 этаж': 'https://go.2gis.com/bLzQu',
  'Кожамкулова 136': 'https://go.2gis.com/Ocamg',
  'Кабанбай батыра 147': 'https://go.2gis.com/3eviR',
  'Макатаева 45, 3 этаж': 'https://go.2gis.com/ELcw6',
};

export function getMapUrl(address: string): string {
  return GIS_LINKS[address] || `https://2gis.kz/almaty/search/${encodeURIComponent(address)}`;
}
