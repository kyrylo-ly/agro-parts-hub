export function escapeLike(str: string) {
    return str.replace(/[%_\\]/g, '\\$&');
}