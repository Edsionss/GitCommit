import type { RepoHistoryItem } from '@preload/index.d.ts';

export const historyApi = {
  getHistory: (): Promise<RepoHistoryItem[]> => window.api.getHistory(),
  addHistory: (repoPath: string): Promise<RepoHistoryItem[]> =>
    window.api.addHistory(repoPath),
  removeHistory: (repoPath: string): Promise<RepoHistoryItem[]> =>
    window.api.removeHistory(repoPath),
  clearHistory: (): Promise<RepoHistoryItem[]> => window.api.clearHistory(),
};
