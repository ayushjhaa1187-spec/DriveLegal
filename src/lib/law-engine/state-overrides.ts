import type { StateOverride, VehicleType } from "@/types/violation";

export function getStateOverride(
  overrides: StateOverride[],
  section: string | null,
  stateCode: string | null,
  vehicleType: VehicleType | null
): StateOverride | null {
  if (!section || !stateCode) return null;

  const exactMatch = overrides.find(
    (o) =>
      o.state_code === stateCode &&
      o.section === section &&
      (o.applies_to.includes("all") ||
        (vehicleType && o.applies_to.includes(vehicleType)))
  );

  if (exactMatch) return exactMatch;

  const sectionMatch = overrides.find(
    (o) => o.state_code === stateCode && o.section === section
  );

  return sectionMatch ?? null;
}

export function getStateOverrides(
  allOverrides: StateOverride[],
  stateCode: string
): StateOverride[] {
  return allOverrides.filter((o) => o.state_code === stateCode);
}
