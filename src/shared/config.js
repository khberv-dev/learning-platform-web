// Environment access is centralised here rather than reading import.meta.env
// in feature code. The one exception is the token-refresh call in
// services/api.js, which must bypass the shared axios instance.
//
// Both URLs are normalised to end with a slash: the API base is joined with
// relative paths like "stats/summary", and the CDN base with stored paths like
// "/public/avatars/x.png".
function withTrailingSlash(url) {
    if (!url) return '';
    return url.endsWith('/') ? url : `${url}/`;
}

const config = {
    apiBaseUrl: withTrailingSlash(import.meta.env.VITE_BASE_API_URL),
    cdnBaseUrl: withTrailingSlash(import.meta.env.VITE_BASE_CDN_URL),
};

export default config;
