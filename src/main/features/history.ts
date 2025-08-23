
import { app } from 'electron';
import * as path from 'path';
import { promises as fs } from 'fs';

export interface RepoHistoryItem {
  path: string;
  lastAccessed: string;
}

const HISTORY_FILE_PATH = path.join(app.getPath('userData'), 'repo-history.json');
const MAX_HISTORY_ITEMS = 20;

async function readHistoryFile(): Promise<RepoHistoryItem[]> {
  try {
    await fs.access(HISTORY_FILE_PATH);
    const data = await fs.readFile(HISTORY_FILE_PATH, 'utf-8');
    return JSON.parse(data) as RepoHistoryItem[];
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
  }
}

async function writeHistoryFile(history: RepoHistoryItem[]): Promise<void> {
  await fs.writeFile(HISTORY_FILE_PATH, JSON.stringify(history, null, 2), 'utf-8');
}

export async function getHistory(): Promise<RepoHistoryItem[]> {
  const history = await readHistoryFile();
  // Sort by lastAccessed date descending
  return history.sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime());
}

export async function addToHistory(repoPath: string): Promise<RepoHistoryItem[]> {
  let history = await readHistoryFile();
  
  const existingIndex = history.findIndex(item => item.path === repoPath);

  if (existingIndex !== -1) {
    // Move existing item to the top
    const item = history.splice(existingIndex, 1)[0];
    item.lastAccessed = new Date().toISOString();
    history.unshift(item);
  } else {
    // Add new item to the top
    history.unshift({
      path: repoPath,
      lastAccessed: new Date().toISOString(),
    });
  }

  // Trim history to max length
  if (history.length > MAX_HISTORY_ITEMS) {
    history = history.slice(0, MAX_HISTORY_ITEMS);
  }

  await writeHistoryFile(history);
  return getHistory(); // Return the updated and sorted list
}

export async function removeFromHistory(repoPath: string): Promise<RepoHistoryItem[]> {
  let history = await readHistoryFile();
  history = history.filter(item => item.path !== repoPath);
  await writeHistoryFile(history);
  return getHistory();
}

export async function clearHistory(): Promise<RepoHistoryItem[]> {
  await writeHistoryFile([]);
  return [];
}
