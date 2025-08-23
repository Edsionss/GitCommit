import type { GitCommit } from '@shared/types/dtos/git.dto';

export const exportApi = {
  exportCommits: (
    commits: GitCommit[],
    format: 'json' | 'csv'
  ): Promise<string | null> => window.api.exportCommits(commits, format),
};
