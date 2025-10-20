import { sysLogger } from '@nodeUtils/sysLogger'
/**
 * @file AI IPC Handlers
 * @description Registers IPC handlers for AI-related functionalities.
 */

import { ipcMain } from 'electron'
import { generateCommitMessage, generateChatResponse, generateChatResponseWithTools } from '@services/ai/ai'
import type { AiConfig, ChatMessage, FunctionTool } from '@sharedType/ai'
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
      }
    }
  )

  ipcMain.handle(
    'ai:chat-with-tools',
    async (
      _,
      params: { 
        prompt: string; 
        aiConfig: AiConfig; 
        history?: ChatMessage[]; 
        isStream?: boolean;
        tools?: FunctionTool[]
      }
    ) => {
      try {
        const { prompt, aiConfig, history, isStream, tools } = params
        const message = await generateChatResponseWithTools({ 
          _, 
          prompt, 
          aiConfig, 
          history, 
          isStream,
          tools
        })
        return { success: true, message }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        sysLogger.error('AI chat with tools failed:', errorMessage)
        return { success: false, error: errorMessage }
      }
    }
  )
}
