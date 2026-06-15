import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const actionYml = readFileSync(join(__dirname, '..', 'action.yml'), 'utf8');

describe('action.yml', () => {
	it('does not preload plugin-check from a download URL', () => {
		expect(actionYml).not.toContain('plugin-check.zip');
		expect(actionYml).toContain('wp plugin install plugin-check --activate');
	});

	it('verifies wp-env after starting it', () => {
		expect(actionYml).toMatch(
			/command:\s*\|\s*wp-env start --update\s+wp-env run cli wp cli info/,
		);
	});
});
