
export function genUniqueID(): string {
    const a = Date.now().toString(36);
    const b = Math.random().toString(36).substring(2);
    return a + b;
}