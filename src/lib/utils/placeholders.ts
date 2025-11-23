/**
 * Creative placeholder names for wedding photo uploads
 * A collection of fun, whimsical, and wedding-appropriate placeholder names
 * that rotate randomly to make the form more engaging
 */

const CREATIVE_PLACEHOLDERS = [
	// Mysterious & Enigmatic
	'The Mysterious Guest',
	'Someone Special',
	'The Anonymous Hero',
	'Secret Admirer',
	'The Phantom Photographer',
	'Mystery Contributor',
	'The Unknown Guest',
	'Anon E. Mouse',
	'The Shadow Snapper',
	'Incognito Celebrant',

	// Playful & Fun
	'Captain Snaps-a-Lot',
	'Photo Ninja',
	'Sir Clicks-a-Lot',
	'Madame Shutterbug',
	'The Memory Maker',
	'Photo Fairy',
	'Snap Happy',
	'Click Master',
	'The Shutter Wizard',
	'Captain Awesome',
	'Photo Wizard',
	'The Snapshot Sorcerer',
	'Clickety-Clack',
	'The Flash Master',
	'Snap Dragon',
	'Photo Phantom',
	'The Click Commander',
	'Snap Champion',
	'Photo Genius',
	'The Shutter Sage',

	// Wedding-Themed
	'Wedding Photo Ninja',
	'Love Story Contributor',
	'Wedding Memory Maker',
	'Celebration Capturer',
	'Happily Ever After Helper',
	'Wedding Witness',
	'Love Story Teller',
	'Celebration Chronicler',
	'Wedding Wonder',
	'Joyful Jotter',
	'Wedding Whisperer',
	'Love Lens',
	'Celebration Creator',
	'Wedding Warrior',
	'Happily Ever After Hero',

	// Whimsical & Creative
	'The Photo Poet',
	'Memory Magician',
	'Snapshot Storyteller',
	'The Moment Maker',
	'Photo Philosopher',
	'The Shutter Shaman',
	'Memory Merchant',
	'Snapshot Sage',
	'The Click Chronicler',
	'Photo Pioneer',
	'The Memory Maven',
	'Snapshot Scholar',
	'The Shutter Scribe',
	'Photo Pilgrim',
	'The Moment Maven',
	'Snapshot Seeker',
	'The Click Collector',
	'Photo Pathfinder',
	'The Memory Mapper',
	'Snapshot Scout',

	// Character-Inspired
	'Ansel Adams Jr.',
	'Henri Cartier-Bresson Lite',
	'Dorothea Lange Lookalike',
	'Vivian Maier Fan',
	'Steve McCurry Apprentice',
	'The Next Ansel',
	'Cartier-Bresson Wannabe',
	'Modern Day Mathew Brady',

	// Food & Fun
	'Cake Connoisseur',
	'Champagne Snapper',
	'Wedding Cake Critic',
	'Toast Master',
	'Dance Floor Documentarian',
	'Reception Recorder',
	'Party Photographer',
	'Celebration Capturer',

	// Nature & Seasonal
	'Spring Snapper',
	'Summer Shutterbug',
	'Autumn Artist',
	'Winter Wonder',
	'Bloom Photographer',
	'Sunset Snapper',
	'Starlight Storyteller',
	'Moonlight Memory Maker',

	// Tech-Inspired (Playful)
	'Pixel Perfect',
	'Megapixel Master',
	'Resolution Ruler',
	'Filter Fanatic',
	'Lens Legend',
	'Aperture Artist',
	'Shutter Speedster',
	'ISO Innovator',
	'F-Stop Fan',
	'Bokeh Boss',

	// Action & Adventure
	'The Photo Explorer',
	'Memory Adventurer',
	'Snapshot Seeker',
	'The Click Crusader',
	'Photo Pathfinder',
	'The Shutter Scout',
	'Memory Mountaineer',
	'Snapshot Sailor',
	'The Click Climber',
	'Photo Pilot',

	// Royal & Regal
	'Photo Prince',
	'Snapshot Sovereign',
	'The Click King',
	'Memory Monarch',
	'Photo Princess',
	'Snapshot Duchess',
	'The Shutter Baron',
	'Click Countess',

	// Superhero-Inspired
	'Captain Camera',
	'Photo Man',
	'Snapshot Superhero',
	'The Flash (Photographer)',
	'Memory Marvel',
	'Click Crusader',
	'Photo Protector',
	'The Shutter Shield',

	// Literary & Artistic
	'The Photo Poet',
	'Snapshot Shakespeare',
	'Memory Monet',
	'Click Caravaggio',
	'Photo Picasso',
	'The Shutter Scribe',
	'Snapshot Storyteller',
	'Memory Musician',
] as const;

/**
 * Gets a random creative placeholder name
 * @returns A randomly selected placeholder string
 */
export function getRandomPlaceholder(): string {
	const randomIndex = Math.floor(Math.random() * CREATIVE_PLACEHOLDERS.length);
	return CREATIVE_PLACEHOLDERS[randomIndex];
}

/**
 * Gets all available placeholders (useful for testing or display)
 * @returns Array of all placeholder strings
 */
export function getAllPlaceholders(): readonly string[] {
	return CREATIVE_PLACEHOLDERS;
}

