/**
 * @file AI IPC Handlers
 * @description Registers IPC handlers for AI-related functionalities.
 */

import { ipcMain } from 'electron'
import { generateCommitMessage, generateChatResponse } from '@services/ai/ai'
import type { AiConfig, ChatMessage } from '@shared/types/dtos/ai'
/**
 * Registers all AI-related IPC handlers.
 */
export function registerAiHandlers() {
  ipcMain.handle(
    'ai:generate-commit-message',
    async (_, prompt: string, aiConfig: AiConfig, isStream: boolean) => {
      try {
        const message = await generateCommitMessage(_, prompt, aiConfig, isStream)
        return { success: true, message }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error('AI commit message generation failed:', errorMessage)
        return { success: false, error: errorMessage }
      }
    }
  )

  ipcMain.handle(
    'ai:chat',
    async (_, prompt: string, aiConfig: AiConfig, history?: ChatMessage[], isStream?: boolean) => {
      try {
        const message = await generateChatResponse(_, prompt, aiConfig, history, isStream)
        return { success: true, message }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error('AI chat failed:', errorMessage)
        return { success: false, error: errorMessage }
      }
    }
  )
}
