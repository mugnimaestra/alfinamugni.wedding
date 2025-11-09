/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				'wedding-navy': '#102336',
				'wedding-steel': '#5D88BB',
				'wedding-sky': '#B3CBE4',
				'wedding-silver': '#A1A8B2',
				'wedding-silver-light': '#D6D6D6',
				'wedding-white': '#FFFFFF',
				'wedding-accent': '#7799BB',
				'wedding-text-dark': '#102336',
				'wedding-text-light': '#5D88BB',
				'wedding-text-muted': '#A1A8B2',
			},
			fontFamily: {
				serif: ['Playfair Display', 'serif'],
				sans: ['Caudex', 'serif'],
			},
			animation: {
				bounce: 'bounce 2s infinite',
				slideDown: 'slideDown 0.5s ease-out',
				slideInLeft: 'slideInLeft 0.5s ease-out',
				fadeIn: 'fadeIn 0.5s ease-out',
				musicBar: 'musicBar 0.6s ease-in-out infinite',
			},
			keyframes: {
				bounce: {
					'0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0, 0, 0)' },
					'40%, 43%': { transform: 'translate3d(0, -30px, 0)' },
					'70%': { transform: 'translate3d(0, -15px, 0)' },
					'90%': { transform: 'translate3d(0, -4px, 0)' },
				},
				slideDown: {
					'0%': { transform: 'translateY(-10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				slideInLeft: {
					'0%': { transform: 'translateX(-20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				musicBar: {
					'0%, 100%': { transform: 'scaleY(0.3)' },
					'50%': { transform: 'scaleY(1)' },
				},
			},
		},
	},
	plugins: [],
};
