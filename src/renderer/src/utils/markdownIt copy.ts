import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import { Typography } from 'ant-design-vue'
import type { BubbleProps } from 'ant-design-x-vue'
import { h, VNode, RendererNode, RendererElement } from 'vue' // 引入 VNode 类型

// 定义 Options 类型，避免使用命名空间
type MarkdownItOptions = {
  html?: boolean
  xhtmlOut?: boolean
  breaks?: boolean
  langPrefix?: string
  linkify?: boolean
  typographer?: boolean
  quotes?: string | string[]
  highlight?: ((str: string, lang: string, attrs: string) => string) | null
}

export class MarkdownItClass {
  private md: MarkdownIt

  constructor(
    public html: boolean = true,
    public breaks: boolean = true,
    public linkify: boolean = true
  ) {
    this.md = new MarkdownIt({
      html: this.html,
      breaks: this.breaks,
      linkify: this.linkify,
      highlight: this.defaultHighlight // 现在可以安全地传递
    })
  }

  /**
   * FIX 2: 使用箭头函数作为类属性来绑定 `this` 上下文。
   * 这样无论在哪里调用 defaultHighlight，`this` 都会指向 MarkdownItClass 的实例。
   */
  private defaultHighlight = (str: string, lang: string): string => {
    const langName = lang || 'text'
    const toolbar = `
      <div class="code-toolbar">
        <span class="lang-name">${langName}</span>
        <div class="toolbar-buttons">
          <button class="copy-btn" title="复制代码">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zM-1 7a.5.5 0 0 1 .5-.5h1v-1a.5.5 0 0 1 1 0v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1-.5-.5z"/></svg>
            <span>复制</span>
          </button>
          <button class="collapse-btn" title="折叠/展开代码">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="icon-expand" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 8z"/></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="icon-collapse" viewBox="0 0 16 16" style="display: none;"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>
          </button>
        </div>
      </div>`

    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlightedCode = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
        return `<div class="code-block-wrapper">${toolbar}<pre class="hljs"><code>${highlightedCode}</code></pre></div>`
      } catch (__) {}
    }

    // `this.md` 在这里是安全的，因为 `this` 被正确绑定了
    const escapedCode = this.md.utils.escapeHtml(str)
    return `<div class="code-block-wrapper">${toolbar}<pre class="hljs"><code>${escapedCode}</code></pre></div>`
  }

  /**
   * FIX 1: 为 renderMarkdown 提供一个明确的、非可选的函数类型。
   * 我们直接定义它的签名，而不是从 BubbleProps['messageRender'] 继承可能为 undefined 的类型。
   */
  public renderMarkdown: (
    content: string
  ) => VNode<RendererNode, RendererElement, { [key: string]: any }> = (content) => {
    return h(Typography, null, {
      default: () =>
        h('div', {
          innerHTML: this.md.render(content),
          class: 'markdown-content'
        })
    })
  }

  // ... 其他方法保持不变 ...
  renderToHtml(content: string): string {
    return this.md.render(content)
  }

  renderInline(content: string): string {
    return this.md.renderInline(content)
  }

  validate(content: string): boolean {
    try {
      this.md.render(content)
      return true
    } catch (error) {
      console.error('Markdown validation error:', error)
      return false
    }
  }

  getMarkdownInstance(): MarkdownIt {
    return this.md
  }

  addRule(name: string, rule: any): void {
    this.md.renderer.rules[name] = rule
  }

  configure(options: Partial<MarkdownItOptions>): void {
    this.md.set(options)
  }
}

export const markdownIt = new MarkdownItClass()

// 初始化调用的部分可以移除，因为它不是必须的，并且可能在非DOM环境中引起问题
// markdownIt.renderMarkdown('# 初始化Markdown渲染器')
