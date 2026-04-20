/**
 * DriveLegal VIP Corridor Detection
 * Utility to identify high-priority/high-enforcement zones
 */

export interface VIPCorridor {
  name: string;
  city: "Delhi" | "Bengaluru";
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  alertMessage: string;
}

export const VIP_CORRIDORS: VIPCorridor[] = [
  // DELHI VIP ZONES
  {
    name: "Lutyens' Delhi",
    city: "Delhi",
    bounds: { minLat: 28.58, maxLat: 28.62, minLng: 77.18, maxLng: 77.24 },
    alertMessage: "High-security VIP zone. Special parking and traffic rules active near Central Secretariat."
  },
  {
    name: "IGI Airport Approach",
    city: "Delhi",
    bounds: { minLat: 28.52, maxLat: 28.56, minLng: 77.06, maxLng: 77.12 },
    alertMessage: "Strict lane discipline and overspeeding enforcement on NH48 airport stretches."
  },
  {
    name: "Connaught Place",
    city: "Delhi",
    bounds: { minLat: 28.62, maxLat: 28.64, minLng: 77.21, maxLng: 77.23 },
    alertMessage: "High parking and entry restriction enforcement in the Inner/Outer circles."
  },

  // BENGALURU VIP ZONES
  {
    name: "Silk Board Junction",
    city: "Bengaluru",
    bounds: { minLat: 12.91, maxLat: 12.93, minLng: 77.62, maxLng: 77.63 },
    alertMessage: "Extreme enforcement for lane discipline and signal violations at Silk Board."
  },
  {
    name: "Electronic City Corridor",
    city: "Bengaluru",
    bounds: { minLat: 12.83, maxLat: 12.87, minLng: 77.65, maxLng: 77.68 },
    alertMessage: "Strict speeding enforcement on Hosur Rd / E-City Flyover. 2W/3W strictly prohibited on flyover."
  },
  {
    name: "Airport Corridor",
    city: "Bengaluru",
    bounds: { minLat: 13.04, maxLat: 13.20, minLng: 77.58, maxLng: 77.65 },
    alertMessage: "Speed cams active on Bellary Rd. Highway speeding rules strictly enforced."
  }
];

/** Check if a location is within a VIP corridor */
export function checkVIPAlert(lat: number, lng: number): VIPCorridor | null {
  return VIP_CORRIDORS.find(c => 
    lat >= c.bounds.minLat && lat <= c.bounds.maxLat &&
    lng >= c.bounds.minLng && lng <= c.bounds.maxLng
  ) || null;
}
