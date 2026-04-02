import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface NearbyPlace {
  id: string;
  name: string;
  type: string;
  emoji: string;
  distanceM: number;
  lat: number;
  lon: number;
}

// Tipos de amenidade que queremos buscar
const AMENITY_CONFIG: Record<string, { label: string; emoji: string }> = {
  hospital:        { label: 'Saúde',      emoji: '🏥' },
  clinic:          { label: 'Saúde',      emoji: '🏥' },
  doctors:         { label: 'Saúde',      emoji: '🏥' },
  police:          { label: 'Segurança',  emoji: '🚔' },
  social_facility: { label: 'Apoio',      emoji: '🤝' },
  pharmacy:        { label: 'Farmácia',   emoji: '💊' },
};

const AMENITY_FILTER = Object.keys(AMENITY_CONFIG).join('|');

// Haversine — retorna distância em metros
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1).replace('.', ',')} km`;
}

export interface NearbyPlacesResult {
  places: NearbyPlace[];
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  refresh: () => void;
}

let _rev = 0;

export function useNearbyPlaces(radiusM = 2500): NearbyPlacesResult {
  const [places, setPlaces]                   = useState<NearbyPlace[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [rev, setRev]                         = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setPermissionDenied(false);

      // 1. Pede permissão
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!cancelled) {
          setPermissionDenied(true);
          setLoading(false);
        }
        return;
      }

      // 2. Obtém posição
      let coords: { latitude: number; longitude: number };
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        coords = pos.coords;
      } catch {
        if (!cancelled) {
          setError('Não foi possível obter sua localização.');
          setLoading(false);
        }
        return;
      }

      const { latitude: lat, longitude: lon } = coords;

      // 3. Consulta Overpass API
      const query = `
        [out:json][timeout:15];
        (
          node["amenity"~"${AMENITY_FILTER}"](around:${radiusM},${lat},${lon});
          way["amenity"~"${AMENITY_FILTER}"](around:${radiusM},${lat},${lon});
        );
        out body center 30;
      `.trim();

      try {
        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(query)}`,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        const parsed: NearbyPlace[] = (json.elements as any[])
          .filter((el) => el.tags?.name)
          .map((el) => {
            const elLat: number = el.lat ?? el.center?.lat ?? 0;
            const elLon: number = el.lon ?? el.center?.lon ?? 0;
            const amenity: string = el.tags.amenity ?? '';
            const cfg = AMENITY_CONFIG[amenity] ?? { label: 'Local', emoji: '📍' };
            return {
              id:        String(el.id),
              name:      el.tags.name,
              type:      cfg.label,
              emoji:     cfg.emoji,
              distanceM: haversine(lat, lon, elLat, elLon),
              lat:       elLat,
              lon:       elLon,
            };
          })
          .sort((a, b) => a.distanceM - b.distanceM)
          .slice(0, 20);

        if (!cancelled) {
          setPlaces(parsed);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Erro ao buscar locais próximos.');
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [rev, radiusM]);

  return {
    places,
    loading,
    error,
    permissionDenied,
    refresh: () => setRev((v) => v + 1),
  };
}

export { formatDistance };
