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

			const bodyWithIdentifier = commentBody.includes(COMMENT_IDENTIFIER)
				? commentBody
				: `${COMMENT_IDENTIFIER}\n\n${commentBody}`;

			if (existingComments.length > 0) {
				info(`Found ${existingComments.length} existing comment(s).`);

				// Update the last comment
				const lastComment = existingComments[existingComments.length - 1];
				await this.updateComment(lastComment.id, bodyWithIdentifier);

				// Delete any duplicates
				if (existingComments.length > 1) {
					info('Deleting duplicate comments...');
					for (let i = 0; i < existingComments.length - 1; i++) {
						await this.deleteComment(existingComments[i].id);
					}
				}
			} else {
				await this.createComment(bodyWithIdentifier);
			}
		} catch (error) {
			warning(
				`Failed to post/update comment: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	private async createComment(commentBody: string): Promise<void> {
		try {
			info('Creating new plugin check comment...');
			await this.octokit.rest.issues.createComment({
				owner: this.owner,
				repo: this.repo,
				issue_number: this.prNumber,
				body: commentBody,
			});
			info('Successfully created plugin check comment.');
		} catch (error) {
			throw new Error(
				`Failed to create comment: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	private async updateComment(
		commentId: number,
		commentBody: string,
	): Promise<void> {
		try {
			info(`Updating comment ID: ${commentId}...`);
			await this.octokit.rest.issues.updateComment({
				owner: this.owner,
				repo: this.repo,
				comment_id: commentId,
				body: commentBody,
			});
			info('Successfully updated plugin check comment.');
		} catch (error) {
			throw new Error(
				`Failed to update comment: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	private async deleteComment(commentId: number): Promise<void> {
		try {
			await this.octokit.rest.issues.deleteComment({
				owner: this.owner,
				repo: this.repo,
				comment_id: commentId,
			});
			info(`Deleted comment ID: ${commentId}`);
		} catch (error) {
			warning(
				`Failed to delete comment ID ${commentId}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}
}
