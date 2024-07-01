import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        glsl()
    ],
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/index.ts'),
                html: resolve(__dirname, 'index.html')
            },
            output: {
                dir: resolve(__dirname, 'dist'),
                // format: 'iife',  // Output format as an Immediately Invoked Function Expression,
                inlineDynamicImports: false,
            }
        }
    }
});
