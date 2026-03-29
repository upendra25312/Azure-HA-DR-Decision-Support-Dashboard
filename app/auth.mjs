export async function loadAuthState() {
    try {
        const response = await fetch("/.auth/me", {
            headers: {
                Accept: "application/json"
            }
        });

        if (!response.ok) {
            return anonymousAuthState();
        }

        const payload = await response.json();
        const principal = payload?.clientPrincipal || payload?.[0]?.clientPrincipal || null;

        if (!principal) {
            return anonymousAuthState();
        }

        const rawRoles = Array.isArray(principal.userRoles) ? principal.userRoles : [];
        const normalizedRoles = rawRoles
            .map((role) => role.toLowerCase())
            .filter((role) => role && role !== "anonymous");

        if (!normalizedRoles.includes("authenticated")) {
            normalizedRoles.unshift("authenticated");
        }

        return {
            isAuthenticated: true,
            displayName: principal.userDetails || principal.userId || "Authenticated user",
            identityProvider: principal.identityProvider || "aad",
            roles: normalizedRoles
        };
    } catch (error) {
        return anonymousAuthState();
    }
}

export function anonymousAuthState() {
    return {
        isAuthenticated: false,
        displayName: "Public visitor",
        identityProvider: "public",
        roles: ["public"]
    };
}

export function hasRole(authState, allowedRoles = []) {
    if (!allowedRoles.length) {
        return true;
    }

    const normalized = new Set((authState?.roles || []).map((role) => role.toLowerCase()));
    return allowedRoles.some((role) => normalized.has(role.toLowerCase()));
}
