
export interface Script {
  id: string;
  name: string;
  description?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export type CreateScriptDto = Omit<Script, 'id' | 'created_at' | 'updated_at'>;

export type UpdateScriptDto = Partial<CreateScriptDto>;
