import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [react(),tailwindcss()],
  build: {
    sourcemap: false, // Prevents your original code from being visible
    minify: 'terser', // Uses Terser to aggressively mangle variables
    terserOptions: {
      compress: {
        drop_console: true, // Removes all console.logs so devs can't see your data flow
        drop_debugger: true
      }
    }
  }
})