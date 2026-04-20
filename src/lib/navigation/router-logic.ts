/**
 * DriveLegal — Navigation Logic
 * ═══════════════════════════════════════════════════
 * Based on PART 2.3 spec.
 */

export type AppRoute =
  | { type: "home" }
  | { type: "calculator"; step?: 1 | 2 | 3 | "result"; violationId?: string }
  | { type: "ask"; sessionId?: string }
  | { type: "scan"; mode?: "upload" | "process" | "result" }
  | { type: "rights"; topicId?: string }
  | { type: "laws"; filter?: string; section?: string }
  | { type: "global"; countryCode?: string }
  | { type: "settings"; tab?: "language" | "state" | "theme" };

export type NavigationEvent =
  | { type: "NAVIGATE"; route: AppRoute }
  | { type: "BACK" }
  | { type: "DEEP_LINK"; url: string }
  | { type: "OFFLINE" }
  | { type: "ONLINE" };

export interface NavigationState {
  current: AppRoute;
  history: AppRoute[];
  isOffline: boolean;
  unavailableRoutes: AppRoute["type"][];
}

export function navigationReducer(
  state: NavigationState,
  event: NavigationEvent
): NavigationState {
  switch (event.type) {
    case "NAVIGATE":
      // Block navigation to network-dependent routes when offline
      if (state.isOffline && requiresNetwork(event.route)) {
        return state; // Show toast: "This feature needs internet"
      }
      return {
        ...state,
        current: event.route,
        history: [...state.history, state.current],
      };
    
    case "BACK":
      const previous = state.history[state.history.length - 1];
      if (!previous) return state;
      return {
        ...state,
        current: previous,
        history: state.history.slice(0, -1),
      };
    
    case "OFFLINE":
      return {
        ...state,
        isOffline: true,
        unavailableRoutes: ["ask", "scan"], // These need LLM API
      };
    
    case "ONLINE":
      return {
        ...state,
        isOffline: false,
        unavailableRoutes: [],
      };
    
    case "DEEP_LINK":
      const route = parseDeepLink(event.url);
      return route
        ? { ...state, current: route, history: [...state.history, state.current] }
        : state;
  }
}

function requiresNetwork(route: AppRoute): boolean {
  // Calculator + Rights + Laws work fully offline
  // Ask + Scan need LLM
  return route.type === "ask" || route.type === "scan";
}

function parseDeepLink(url: string): AppRoute | null {
  try {
    const path = new URL(url, "https://drivelegal.app").pathname;
    if (path === "/") return { type: "home" };
    if (path.startsWith("/calculator")) {
      const id = path.split("/")[2];
      return { type: "calculator", step: id ? "result" : 1, violationId: id };
    }
    if (path === "/ask") return { type: "ask" };
    if (path === "/scan") return { type: "scan", mode: "upload" };
    if (path === "/rights") return { type: "rights" };
    if (path === "/laws") return { type: "laws" };
    return null;
  } catch {
    return null;
  }
}
