import { CheckResult } from './pr-comment-formatter';

/**
 * Parses the results file content produced by the WordPress Plugin Check action.
 *
 * The file format consists of alternating lines:
 * - A line starting with "FILE: " followed by the file path
 * - A JSON array of CheckResult objects for that file
 *
 * @param content - The full text content of the results file
 * @returns A map from file path to its array of check results
 */
export function parseResultsFile(
	content: string,
): Map<string, CheckResult[]> {
	const fileResultsMap = new Map<string, CheckResult[]>();
	const lines = content.split('\n');

	for (let i = 0; i < lines.length - 1; i++) {
		const line = lines[i];
		if (!line.startsWith('FILE: ')) {
			continue;
		}

		const fileName = line.split('FILE: ')[1];
		const results: CheckResult[] = JSON.parse(lines[++i]) || [];
		fileResultsMap.set(fileName, results);
	}

	return fileResultsMap;
}
