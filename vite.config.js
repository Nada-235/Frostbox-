import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Served as a GitHub Pages project site at github.com/Nada-235/Frostbox-,
  // i.e. https://nada-235.github.io/Frostbox-/ — asset URLs need that
  // subpath prefix, not root. Local dev/preview stay at '/'.
  base: process.env.GITHUB_ACTIONS ? '/Frostbox-/' : '/',
  plugins: [react(), tailwindcss()],
});
