import { ref, watchEffect } from 'vue'

export function useInteractiveMarkdown() {
  const containerRef = ref<HTMLDivElement | null>(null)

  const handleContainerClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement

    // --- 复制按钮逻辑 ---
    const copyBtn = target.closest<HTMLButtonElement>('.copy-btn')
    if (copyBtn) {
      const wrapper = copyBtn.closest('.code-block-wrapper')
      const code = wrapper?.querySelector('pre code')
      if (code) {
        navigator.clipboard.writeText(code.textContent || '').then(() => {
          const btnText = copyBtn.querySelector('span')
          if (btnText) {
            btnText.textContent = '已复制!'
            copyBtn.disabled = true
            setTimeout(() => {
              btnText.textContent = '复制'
              copyBtn.disabled = false
            }, 2000)
          }
        })
      }
      return
    }

    // --- 折叠/展开按钮逻辑 ---
    const collapseBtn = target.closest('.collapse-btn')
    if (collapseBtn) {
      const wrapper = collapseBtn.closest('.code-block-wrapper')
      const isCollapsed = wrapper?.classList.toggle('collapsed')

      const iconExpand = collapseBtn.querySelector<SVGElement>('.icon-expand')
      const iconCollapse = collapseBtn.querySelector<SVGElement>('.icon-collapse')
      if (iconExpand && iconCollapse) {
        iconExpand.style.display = isCollapsed ? 'none' : 'inline-block'
        iconCollapse.style.display = isCollapsed ? 'inline-block' : 'none'
      }
    }
  }

  // 使用 watchEffect 来自动管理事件监听器的生命周期
  watchEffect((onCleanup) => {
    const element = containerRef.value
    if (element) {
      element.addEventListener('click', handleContainerClick)

      // onCleanup 会在组件卸载或 ref 改变时运行
      onCleanup(() => {
        element.removeEventListener('click', handleContainerClick)
      })
    }
  })

  return {
    containerRef
  }
}
