import type { AiConfig, ChatMessage } from '@shared/types/dtos/ai'

export const aiApi = {
  exportCommits: (commits: GitCommit[], format: 'json' | 'csv'): Promise<string | null> =>
    window.api.exportCommits(commits, format)
}
