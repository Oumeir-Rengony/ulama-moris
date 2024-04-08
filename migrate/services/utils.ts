export function createSearchParams(params) {
    return new URLSearchParams(Object.entries(params).flatMap(([key, values]) => Array.isArray(values) 
        ? values.map((value) => [key, value]) 
        : [[key, values]]));
}