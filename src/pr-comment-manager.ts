import { getOctokit } from '@actions/github';
import { info, warning } from '@actions/core';

const COMMENT_IDENTIFIER = '<!-- wordpress-plugin-check-comment -->';

export interface PRCommentManagerOptions {
	token: string;
	owner: string;
	repo: string;
	prNumber: number;
}

export class PRCommentManager {
	private octokit: ReturnType<typeof getOctokit>;
	private owner: string;
	private repo: string;
	private prNumber: number;

	constructor(options: PRCommentManagerOptions) {
		this.octokit = getOctokit(options.token);
		this.owner = options.owner;
		this.repo = options.repo;
		this.prNumber = options.prNumber;
	}

	async postComment(commentBody: string): Promise<void> {
		await this.deleteExistingComments();
		await this.createComment(commentBody);
	}

	private async deleteExistingComments(): Promise<void> {
		try {
			info('Searching for existing plugin check comments...');

			const { data: comments } = await this.octokit.rest.issues.listComments({
				owner: this.owner,
				repo: this.repo,
				issue_number: this.prNumber,
			});

			const existingComments = comments.filter(comment =>
				comment.body?.includes(COMMENT_IDENTIFIER),
			);

			if (existingComments.length === 0) {
				info('No existing plugin check comments found.');
				return;
			}

			info(`Found ${existingComments.length} existing comment(s) to delete.`);

			for (const comment of existingComments) {
				try {
					await this.octokit.rest.issues.deleteComment({
						owner: this.owner,
						repo: this.repo,
						comment_id: comment.id,
					});
					info(`Deleted comment ID: ${comment.id}`);
				} catch (error) {
					warning(
						`Failed to delete comment ID ${comment.id}: ${error instanceof Error ? error.message : String(error)}`,
					);
				}
			}
		} catch (error) {
			warning(
				`Failed to fetch existing comments: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	private async createComment(commentBody: string): Promise<void> {
		try {
			info('Creating new plugin check comment...');

			const bodyWithIdentifier = commentBody.includes(COMMENT_IDENTIFIER)
				? commentBody
				: `${COMMENT_IDENTIFIER}\n\n${commentBody}`;

			await this.octokit.rest.issues.createComment({
				owner: this.owner,
				repo: this.repo,
				issue_number: this.prNumber,
				body: bodyWithIdentifier,
			});

			info('Successfully created plugin check comment.');
		} catch (error) {
			throw new Error(
				`Failed to create comment: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}
}
