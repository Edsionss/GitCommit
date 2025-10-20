import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

export class MarkdownItClass {
  private md: MarkdownIt

  constructor(html: boolean = true, breaks: boolean = true, linkify: boolean = true) {
    this.md = new MarkdownIt({
      html,
      breaks,
      linkify,
      highlight: this.defaultHighlight
    })
  }

  private defaultHighlight = (str: string, lang: string): string => {
    const langName = lang || 'text'
    // 保持和之前一样的 HTML 结构
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

    const escapedCode = this.md.utils.escapeHtml(str)
    return `<div class="code-block-wrapper">${toolbar}<pre class="hljs"><code>${escapedCode}</code></pre></div>`
  }

  public render(content: string): string {
    return this.md.render(content)
  }
}

// 导出一个单例，方便在各处使用
export const markdownIt = new MarkdownItClass()
