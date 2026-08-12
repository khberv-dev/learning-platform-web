import axios from 'axios';
import config from '@/shared/config.js';

export const apiClient = axios.create({
    baseURL: config.apiBaseUrl,
});

apiClient.interceptors.request.use((requestConfig) => {
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
        requestConfig.headers.Authorization = `Bearer ${accessToken}`;
    }

    return requestConfig;
});

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(callback) {
    refreshSubscribers.push(callback);
}

function onTokenRefreshed(accessToken) {
    refreshSubscribers.forEach((callback) => callback(accessToken));
    refreshSubscribers = [];
}

function redirectToLogin() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('roles');
    window.location.href = '/login';
}

// Sign-in and the refresh call itself report their own 401s to their own
// callers ("wrong credentials" / "refresh failed"); only a 401 from a normal
// endpoint means "this access token went stale" and is worth retrying.
const AUTH_ENDPOINTS = ['auth/sign-in', 'auth/refresh'];

function isAuthRequest(requestConfig) {
    return AUTH_ENDPOINTS.some((path) => requestConfig?.url?.includes(path));
}

// The global JwtAccessGuard rejects an expired/invalid access token with 401.
// 403 comes from RolesGuard instead - the token is fine, the role just isn't
// allowed on that route - so refreshing cannot help and 403s reject normally.
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const {config: requestConfig, response} = error;

        if (response?.status !== 401 || isAuthRequest(requestConfig)) {
            return Promise.reject(error);
        }

        // Already retried once with a fresh token and still 401 - the session is
        // genuinely dead rather than merely stale.
        if (requestConfig._retry) {
            redirectToLogin();
            return Promise.reject(error);
        }

        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
            redirectToLogin();
            return Promise.reject(error);
        }

        requestConfig._retry = true;

        // A refresh is already in flight (kicked off by another request) - queue
        // behind it instead of starting a second one.
        if (isRefreshing) {
            return new Promise((resolve) => {
                subscribeTokenRefresh((accessToken) => {
                    requestConfig.headers.Authorization = `Bearer ${accessToken}`;
                    resolve(apiClient(requestConfig));
                });
            });
        }

        isRefreshing = true;

        try {
            // POST auth/refresh is guarded by JwtRefreshGuard, which reads the
            // *refresh* token out of the Authorization header (ExtractJwt
            // .fromAuthHeaderAsBearerToken) - there is no request body. Sent
            // through bare axios so the request interceptor above can't
            // overwrite the header with the stale access token.
            const {data} = await axios.post(
                `${config.apiBaseUrl}auth/refresh`,
                null,
                {headers: {Authorization: `Bearer ${refreshToken}`}}
            );

            localStorage.setItem('accessToken', data.accessToken);
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }

            // Wake the requests that queued behind this refresh...
            onTokenRefreshed(data.accessToken);

            // ...then retry the one that triggered it. This can't go through
            // subscribeTokenRefresh - onTokenRefreshed already drained the list,
            // so subscribing now would never fire.
            requestConfig.headers.Authorization = `Bearer ${data.accessToken}`;
            return apiClient(requestConfig);
        } catch (refreshError) {
            refreshSubscribers = [];
            redirectToLogin();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);
