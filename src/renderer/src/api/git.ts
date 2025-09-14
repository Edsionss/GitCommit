import type { GitScanOptions } from '@shared/types/dtos/git'
import type { GetSubReposResult, SelectDirectoryResult } from '@preload/index.d.ts'
import type { AiConfig } from '@shared/types/dtos/ai'

export const gitApi = {
  getRepoAuthors: (repoPaths: string[]): Promise<string[]> => window.api.getRepoAuthors(repoPaths),
  getRepoBranches: (repoPath: string): Promise<string[]> => window.api.getRepoBranches(repoPath),
  getSubRepos: (repoPath: string): Promise<GetSubReposResult> => window.api.getSubRepos(repoPath),
  validateRepoPath: (path: string): Promise<boolean> => window.api.validateRepoPath(path),
  scanGitRepo: (repoPath: string, options?: GitScanOptions, aiConfig?: AiConfig): Promise<any> =>
    window.api.scanGitRepo(repoPath, options, aiConfig),
  cancelScan: (): void => window.api.cancelScan()
}
