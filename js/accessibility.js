/**
 * POSTER2WEB - ACCESSIBILITY & UI/UX ENHANCEMENTS
 * Comprehensive accessibility features and user experience improvements
 */

// ===================================================
// ACCESSIBILITY MANAGER
// ===================================================

class AccessibilityManager {
  constructor() {
    this.init()
    this.setupKeyboardNavigation()
    this.setupFocusManagement()
    this.setupScreenReaderSupport()
    this.setupColorContrastChecker()
    this.setupMotionPreferences()
  }

  init() {
    // Add accessibility toolbar
    this.createAccessibilityToolbar()

    // Setup ARIA live regions
    this.setupLiveRegions()

    // Initialize keyboard shortcuts
    this.initKeyboardShortcuts()

    // Setup focus indicators
    this.enhanceFocusIndicators()

    console.log("[v0] Accessibility manager initialized")
  }

  // ===================================================
  // ACCESSIBILITY TOOLBAR
  // ===================================================

  createAccessibilityToolbar() {
    const toolbar = document.createElement("div")
    toolbar.id = "accessibilityToolbar"
    toolbar.className = "accessibility-toolbar"
    toolbar.setAttribute("role", "toolbar")
    toolbar.setAttribute("aria-label", "Accessibility options")

    toolbar.innerHTML = `
            <button class="a11y-toggle" id="a11yToggle" aria-label="Toggle accessibility toolbar" title="Accessibility Options">
                <span class="a11y-icon">♿</span>
            </button>
            <div class="a11y-panel" id="a11yPanel" role="menu" aria-hidden="true">
                <div class="a11y-panel-header">
                    <h3>Accessibility Options</h3>
                    <button class="a11y-close" aria-label="Close accessibility panel">×</button>
                </div>
                <div class="a11y-options">
                    <button class="a11y-option" id="increaseFontSize" role="menuitem">
                        <span class="a11y-option-icon">🔍+</span>
                        <span>Increase Font Size</span>
                    </button>
                    <button class="a11y-option" id="decreaseFontSize" role="menuitem">
                        <span class="a11y-option-icon">🔍-</span>
                        <span>Decrease Font Size</span>
                    </button>
                    <button class="a11y-option" id="toggleHighContrast" role="menuitem">
                        <span class="a11y-option-icon">🎨</span>
                        <span>High Contrast</span>
                    </button>
                    <button class="a11y-option" id="toggleReducedMotion" role="menuitem">
                        <span class="a11y-option-icon">⏸️</span>
                        <span>Reduce Motion</span>
                    </button>
                    <button class="a11y-option" id="toggleFocusMode" role="menuitem">
                        <span class="a11y-option-icon">🎯</span>
                        <span>Focus Mode</span>
                    </button>
                    <button class="a11y-option" id="toggleScreenReader" role="menuitem">
                        <span class="a11y-option-icon">🔊</span>
                        <span>Screen Reader Mode</span>
                    </button>
                </div>
            </div>
        `

    document.body.appendChild(toolbar)
    this.bindAccessibilityEvents()
  }

  bindAccessibilityEvents() {
    const toggle = document.getElementById("a11yToggle")
    const panel = document.getElementById("a11yPanel")
    const close = panel.querySelector(".a11y-close")

    // Toggle panel
    toggle.addEventListener("click", () => {
      const isOpen = panel.getAttribute("aria-hidden") === "false"
      panel.setAttribute("aria-hidden", isOpen ? "true" : "false")
      toggle.setAttribute("aria-expanded", isOpen ? "false" : "true")
    })

    // Close panel
    close.addEventListener("click", () => {
      panel.setAttribute("aria-hidden", "true")
      toggle.setAttribute("aria-expanded", "false")
      toggle.focus()
    })

    // Bind option events
    document.getElementById("increaseFontSize").addEventListener("click", () => this.adjustFontSize(1.1))
    document.getElementById("decreaseFontSize").addEventListener("click", () => this.adjustFontSize(0.9))
    document.getElementById("toggleHighContrast").addEventListener("click", () => this.toggleHighContrast())
    document.getElementById("toggleReducedMotion").addEventListener("click", () => this.toggleReducedMotion())
    document.getElementById("toggleFocusMode").addEventListener("click", () => this.toggleFocusMode())
    document.getElementById("toggleScreenReader").addEventListener("click", () => this.toggleScreenReaderMode())

    // Close on escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && panel.getAttribute("aria-hidden") === "false") {
        panel.setAttribute("aria-hidden", "true")
        toggle.setAttribute("aria-expanded", "false")
        toggle.focus()
      }
    })
  }

  // ===================================================
  // FONT SIZE ADJUSTMENT
  // ===================================================

  adjustFontSize(multiplier) {
    const currentSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
    const newSize = Math.max(12, Math.min(24, currentSize * multiplier))
    document.documentElement.style.fontSize = `${newSize}px`

    // Announce change
    this.announceToScreenReader(`Font size ${multiplier > 1 ? "increased" : "decreased"} to ${Math.round(newSize)}px`)

    // Save preference
    localStorage.setItem("a11y-font-size", newSize)
  }

  // ===================================================
  // HIGH CONTRAST MODE
  // ===================================================

  toggleHighContrast() {
    const isActive = document.body.classList.toggle("high-contrast")
    this.announceToScreenReader(`High contrast mode ${isActive ? "enabled" : "disabled"}`)
    localStorage.setItem("a11y-high-contrast", isActive)
  }

  // ===================================================
  // REDUCED MOTION
  // ===================================================

  toggleReducedMotion() {
    const isActive = document.body.classList.toggle("reduced-motion")
    this.announceToScreenReader(`Reduced motion ${isActive ? "enabled" : "disabled"}`)
    localStorage.setItem("a11y-reduced-motion", isActive)
  }

  // ===================================================
  // FOCUS MODE
  // ===================================================

  toggleFocusMode() {
    const isActive = document.body.classList.toggle("focus-mode")
    this.announceToScreenReader(`Focus mode ${isActive ? "enabled" : "disabled"}`)
    localStorage.setItem("a11y-focus-mode", isActive)
  }

  // ===================================================
  // SCREEN READER MODE
  // ===================================================

  toggleScreenReaderMode() {
    const isActive = document.body.classList.toggle("screen-reader-mode")
    this.announceToScreenReader(`Screen reader optimizations ${isActive ? "enabled" : "disabled"}`)
    localStorage.setItem("a11y-screen-reader", isActive)
  }

  // ===================================================
  // KEYBOARD NAVIGATION
  // ===================================================

  setupKeyboardNavigation() {
    // Skip links
    this.createSkipLinks()

    // Roving tabindex for complex widgets
    this.setupRovingTabindex()

    // Arrow key navigation for tabs
    this.setupTabNavigation()
  }

  createSkipLinks() {
    const skipLinks = document.createElement("div")
    skipLinks.className = "skip-links"
    skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#editor-content" class="skip-link">Skip to editor</a>
            <a href="#preview-content" class="skip-link">Skip to preview</a>
        `
    document.body.insertBefore(skipLinks, document.body.firstChild)
  }

  setupRovingTabindex() {
    // Handle toolbar button groups
    const toolbars = document.querySelectorAll('[role="toolbar"]')
    toolbars.forEach((toolbar) => {
      const buttons = toolbar.querySelectorAll("button")
      if (buttons.length === 0) return

      let currentIndex = 0
      buttons[0].tabIndex = 0

      buttons.forEach((button, index) => {
        if (index > 0) button.tabIndex = -1

        button.addEventListener("keydown", (e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault()
            buttons[currentIndex].tabIndex = -1
            currentIndex = (currentIndex + 1) % buttons.length
            buttons[currentIndex].tabIndex = 0
            buttons[currentIndex].focus()
          } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault()
            buttons[currentIndex].tabIndex = -1
            currentIndex = (currentIndex - 1 + buttons.length) % buttons.length
            buttons[currentIndex].tabIndex = 0
            buttons[currentIndex].focus()
          }
        })
      })
    })
  }

  setupTabNavigation() {
    const tabs = document.querySelectorAll(".tab")
    tabs.forEach((tab, index) => {
      tab.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault()
          const nextTab = tabs[(index + 1) % tabs.length]
          nextTab.click()
          nextTab.focus()
        } else if (e.key === "ArrowLeft") {
          e.preventDefault()
          const prevTab = tabs[(index - 1 + tabs.length) % tabs.length]
          prevTab.click()
          prevTab.focus()
        }
      })
    })
  }

  // ===================================================
  // FOCUS MANAGEMENT
  // ===================================================

  setupFocusManagement() {
    // Focus trap for modals
    this.setupModalFocusTrap()

    // Focus restoration
    this.setupFocusRestoration()

    // Focus indicators
    this.enhanceFocusIndicators()
  }

  setupModalFocusTrap() {
    const modals = document.querySelectorAll(".modal")
    modals.forEach((modal) => {
      modal.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
          const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          )
          const firstElement = focusableElements[0]
          const lastElement = focusableElements[focusableElements.length - 1]

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      })
    })
  }

  setupFocusRestoration() {
    let lastFocusedElement = null

    // Store focus before modal opens
    document.addEventListener("click", (e) => {
      if (e.target.matches('[onclick*="Modal"]')) {
        lastFocusedElement = e.target
      }
    })

    // Restore focus when modal closes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          const modal = mutation.target
          if (modal.classList.contains("modal") && !modal.classList.contains("active")) {
            if (lastFocusedElement) {
              lastFocusedElement.focus()
              lastFocusedElement = null
            }
          }
        }
      })
    })

    document.querySelectorAll(".modal").forEach((modal) => {
      observer.observe(modal, { attributes: true })
    })
  }

  enhanceFocusIndicators() {
    // Add enhanced focus styles programmatically
    const style = document.createElement("style")
    style.textContent = `
            .enhanced-focus *:focus {
                outline: 3px solid var(--primary) !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 1px white, 0 0 0 4px var(--primary) !important;
            }
        `
    document.head.appendChild(style)

    // Toggle enhanced focus on keyboard use
    document.addEventListener("keydown", () => {
      document.body.classList.add("enhanced-focus")
    })

    document.addEventListener("mousedown", () => {
      document.body.classList.remove("enhanced-focus")
    })
  }

  // ===================================================
  // SCREEN READER SUPPORT
  // ===================================================

  setupScreenReaderSupport() {
    this.setupLiveRegions()
    this.addAriaLabels()
    this.setupProgressAnnouncements()
  }

  setupLiveRegions() {
    // Create live regions for announcements
    const liveRegion = document.createElement("div")
    liveRegion.id = "liveRegion"
    liveRegion.setAttribute("aria-live", "polite")
    liveRegion.setAttribute("aria-atomic", "true")
    liveRegion.className = "sr-only"
    document.body.appendChild(liveRegion)

    const assertiveRegion = document.createElement("div")
    assertiveRegion.id = "assertiveRegion"
    assertiveRegion.setAttribute("aria-live", "assertive")
    assertiveRegion.setAttribute("aria-atomic", "true")
    assertiveRegion.className = "sr-only"
    document.body.appendChild(assertiveRegion)
  }

  announceToScreenReader(message, assertive = false) {
    const region = document.getElementById(assertive ? "assertiveRegion" : "liveRegion")
    if (region) {
      region.textContent = message
      setTimeout(() => {
        region.textContent = ""
      }, 1000)
    }
  }

  addAriaLabels() {
    // Add missing ARIA labels
    const elementsNeedingLabels = [
      { selector: ".drop-zone", label: "File upload area. Click or drag files here." },
      { selector: ".preview-iframe", label: "Website preview" },
      { selector: ".color-input", label: "Color picker" },
      { selector: ".range-input", label: "Slider control" },
      { selector: ".section-editor", label: "Content section editor" },
    ]

    elementsNeedingLabels.forEach(({ selector, label }) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (!element.getAttribute("aria-label") && !element.getAttribute("aria-labelledby")) {
          element.setAttribute("aria-label", label)
        }
      })
    })
  }

  setupProgressAnnouncements() {
    // Announce loading progress
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          const loadingMessage = document.getElementById("loadingMessage")
          if (loadingMessage && mutation.target === loadingMessage) {
            this.announceToScreenReader(loadingMessage.textContent)
          }
        }
      })
    })

    const loadingMessage = document.getElementById("loadingMessage")
    if (loadingMessage) {
      observer.observe(loadingMessage, { childList: true, subtree: true })
    }
  }

  // ===================================================
  // COLOR CONTRAST CHECKER
  // ===================================================

  setupColorContrastChecker() {
    // Check contrast ratios and warn if insufficient
    this.checkContrastRatios()
  }

  checkContrastRatios() {
    const elements = document.querySelectorAll("*")
    elements.forEach((element) => {
      const styles = getComputedStyle(element)
      const bgColor = styles.backgroundColor
      const textColor = styles.color

      if (bgColor !== "rgba(0, 0, 0, 0)" && textColor !== "rgba(0, 0, 0, 0)") {
        const contrast = this.calculateContrastRatio(bgColor, textColor)
        if (contrast < 4.5) {
          console.warn(`Low contrast ratio (${contrast.toFixed(2)}) detected:`, element)
        }
      }
    })
  }

  calculateContrastRatio(color1, color2) {
    const rgb1 = this.parseRGB(color1)
    const rgb2 = this.parseRGB(color2)

    const l1 = this.getLuminance(rgb1)
    const l2 = this.getLuminance(rgb2)

    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)

    return (lighter + 0.05) / (darker + 0.05)
  }

  parseRGB(color) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    return match ? [Number.parseInt(match[1]), Number.parseInt(match[2]), Number.parseInt(match[3])] : [0, 0, 0]
  }

  getLuminance([r, g, b]) {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  // ===================================================
  // MOTION PREFERENCES
  // ===================================================

  setupMotionPreferences() {
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

    if (prefersReducedMotion.matches) {
      document.body.classList.add("reduced-motion")
    }

    prefersReducedMotion.addEventListener("change", (e) => {
      if (e.matches) {
        document.body.classList.add("reduced-motion")
      } else {
        document.body.classList.remove("reduced-motion")
      }
    })
  }

  // ===================================================
  // KEYBOARD SHORTCUTS
  // ===================================================

  initKeyboardShortcuts() {
    const shortcuts = {
      "ctrl+s": () => this.saveProject(),
      "ctrl+shift+p": () => this.showPreview(),
      "ctrl+shift+e": () => this.showExport(),
      "ctrl+shift+a": () => this.toggleAccessibilityPanel(),
      escape: () => this.closeModals(),
      "ctrl+z": () => this.undo(),
      "ctrl+y": () => this.redo(),
    }

    document.addEventListener("keydown", (e) => {
      const key = this.getShortcutKey(e)
      if (shortcuts[key]) {
        e.preventDefault()
        shortcuts[key]()
      }
    })

    // Show keyboard shortcuts help
    this.createShortcutsHelp()
  }

  getShortcutKey(e) {
    const parts = []
    if (e.ctrlKey) parts.push("ctrl")
    if (e.shiftKey) parts.push("shift")
    if (e.altKey) parts.push("alt")
    parts.push(e.key.toLowerCase())
    return parts.join("+")
  }

  createShortcutsHelp() {
    const help = document.createElement("div")
    help.id = "keyboardShortcuts"
    help.className = "keyboard-shortcuts-help"
    help.innerHTML = `
            <div class="shortcuts-content">
                <h3>Keyboard Shortcuts</h3>
                <div class="shortcuts-list">
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>S</kbd>
                        <span>Save project</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>
                        <span>Show preview</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>E</kbd>
                        <span>Export website</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd>
                        <span>Accessibility options</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Esc</kbd>
                        <span>Close modals</span>
                    </div>
                </div>
                <button class="shortcuts-close">Close</button>
            </div>
        `
    document.body.appendChild(help)

    // Show shortcuts with Ctrl+?
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "?") {
        e.preventDefault()
        help.classList.toggle("show")
      }
    })

    help.querySelector(".shortcuts-close").addEventListener("click", () => {
      help.classList.remove("show")
    })
  }

  // ===================================================
  // SHORTCUT ACTIONS
  // ===================================================

  saveProject() {
    // Trigger autosave
    if (window.LWB_State && window.LWB_State.actions.saveToLocalStorage) {
      window.LWB_State.actions.saveToLocalStorage()
      this.announceToScreenReader("Project saved")
    }
  }

  showPreview() {
    if (window.showPreviewModal) {
      window.showPreviewModal()
      this.announceToScreenReader("Preview opened")
    }
  }

  showExport() {
    if (window.exportWebsite) {
      window.exportWebsite()
      this.announceToScreenReader("Export dialog opened")
    }
  }

  toggleAccessibilityPanel() {
    const toggle = document.getElementById("a11yToggle")
    if (toggle) {
      toggle.click()
    }
  }

  closeModals() {
    const activeModal = document.querySelector(".modal.active")
    if (activeModal) {
      const closeBtn = activeModal.querySelector(".close-btn")
      if (closeBtn) {
        closeBtn.click()
        this.announceToScreenReader("Modal closed")
      }
    }
  }

  undo() {
    // Implement undo functionality if available
    this.announceToScreenReader("Undo not available")
  }

  redo() {
    // Implement redo functionality if available
    this.announceToScreenReader("Redo not available")
  }

  // ===================================================
  // LOAD SAVED PREFERENCES
  // ===================================================

  loadSavedPreferences() {
    // Load font size
    const savedFontSize = localStorage.getItem("a11y-font-size")
    if (savedFontSize) {
      document.documentElement.style.fontSize = `${savedFontSize}px`
    }

    // Load high contrast
    if (localStorage.getItem("a11y-high-contrast") === "true") {
      document.body.classList.add("high-contrast")
    }

    // Load reduced motion
    if (localStorage.getItem("a11y-reduced-motion") === "true") {
      document.body.classList.add("reduced-motion")
    }

    // Load focus mode
    if (localStorage.getItem("a11y-focus-mode") === "true") {
      document.body.classList.add("focus-mode")
    }

    // Load screen reader mode
    if (localStorage.getItem("a11y-screen-reader") === "true") {
      document.body.classList.add("screen-reader-mode")
    }
  }
}

// ===================================================
// UI/UX ENHANCEMENTS
// ===================================================

class UIEnhancementManager {
  constructor() {
    this.init()
  }

  init() {
    this.setupSmoothScrolling()
    this.setupTooltips()
    this.setupProgressIndicators()
    this.setupAnimationEnhancements()
    this.setupResponsiveEnhancements()
    this.setupErrorHandling()

    console.log("[v0] UI enhancement manager initialized")
  }

  setupSmoothScrolling() {
    // Smooth scroll for anchor links
    document.addEventListener("click", (e) => {
      if (e.target.matches('a[href^="#"]')) {
        e.preventDefault()
        const target = document.querySelector(e.target.getAttribute("href"))
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }
    })
  }

  setupTooltips() {
    // Enhanced tooltips with better positioning
    const tooltips = document.querySelectorAll("[title]")
    tooltips.forEach((element) => {
      const title = element.getAttribute("title")
      element.removeAttribute("title")
      element.setAttribute("data-tooltip", title)

      element.addEventListener("mouseenter", (e) => {
        this.showTooltip(e.target, title)
      })

      element.addEventListener("mouseleave", () => {
        this.hideTooltip()
      })
    })
  }

  showTooltip(element, text) {
    const tooltip = document.createElement("div")
    tooltip.className = "enhanced-tooltip"
    tooltip.textContent = text
    tooltip.setAttribute("role", "tooltip")

    document.body.appendChild(tooltip)

    const rect = element.getBoundingClientRect()
    const tooltipRect = tooltip.getBoundingClientRect()

    let top = rect.top - tooltipRect.height - 8
    let left = rect.left + (rect.width - tooltipRect.width) / 2

    // Adjust if tooltip goes off screen
    if (top < 0) {
      top = rect.bottom + 8
      tooltip.classList.add("bottom")
    }

    if (left < 0) {
      left = 8
    } else if (left + tooltipRect.width > window.innerWidth) {
      left = window.innerWidth - tooltipRect.width - 8
    }

    tooltip.style.top = `${top}px`
    tooltip.style.left = `${left}px`

    setTimeout(() => tooltip.classList.add("show"), 10)
  }

  hideTooltip() {
    const tooltip = document.querySelector(".enhanced-tooltip")
    if (tooltip) {
      tooltip.remove()
    }
  }

  setupProgressIndicators() {
    // Enhanced loading states
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          const element = mutation.target
          if (element.classList.contains("loading")) {
            this.addLoadingIndicator(element)
          } else {
            this.removeLoadingIndicator(element)
          }
        }
      })
    })

    // Observe all buttons and form elements
    document.querySelectorAll("button, .btn").forEach((element) => {
      observer.observe(element, { attributes: true })
    })
  }

  addLoadingIndicator(element) {
    if (!element.querySelector(".loading-spinner")) {
      const spinner = document.createElement("span")
      spinner.className = "loading-spinner inline"
      spinner.innerHTML = "⟳"
      element.prepend(spinner)
      element.setAttribute("aria-busy", "true")
    }
  }

  removeLoadingIndicator(element) {
    const spinner = element.querySelector(".loading-spinner")
    if (spinner) {
      spinner.remove()
      element.removeAttribute("aria-busy")
    }
  }

  setupAnimationEnhancements() {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in")
        }
      })
    }, observerOptions)

    // Observe elements that should animate in
    document.querySelectorAll(".section-editor, .content-block, .form-group").forEach((element) => {
      observer.observe(element)
    })
  }

  setupResponsiveEnhancements() {
    // Enhanced mobile interactions
    if ("ontouchstart" in window) {
      document.body.classList.add("touch-device")

      // Improve touch targets
      const touchTargets = document.querySelectorAll("button, .btn, .icon-btn")
      touchTargets.forEach((target) => {
        if (target.offsetHeight < 44) {
          target.style.minHeight = "44px"
        }
        if (target.offsetWidth < 44) {
          target.style.minWidth = "44px"
        }
      })
    }

    // Responsive breakpoint detection
    const breakpoints = {
      mobile: "(max-width: 768px)",
      tablet: "(max-width: 1024px)",
      desktop: "(min-width: 1025px)",
    }

    Object.entries(breakpoints).forEach(([name, query]) => {
      const mq = window.matchMedia(query)
      document.body.classList.toggle(`bp-${name}`, mq.matches)

      mq.addEventListener("change", (e) => {
        document.body.classList.toggle(`bp-${name}`, e.matches)
      })
    })
  }

  setupErrorHandling() {
    // Enhanced error states
    window.addEventListener("error", (e) => {
      this.showErrorNotification("An unexpected error occurred. Please try again.")
      console.error("Global error:", e)
    })

    // Form validation enhancements
    document.addEventListener(
      "invalid",
      (e) => {
        e.preventDefault()
        this.showFieldError(e.target)
      },
      true,
    )
  }

  showErrorNotification(message) {
    if (window.LWB_Utils && window.LWB_Utils.showToast) {
      window.LWB_Utils.showToast(message, "error")
    }
  }

  showFieldError(field) {
    // Remove existing error
    const existingError = field.parentNode.querySelector(".field-error")
    if (existingError) {
      existingError.remove()
    }

    // Add new error
    const error = document.createElement("div")
    error.className = "field-error"
    error.textContent = field.validationMessage
    error.setAttribute("role", "alert")

    field.parentNode.appendChild(error)
    field.setAttribute("aria-describedby", (error.id = `error-${Date.now()}`))

    // Remove error when field becomes valid
    const removeError = () => {
      if (field.validity.valid) {
        error.remove()
        field.removeAttribute("aria-describedby")
        field.removeEventListener("input", removeError)
      }
    }

    field.addEventListener("input", removeError)
  }
}

// ===================================================
// INITIALIZATION
// ===================================================

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeAccessibility)
} else {
  initializeAccessibility()
}

function initializeAccessibility() {
  // Initialize accessibility manager
  const accessibilityManager = new AccessibilityManager()
  accessibilityManager.loadSavedPreferences()

  // Initialize UI enhancements
  const uiManager = new UIEnhancementManager()

  // Make managers globally available
  window.LWB_Accessibility = accessibilityManager
  window.LWB_UI = uiManager
}

console.log("[v0] Accessibility and UI enhancement modules loaded")
