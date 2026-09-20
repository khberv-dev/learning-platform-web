// Environment access is centralised here rather than reading import.meta.env
// in feature code. The one exception is the token-refresh call in
// services/api.js, which must bypass the shared axios instance.
//
// The API base is normalised to end with a slash, since it is joined with
// relative paths like "admin/stats/summary". File URLs need no base: the API
// returns them absolute.
function withTrailingSlash(url) {
    if (!url) return '';
    return url.endsWith('/') ? url : `${url}/`;
}

const config = {
    apiBaseUrl: withTrailingSlash(import.meta.env.VITE_BASE_API_URL),
};

export default config;
