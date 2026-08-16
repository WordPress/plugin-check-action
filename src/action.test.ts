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

	it('dumps debug state when plugin activation fails', () => {
		expect(actionYml).toContain('dump_debug_state()');

		// Both the dependency install and the plugin activation need to report
		// the environment state before bailing.
		expect(actionYml).toMatch(
			/if ! wp-env run cli wp plugin install --activate \$DEPENDENCIES; then[\s\S]*?dump_debug_state/,
		);
		expect(actionYml).toMatch(
			/if ! wp-env run cli wp plugin activate \$PLUGIN_SLUG; then[\s\S]*?dump_debug_state/,
		);
	});
});
