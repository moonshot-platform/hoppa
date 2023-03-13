import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [],
	base: '/hoppa/',
	server: { host: '127.0.0.1', port: 8000 },
	clearScreen: false,
})
