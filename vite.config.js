import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {fileURLToPath} from 'node:url'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // `__dirname` doesn't exist in an ESM config file - resolve the
            // alias against this module's own URL instead.
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
})
