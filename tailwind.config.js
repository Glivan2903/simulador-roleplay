/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                jet: {
                    bg: '#09090b',
                    surface: '#18181b',
                    border: '#27272a',
                    neon: '#3af35d',
                    neonHover: '#2ed94e',
                    textMuted: '#a1a1aa'
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
