import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Ortam değişkenlerini (.env) yükle
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    
    // Geliştirme sunucusu ayarları (npm run dev)
    server: {
      port: 8080,
      host: '0.0.0.0',
    },

    // Canlı yayın / Önizleme ayarları (npm run preview)
    // Cloud Run genelde burayı veya build çıktısını kullanır
    preview: {
      port: 8080,
      host: '0.0.0.0',
      allowedHosts: true, // HATA ÇÖZÜMÜ: Tüm domainlere izin ver
    },

    // Env değişkenlerini frontend'e aktarma
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },

    // Dosya yolu kısaltmaları (@/components gibi)
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    }
  };
});