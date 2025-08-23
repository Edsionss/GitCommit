import type { SelectDirectoryResult } from '@preload/index.d.ts';

export const fileSystemApi = {
  selectDirectory: (): Promise<SelectDirectoryResult | null> =>
    window.api.selectDirectory(),
};
