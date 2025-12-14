const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

export function getBaseUrl() {
    return BASE_URL;
}