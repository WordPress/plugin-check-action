import { describe, it, expect } from 'vitest';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const actionYml = readFileSync(join(__dirname, '..', 'action.yml'), 'utf8');

/**
 * The step that assembles .wp-env.json runs an inline Node script. Pull it back
 * out of action.yml so its behaviour can be exercised directly.
 */
function wpEnvConfigScript(): string {
	const match = actionYml.match(/node -e '([\s\S]*?)'\n/);

	if (!match) {
		throw new Error('Could not find the wp-env config script in action.yml');
	}

	return match[1];
}

function buildWpEnvConfig(
	existing: Record<string, unknown> | null,
	wpVersion = 'null',
): Record<string, unknown> {
	const file = join(mkdtempSync(join(tmpdir(), 'wp-env-')), '.wp-env.json');

	if (existing) {
		writeFileSync(file, JSON.stringify(existing));
	}

	execFileSync(process.execPath, ['-e', wpEnvConfigScript()], {
		env: {
			...process.env,
			WP_ENV_JSON: file,
			WP_VERSION: wpVersion,
			PLUGIN_SLUG: 'my-plugin',
			PLUGIN_DIR: '/work/build',
		},
	});

	return JSON.parse(readFileSync(file, 'utf8'));
}

const TRUNK = '"WordPress/WordPress#master"';

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

	it('only excludes .wp-env.json when it generated one for Plugin Check', () => {
		expect(actionYml).toContain('WP_ENV_JSON_GENERATED');
		expect(actionYml).not.toContain('WP_ENV_JSON_EXISTS');
	});
});

describe('.wp-env.json', () => {
	it('is generated when the plugin does not provide one', () => {
		expect(buildWpEnvConfig(null)).toEqual({
			core: null,
			port: 8880,
			testsPort: 8881,
			mappings: {
				'wp-content/plugins/my-plugin': '/work/build',
			},
		});
	});

	it('pins core when a specific WordPress version was requested', () => {
		expect(buildWpEnvConfig(null, TRUNK).core).toBe(
			'WordPress/WordPress#master',
		);
	});

	it('keeps the config a plugin already provides', () => {
		const config = buildWpEnvConfig({
			config: { WP_DEBUG_DISPLAY: false, WP_DEBUG_LOG: true },
			plugins: ['./vendor/some-plugin'],
			port: 9999,
		});

		expect(config.config).toEqual({
			WP_DEBUG_DISPLAY: false,
			WP_DEBUG_LOG: true,
		});
		expect(config.plugins).toEqual(['./vendor/some-plugin']);
		expect(config.port).toBe(9999);
	});

	it('adds the plugin mapping without dropping existing ones', () => {
		const config = buildWpEnvConfig({
			mappings: { 'wp-content/mu-plugins/mu': './mu' },
		});

		expect(config.mappings).toEqual({
			'wp-content/mu-plugins/mu': './mu',
			'wp-content/plugins/my-plugin': '/work/build',
		});
	});

	it('keeps a core provided by the plugin unless one was requested', () => {
		const core = 'https://wordpress.org/wordpress-6.7.zip';

		expect(buildWpEnvConfig({ core }).core).toBe(core);
		expect(buildWpEnvConfig({ core }, TRUNK).core).toBe(
			'WordPress/WordPress#master',
		);
	});
});
