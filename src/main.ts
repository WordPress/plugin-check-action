import { setFailed, error, warning } from '@actions/core';
import { existsSync, readFileSync } from 'node:fs';

const args = process.argv.slice(2);

const file = args[0];

if (!existsSync(file)) {
	setFailed('Results file does not exist.');
}

const fileContents = existsSync(file)
	? readFileSync(file, { encoding: 'utf8' }).split('\n')
	: [];

type Result = {
	line: number;
	column: number;
	type: 'WARNING' | 'ERROR';
	code: string;
	message: string;
};

for (let i = 0; i < fileContents.length - 1; i++) {
	const line = fileContents[i];
	if (!line.startsWith('FILE: ')) {
		continue;
	}

	const fileName = line.split('FILE: ')[1];
	const results: Result[] = JSON.parse(fileContents[++i]) || [];

	for (const result of results) {
		if (result.type === 'ERROR') {
			setFailed('Errors found by plugin check.');
		}
		const func = result.type === 'ERROR' ? error : warning;
		func(result.message, {
			title: result.code,
			file: fileName,
			startLine: result.line,
			startColumn: result.column,
		});
	}
}
