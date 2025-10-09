import type { GitCommit } from '@sharedType/git'

export const exportApi = {
  exportCommits: (commits: GitCommit[], format: 'json' | 'csv'): Promise<string | null> =>
    window.api.exportCommits(commits, format)
}
