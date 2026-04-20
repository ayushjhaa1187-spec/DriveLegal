/**
 * DriveLegal Destination Lookup Service
 * Maps localities/RTO codes to official addresses
 */

export interface LegalTarget {
  name: string;
  address: string;
  type: "RTO" | "Police";
}

const DELHI_TARGETS: Record<string, LegalTarget> = {
  "Central Delhi": {
    name: "Deputy Commissioner of Police (Traffic), Central Range",
    address: "New Delhi Traffic Police Headquarters, Todapur, New Delhi - 110012",
    type: "Police"
  },
  "New Delhi": {
    name: "New Delhi Traffic Police (NDMC Area)",
    address: "Traffic Police Lines, Teen Murti Lane, New Delhi - 110011",
    type: "Police"
  },
  "IGI Airport": {
    name: "Traffic Police Office, IGI Airport",
    address: "Terminal 1/3 Approach, IGI Airport, New Delhi - 110037",
    type: "Police"
  }
};

const BENGALURU_TARGETS: Record<string, LegalTarget> = {
  "Bengaluru East": {
    name: "Assistant Commissioner of Police (Traffic), East Division",
    address: "#01, Shivajinagar Traffic Police Station, Bengaluru - 560001",
    type: "Police"
  },
  "Bengaluru South": {
    name: "Assistant Commissioner of Police (Traffic), South Division",
    address: "Madhavan Park, Jayanagar 1st Block, Bengaluru - 560011",
    type: "Police"
  },
  "Electronic City": {
    name: "Electronic City Traffic Police Station",
    address: "Hosur Road, Electronic City Phase 1, Bengaluru - 560100",
    type: "Police"
  }
};

export function suggestLegalDestination(city: string, locality?: string): LegalTarget | null {
  const normCity = city.toLowerCase();
  if (normCity.includes("delhi")) {
    if (locality?.includes("CP") || locality?.includes("Lutyens")) return DELHI_TARGETS["New Delhi"];
    if (locality?.includes("Airport")) return DELHI_TARGETS["IGI Airport"];
    return DELHI_TARGETS["Central Delhi"];
  }
  
  if (normCity.includes("bengaluru") || normCity.includes("bangalore")) {
    if (locality?.includes("Silk Board") || locality?.includes("Jayanagar")) return BENGALURU_TARGETS["Bengaluru South"];
    if (locality?.includes("Electronic City")) return BENGALURU_TARGETS["Electronic City"];
    return BENGALURU_TARGETS["Bengaluru East"];
  }

  return null;
}
