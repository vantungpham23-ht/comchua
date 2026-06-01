/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				cream: '#FFFBF0',
				coral: '#FF8FAB',
				coral_bright: '#FF7F50',
				butter: '#FFE169',
				charcoal: '#333333'
			},
			borderRadius: {
				'squircle': '2rem'
			},
			boxShadow: {
				'neo': '4px 4px 0px #333333',
				'neo-sm': '2px 2px 0px #333333'
			},
			animation: {
				'bounce-sm': 'bounce-sm 0.3s ease-in-out',
				'bounce-md': 'bounce-md 0.4s ease-in-out'
			},
			keyframes: {
				'bounce-sm': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(0.95)' }
				},
				'bounce-md': {
					'0%, 100%': { transform: 'scale(1)' },
					'40%': { transform: 'scale(0.92)' },
					'70%': { transform: 'scale(1.05)' }
				}
			}
		}
	},
	plugins: []
};
