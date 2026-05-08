import { describe, it, expect } from 'vitest';
import { PRCommentFormatter } from './pr-comment-formatter';
import type { CheckResult } from './pr-comment-formatter';

function makeError(
	overrides: Partial<CheckResult> = {},
): CheckResult {
	return {
		line: 1,
		column: 1,
		type: 'ERROR',
		code: 'test_error_code',
		message: 'Test error message',
		...overrides,
	};
}

function makeWarning(
	overrides: Partial<CheckResult> = {},
): CheckResult {
	return {
		line: 1,
		column: 1,
		type: 'WARNING',
		code: 'test_warning_code',
		message: 'Test warning message',
		...overrides,
	};
}

describe('PRCommentFormatter', () => {
	describe('getSummary', () => {
		it('returns zero counts when no results are provided', () => {
			const formatter = new PRCommentFormatter();
			expect(formatter.getSummary()).toEqual({
				totalIssues: 0,
				totalErrors: 0,
				totalWarnings: 0,
			});
		});

		it('counts errors correctly', () => {
			const map = new Map<string, CheckResult[]>([
				['file.php', [makeError(), makeError()]],
			]);
			const formatter = new PRCommentFormatter(map);
			expect(formatter.getSummary()).toEqual({
				totalIssues: 2,
				totalErrors: 2,
				totalWarnings: 0,
			});
		});

		it('counts warnings correctly', () => {
			const map = new Map<string, CheckResult[]>([
				['file.php', [makeWarning(), makeWarning(), makeWarning()]],
			]);
			const formatter = new PRCommentFormatter(map);
			expect(formatter.getSummary()).toEqual({
				totalIssues: 3,
				totalErrors: 0,
				totalWarnings: 3,
			});
		});

		it('counts mixed errors and warnings correctly', () => {
			const map = new Map<string, CheckResult[]>([
				['file.php', [makeError(), makeWarning()]],
				['other.php', [makeError()]],
			]);
			const formatter = new PRCommentFormatter(map);
			expect(formatter.getSummary()).toEqual({
				totalIssues: 3,
				totalErrors: 2,
				totalWarnings: 1,
			});
		});

		it('ignores files with empty results arrays', () => {
			const map = new Map<string, CheckResult[]>([
				['file.php', []],
			]);
			const formatter = new PRCommentFormatter(map);
			expect(formatter.getSummary()).toEqual({
				totalIssues: 0,
				totalErrors: 0,
				totalWarnings: 0,
			});
		});
	});

	describe('getComment', () => {
		it('returns a success comment when there are no issues', () => {
			const formatter = new PRCommentFormatter();
			const comment = formatter.getComment();
			expect(comment).toContain('✅');
			expect(comment).toContain('Passed');
			expect(comment).toContain('No errors or warnings found');
		});

		it('returns a failure comment when there are errors', () => {
			const map = new Map<string, CheckResult[]>([
				['plugin-file.php', [makeError({ message: 'Bad code here' })]],
			]);
			const formatter = new PRCommentFormatter(map);
			const comment = formatter.getComment();
			expect(comment).toContain('❌');
			expect(comment).toContain('Failed');
			expect(comment).toContain('plugin-file.php');
			expect(comment).toContain('Bad code here');
		});

		it('returns a warning comment when there are only warnings', () => {
			const map = new Map<string, CheckResult[]>([
				['plugin-file.php', [makeWarning({ message: 'Style issue' })]],
			]);
			const formatter = new PRCommentFormatter(map);
			const comment = formatter.getComment();
			expect(comment).toContain('⚠️');
			expect(comment).toContain('Passed with warnings');
			expect(comment).toContain('plugin-file.php');
			expect(comment).toContain('Style issue');
		});

		it('includes the plugin check action link', () => {
			const formatter = new PRCommentFormatter();
			const comment = formatter.getComment();
			expect(comment).toContain('WordPress Plugin Check Action');
		});

		it('includes summary table with correct counts', () => {
			const map = new Map<string, CheckResult[]>([
				['file.php', [makeError(), makeWarning()]],
			]);
			const formatter = new PRCommentFormatter(map);
			const comment = formatter.getComment();
			expect(comment).toContain('**2**'); // total issues
			expect(comment).toContain('**1**'); // errors and warnings count
		});

		it('decodes HTML entities in error messages', () => {
			const map = new Map<string, CheckResult[]>([
				[
					'file.php',
					[
						makeError({
							message:
								'Class &quot;MyPlugin&quot; has no parent &amp; no interface',
						}),
					],
				],
			]);
			const formatter = new PRCommentFormatter(map);
			const comment = formatter.getComment();
			expect(comment).toContain(
				'Class "MyPlugin" has no parent & no interface',
			);
		});
	});
});
