import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Expiring Products',
        short_name: 'Expiring Products',
        description: 'Uma forma de controlar os produtos que estão próximos de vencer.',
        display: 'standalone',
        theme_color: '#6e6197',
        background_color: '#ffffff',
        start_url: '/',
        scope: '/',
        icons: [{ src: '/assets/img/favicon.png', sizes: '512x512', type: 'image/png' }],
      },
    }),
  ],
});
