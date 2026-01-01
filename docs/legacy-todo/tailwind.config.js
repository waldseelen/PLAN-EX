export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: '#0f0f0f',      // Core dark background
                surface: '#13131a',         // Panels + cards
                surfaceElevated: '#181c24', // Hover/raised surfaces
                surfaceMuted: '#1f2430',    // Sub-panels
                primary: '#00AEEF',         // Electric cyan
                primaryAlt: '#29C6CD',      // Turquoise for gradients
                accent: '#FFD200',          // Gold accent
                accentAlt: '#F4E04D',       // Soft gold for gradients
                text: {
                    main: '#F8FBFF',        // Primary text
                    muted: '#9AA7C1',       // Secondary text
                    subtle: '#6F7A91',      // Tertiary text
                },
                glass: 'rgba(255, 255, 255, 0.06)',
                stroke: 'rgba(255, 255, 255, 0.08)',
                glow: 'rgba(0, 174, 239, 0.35)',
            },
            boxShadow: {
                glow: '0 0 24px rgba(0, 174, 239, 0.35)',
                'glow-sm': '0 0 12px rgba(0, 174, 239, 0.25)',
                card: '0 18px 40px rgba(0, 0, 0, 0.45)',
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.25rem',    // 20px for cards
                '3xl': '1.5rem',     // 24px
                'pill': '9999px',    // Full pill shape
            },
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
                orbitron: ['Orbitron', 'sans-serif'],
                montserrat: ['Montserrat', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'float': 'float 0.2s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(-5px)' },
                }
            }
        },
    },
    plugins: [],
}
