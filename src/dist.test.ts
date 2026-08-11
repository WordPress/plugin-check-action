import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const rootDir = join(__dirname, '..');
const bundle = join(rootDir, 'dist', 'index.js');
const fixturesDir = join(rootDir, 'tests', 'fixtures');

function runBundle(fixture: string) {
	return spawnSync(process.execPath, [bundle, join(fixturesDir, fixture)], {
		encoding: 'utf8',
		env: {
			...process.env,
			// Keep the run offline: without a token the PR comment step bails out early.
			INPUT_REPO_TOKEN: '',
			'INPUT_REPO-TOKEN': '',
			GITHUB_EVENT_PATH: '',
			STRICT: 'false',
		},
	});
}

describe('dist/index.js', () => {
	it('bundles its dependencies instead of stubbing them out', () => {
		// ncc only warns when it cannot resolve a dependency, and emits a stub that
		// throws "Cannot find module" at runtime. See #609.
		expect(readFileSync(bundle, 'utf8')).not.toContain('webpackMissingModule');
	});

	it('reports errors and warnings as annotations', () => {
		const { status, stdout, stderr } = runBundle('results-with-errors.txt');

		expect(stderr).toBe('');
		expect(stdout).toContain(
			'::error title=plugin_review_phpcs,file=/path/to/plugin/plugin-file.php,line=10,col=1::Missing file doc comment',
		);
		expect(stdout).toContain(
			'::warning title=plugin_review_phpcs,file=/path/to/plugin/includes/class-my-plugin.php,line=5,col=1::Class "My_Plugin" has no parent class',
		);
		expect(status).toBe(1);
	});

	it('succeeds when there is nothing to report', () => {
		const { status, stdout, stderr } = runBundle('results-empty.txt');

		expect(stderr).toBe('');
		expect(stdout).not.toContain('::error');
		expect(status).toBe(0);
	});
});
