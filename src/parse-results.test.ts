import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseResultsFile } from './parse-results';

const fixturesDir = join(__dirname, '..', 'tests', 'fixtures');

describe('parseResultsFile', () => {
	it('returns an empty map for an empty string', () => {
		const result = parseResultsFile('');
		expect(result.size).toBe(0);
	});

	it('returns an empty map when there are no FILE: lines', () => {
		const result = parseResultsFile('some random content\nanother line\n');
		expect(result.size).toBe(0);
	});

	it('parses a file with errors', () => {
		const content = readFileSync(
			join(fixturesDir, 'results-with-errors.txt'),
			'utf8',
		);
		const result = parseResultsFile(content);

		expect(result.size).toBe(2);
		expect(result.has('/path/to/plugin/plugin-file.php')).toBe(true);
		expect(
			result.has('/path/to/plugin/includes/class-my-plugin.php'),
		).toBe(true);

		const phpFileResults = result.get('/path/to/plugin/plugin-file.php')!;
		expect(phpFileResults).toHaveLength(2);
		expect(phpFileResults[0]).toEqual({
			line: 10,
			column: 1,
			type: 'ERROR',
			code: 'plugin_review_phpcs',
			message: 'Missing file doc comment',
		});
		expect(phpFileResults[1]).toEqual({
			line: 25,
			column: 5,
			type: 'ERROR',
			code: 'plugin_review_phpcs',
			message: 'Function comment is missing',
		});

		const classFileResults = result.get(
			'/path/to/plugin/includes/class-my-plugin.php',
		)!;
		expect(classFileResults).toHaveLength(1);
		expect(classFileResults[0].type).toBe('WARNING');
	});

	it('parses a file with only warnings', () => {
		const content = readFileSync(
			join(fixturesDir, 'results-with-warnings.txt'),
			'utf8',
		);
		const result = parseResultsFile(content);

		expect(result.size).toBe(1);
		const fileResults = result.get('/path/to/plugin/plugin-file.php')!;
		expect(fileResults).toHaveLength(2);
		expect(fileResults[0].type).toBe('WARNING');
		expect(fileResults[1].type).toBe('WARNING');
	});

	it('parses a file with empty results array', () => {
		const content = readFileSync(
			join(fixturesDir, 'results-empty.txt'),
			'utf8',
		);
		const result = parseResultsFile(content);

		expect(result.size).toBe(1);
		const fileResults = result.get('/path/to/plugin/plugin-file.php')!;
		expect(fileResults).toHaveLength(0);
	});
});
