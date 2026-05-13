import { describe, it, expect } from 'vitest';
import { decodeHtmlEntities } from './utils';

describe('decodeHtmlEntities', () => {
	it('returns plain text unchanged', () => {
		expect(decodeHtmlEntities('Hello, world!')).toBe('Hello, world!');
	});

	it('decodes &quot; to double quote', () => {
		expect(decodeHtmlEntities('Say &quot;hello&quot;')).toBe(
			'Say "hello"',
		);
	});

	it("decodes &apos; to single quote", () => {
		expect(decodeHtmlEntities("It&apos;s fine")).toBe("It's fine");
	});

	it('decodes &amp; to ampersand', () => {
		expect(decodeHtmlEntities('Foo &amp; Bar')).toBe('Foo & Bar');
	});

	it('decodes &lt; to less-than sign', () => {
		expect(decodeHtmlEntities('a &lt; b')).toBe('a < b');
	});

	it('decodes &gt; to greater-than sign', () => {
		expect(decodeHtmlEntities('a &gt; b')).toBe('a > b');
	});

	it('decodes &nbsp; to space', () => {
		expect(decodeHtmlEntities('a&nbsp;b')).toBe('a b');
	});

	it('decodes decimal numeric entity', () => {
		expect(decodeHtmlEntities('&#65;')).toBe('A');
	});

	it('decodes hexadecimal numeric entity', () => {
		expect(decodeHtmlEntities('&#x41;')).toBe('A');
	});

	it('leaves unknown named entities unchanged', () => {
		expect(decodeHtmlEntities('&unknown;')).toBe('&unknown;');
	});

	it('decodes multiple entities in one string', () => {
		expect(
			decodeHtmlEntities(
				'Class &quot;My_Plugin&quot; has no parent &amp; no interface',
			),
		).toBe('Class "My_Plugin" has no parent & no interface');
	});
});
