import {
	setFailed,
	info,
	error,
	warning,
	getInput,
	startGroup,
	endGroup,
} from '@actions/core';
import { context } from '@actions/github';
import { existsSync, readFileSync } from 'node:fs';
import { PRCommentManager } from './pr-comment-manager';
import { PRCommentFormatter, CheckResult } from './pr-comment-formatter';

const args = process.argv.slice(2);

const file = args[0];

if (!existsSync(file)) {
	setFailed('Results file does not exist.');
}

const fileContents = existsSync(file)
	? readFileSync(file, { encoding: 'utf8' }).split('\n')
	: [];

const fileResultsMap = new Map<string, CheckResult[]>();

for (let i = 0; i < fileContents.length - 1; i++) {
	const line = fileContents[i];
	if (!line.startsWith('FILE: ')) {
		continue;
	}

	const fileName = line.split('FILE: ')[1];
	const results: CheckResult[] = JSON.parse(fileContents[++i]) || [];

	fileResultsMap.set(fileName, results);

	if (results.length > 0 && process.env.STRICT === 'true') {
		process.exitCode = 1;
	}

	for (const result of results) {
		if (result.type === 'ERROR') {
			process.exitCode = 1;
		}
		const func =
			result.type === 'ERROR' || process.env.STRICT === 'true'
				? error
				: warning;
		func(result.message, {
			title: result.code,
			file: fileName,
			startLine: result.line,
			startColumn: result.column,
		});
	}
}

async function postPRComment() {
	startGroup('Posting PR comment');

	try {
		const token = getInput('repo-token') || process.env.INPUT_REPO_TOKEN;
		const prNumber = context.payload.pull_request?.number;

		if (!token) {
			info('No GitHub token provided, skipping PR comment');
			return;
		}

		if (!prNumber) {
			info('Not a pull request, skipping PR comment');
			return;
		}

		const manager = new PRCommentManager({
			token,
			owner: context.repo.owner,
			repo: context.repo.repo,
			prNumber,
		});

		const formatter = new PRCommentFormatter(fileResultsMap);

		const commentBody = formatter.getComment();

		await manager.postComment(commentBody);
	} catch (err) {
		error(`Failed to post PR comment: ${err}`);
	}

	endGroup();
}

postPRComment();
