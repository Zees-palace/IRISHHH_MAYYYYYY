import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves project sites from /REPOSITORY-NAME/
export default defineConfig({
  plugins: [react()],
  base: '/IRISHHH_MAYYYYYY/',
});