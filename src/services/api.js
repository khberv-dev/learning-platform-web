import axios from "axios";
import {baseApiUrl} from "@/services/config.js";

const refreshTokensPath = 'auth/refresh'

export const api = axios.create({
    baseURL: baseApiUrl
})

api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('access_token')

        if (accessToken && config.url !== refreshTokensPath) {
            config.headers['Authorization'] = `Bearer ${accessToken}`
        }

        return config
    },
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config

        if (error.response?.status !== 401 || config.url === refreshTokensPath) {
            return Promise.reject(error)
        }

        try {
            const refreshToken = localStorage.getItem('refresh_token')
            const {data} = await api.post(refreshTokensPath, {}, {
                headers: {Authorization: `Bearer ${refreshToken}`}
            })

            localStorage.setItem('access_token', data.accessToken)
            localStorage.setItem('refresh_token', data.refreshToken)

            config.headers['Authorization'] = `Bearer ${data.accessToken}`

            return api(config)
        } catch (err) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            window.location.href = '/login'
        }
    }
)
