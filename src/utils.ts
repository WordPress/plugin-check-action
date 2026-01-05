/**
 * Decodes HTML entities in a string.
 * This handles common HTML entities found in WordPress Plugin Check output.
 *
 * @param text - The text containing HTML entities
 * @returns The decoded text
 */
export function decodeHtmlEntities(text: string): string {
	const namedEntities: Record<string, string> = {
		'&quot;': '"',
		'&apos;': "'",
		'&amp;': '&',
		'&lt;': '<',
		'&gt;': '>',
		'&nbsp;': ' ',
	};

	return text.replace(
		/&(?:#x([0-9a-fA-F]+)|#(\d+)|([a-zA-Z]+));/g,
		(match, hex, dec, named) => {
			if (hex) {
				// Hexadecimal entity
				return String.fromCharCode(parseInt(hex, 16));
			}
			if (dec) {
				// Decimal entity
				return String.fromCharCode(parseInt(dec, 10));
			}
			if (named && namedEntities[`&${named};`]) {
				// Named entity
				return namedEntities[`&${named};`];
			}
			// Unknown entity, return as-is
			return match;
		},
	);
}
