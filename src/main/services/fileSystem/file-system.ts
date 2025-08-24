// src/main/features/fileSystem/file-system.service.ts
// import { isValidGitRepo } from '../git/git-utils-service';
import { isValidGitRepo } from '@services/git/git-utils'

export async function validateRepositoryPath(
  repoPath: string
): Promise<{ path: string; isValid: boolean }> {
  const isValid = await isValidGitRepo(repoPath)
  return { path: repoPath, isValid }
}
