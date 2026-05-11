export const hasPermission = ({
    permission,
    adminAllowed = [],
    adminDenied = [],
    roleAllowed = [],
    roleDenied = [],
}) => {
    if (!permission) return true;

    const matches = (rule, required) => {
        if (rule === "*") return true;  

        const ruleParts = rule.split(".");
        const requiredParts = required.split(".");

        for (let i = 0; i < ruleParts.length; i++) {
            if (ruleParts[i] === "*") return true;
            if (!requiredParts[i]) return false;
            if (ruleParts[i] !== requiredParts[i]) return false;
        }

        return true;
    };

    const isModuleLevel = !permission.includes(".");

    if (isModuleLevel) {
        if (adminDenied.some(rule => rule === permission)) return false;
        if (roleDenied.some(rule => rule === permission)) return false;
        if (adminAllowed.some(rule => rule === "*" || rule === permission || rule.startsWith(permission + "."))) return true;
        if (roleAllowed.some(rule => rule === "*" || rule === permission || rule.startsWith(permission + "."))) return true;
        return false;
    }

    // 1. Admin Denied
    for (const rule of adminDenied) {
        if (matches(rule, permission)) return false;
    }

    // 2. Role Denied
    for (const rule of roleDenied) {
        if (matches(rule, permission)) return false;
    }

    // 3. Admin Allowed
    for (const rule of adminAllowed) {
        if (matches(rule, permission)) return true;
    }

    // 4. Role Allowed
    for (const rule of roleAllowed) {
        if (matches(rule, permission)) return true;
    }

    return false;
};