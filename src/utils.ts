/**
 * Decodes HTML entities in a string.
 * This handles common HTML entities found in WordPress Plugin Check output.
 *
 * @param text - The text containing HTML entities
 * @returns The decoded text
 */
export function decodeHtmlEntities(text: string): string {
	const entities: Record<string, string> = {
		'&quot;': '"',
		'&#034;': '"',
		'&apos;': "'",
		'&#039;': "'",
		'&amp;': '&',
		'&#038;': '&',
		'&lt;': '<',
		'&#060;': '<',
		'&gt;': '>',
		'&#062;': '>',
		'&nbsp;': ' ',
		'&#160;': ' ',
	};

	return text.replace(
		/&(?:#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g,
		match => entities[match] || match,
	);
}
