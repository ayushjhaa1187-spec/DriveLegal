import { STATE_CODES, STATE_NAME_TO_CODE } from "./state-codes";

interface GeoResult {
  stateCode: string | null;
  stateName: string | null;
  source: "gps" | "ip" | "manual";
  confidence: "high" | "medium" | "low";
}

export async function detectUserState(): Promise<GeoResult> {
  try {
    const position = await getGPSPosition();
    const stateCode = await reverseGeocode(
      position.coords.latitude,
      position.coords.longitude
    );
    if (stateCode) {
      return {
        stateCode,
        stateName: STATE_CODES[stateCode] ?? null,
        source: "gps",
        confidence: "high",
      };
    }
  } catch {
    // GPS not available
  }

  try {
    const response = await fetch("/api/geo");
    if (response.ok) {
      const data = await response.json();
      if (data.stateCode) {
        return {
          stateCode: data.stateCode,
          stateName: STATE_CODES[data.stateCode] ?? null,
          source: "ip",
          confidence: "medium",
        };
      }
    }
  } catch {
    // IP detection failed
  }

  return { stateCode: null, stateName: null, source: "manual", confidence: "low" };
}

function getGPSPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 5000,
      maximumAge: 10 * 60 * 1000,
      enableHighAccuracy: false,
    });
  });
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=5`;
  const response = await fetch(url, {
    headers: { "User-Agent": "DriveLegal/1.0" },
  });
  if (!response.ok) return null;
  const data = await response.json();
  const stateName = (data.address?.state ?? "").toLowerCase().trim();
  return STATE_NAME_TO_CODE[stateName] ?? null;
}
