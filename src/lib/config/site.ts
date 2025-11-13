/**
 * Site configuration for metadata and SEO
 */
export const siteConfig = {
	name: 'The Wedding of Alfina & Mugni',
	shortName: 'A&M Wedding',
	description: 'Bergabunglah bersama kami dalam perayaan cinta Alfina dan Mugni yang memulai perjalanan baru mereka. 29 November 2025 di Jakarta, Indonesia.',
	url: 'https://alfinamugni.wedding', // Update with actual domain when available
	language: 'id',
	locale: 'id_ID',
	themeColor: '#B3CBE4',
	backgroundColor: '#ffffff',
	wedding: {
		couple: {
			bride: 'Alfina',
			groom: 'Mugni'
		},
		date: '2025-11-29',
		ceremonyTime: '10:00',
		receptionTime: '18:00',
		location: {
			name: 'Jakarta Wedding Venue',
			address: 'Jakarta, Indonesia',
			addressCountry: 'ID'
		}
	},
	ogImage: '/photos/cover-hero.jpg', // Default OG image, can be replaced with dedicated 1200x630 image
	author: 'Alfina & Mugni'
} as const;

