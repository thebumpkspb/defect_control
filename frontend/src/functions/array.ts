export function toUniqueList<T>(data: T[]): T[] {
    return [...new Set(data)];
}

export function isNotEmptyValue<T>(value: T): boolean {
    return value !== null && value !== undefined && value !== '';
}