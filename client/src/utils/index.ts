export const excerpt = (text: string, length = 200) => {
    if (text.length < length) return text;
    return `${text.slice(0, length)}...'`;
}

export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}