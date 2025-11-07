import { sysLogger } from '@nodeUtils/sysLogger'
import { saveSender, clearSender } from '@nodeUtils/ipcSend'
import { randomUUID } from 'crypto'
/**
 * @file AI IPC Handlers
 * @description Registers IPC handlers for AI-related functionalities.
 */

import { ipcMain } from 'electron'
import { generateCommitMessage, generateChatResponse } from '@services/ai/ai'
import type { AiConfig, ChatMessage, GenerateChatResponseParams } from '@sharedType/ai'
import { generateChatResponseWithFunctionCalling } from '@services/ai/aiFunctionCalling'

/**
 * Registers all AI-related IPC handlers.
 */
export function registerAiHandlers() {
  ipcMain.handle(
    'ai:generate-commit-message',
    async (_, params: { prompt: string; aiConfig: AiConfig; isStream: boolean }) => {
      try {
        const { prompt, aiConfig, isStream } = params
        const message = await generateCommitMessage({ _, prompt, aiConfig, isStream })
        return { success: true, message }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        sysLogger.error('AI commit message generation failed:', errorMessage)
        return { success: false, error: errorMessage }
      }
    }
  )

  ipcMain.handle(
    'ai:chat',
    async (
      _,
      params: { prompt: string; aiConfig: AiConfig; history?: ChatMessage[]; isStream?: boolean }
    ) => {
      try {
        const { prompt, aiConfig, history, isStream } = params
        const message = await generateChatResponse({ _, prompt, aiConfig, history, isStream })
        return { success: true, message }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        sysLogger.error('AI chat failed:', errorMessage)
        return { success: false, error: errorMessage }
      } finally {
      }
    }
  )

  ipcMain.handle('ai:chat-with-tools', async (_, params: Omit<GenerateChatResponseParams, '_'>) => {
    try {
      const message = await generateChatResponseWithFunctionCalling({ ...params, _ })
      return { success: true, message }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      sysLogger.error('AI chat with tools failed:', errorMessage)
      return { success: false, error: errorMessage }
    }
  })
}
