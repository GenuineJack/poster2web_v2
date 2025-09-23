/**
 * SITEWEAVE - MAIN APPLICATION
 * Screen management, state handling, and application orchestration
 */

// ===================================================
// APPLICATION STATE
// ===================================================

/**
 * Global application state
 */
const APP_STATE = {
  currentProject: {
    title: "My Website",
    sections: [],
    logoUrl: null,
  },
  settings: {
    primaryColor: "#16a34a",
    secondaryColor: "#15803d",
    titleSize: "32",
    contentSize: "16",
    fontStyle: "system",
    headerAlignment: "center",
    logoSize: "120",
    layoutStyle: "single",
    darkMode: false,
    /**
     * Custom buttons for the website. A maximum of three entries is supported.
     * Each button is an object with an id, a type ('file', 'link' or 'email'),
     * a label and additional fields depending on the type:
     *  - type 'file' includes a `file` object with name and dataUrl
     *  - type 'link' includes a `href` property
     *  - type 'email' includes an `email` property
     */
    buttons: [],

    /**
     * Analytics snippet to be injected into the exported HTML head.
     */
    analyticsCode: "",
  },
  currentScreen: "upload",
  isLoading: false,
  unsavedChanges: false,
}

/**
 * DOM element references
 */
let DOM_REFS = {}

// ===================================================
// APPLICATION INITIALIZATION
// ===================================================

/**
 * Initialize the application when DOM is ready
 */
function initializeApp() {
  console.log("🚀 Initializing SiteWeave...")

  // Get DOM references
  cacheDOMReferences()

  // Initialize state management
  initializeStateManagement()

  // Load saved project if exists
  loadSavedProject()

  // Ensure a header section always exists on load.  If a legacy project
  // has no header or has multiple header flags, this will insert or
  // normalize it so that there is exactly one header at index 0.  The
  // function is idempotent and safe to call multiple times.
  ensureHeaderExists()

  // Migrate legacy settings (download/contact buttons) to the new buttons array
  migrateLegacySettings()

  // Initialize file handling
  initializeFileHandling()

  // Initialize auto-save
  initializeAutoSave()

  // Set up global event listeners
  setupGlobalEventListeners()

  // Initialize current screen
  showScreen("upload")

  console.log("✅ SiteWeave initialized successfully")
}

/**
 * Initialize state management system
 */
function initializeStateManagement() {
  const { store, actions, selectors } = window.LWB_State

  // Subscribe to state changes for UI updates
  store.subscribe("ui.currentScreen", (screen) => {
    updateScreenDisplay(screen)
  })

  store.subscribe("ui.isLoading", (isLoading, prevLoading, state) => {
    if (isLoading) {
      showLoadingScreen(state.ui.loadingTitle, state.ui.loadingMessage)
    }
  })

  store.subscribe("currentProject", (project, prevProject) => {
    if (project !== prevProject) {
      updatePreview()
      // Update UI elements
      if (DOM_REFS.pdfName) {
        DOM_REFS.pdfName.textContent = project.title || "Untitled"
      }
    }
  })

  store.subscribe("settings", (settings, prevSettings) => {
    if (settings !== prevSettings) {
      loadSettingsIntoUI()
      updatePreview()
    }
  })

  store.subscribe("unsavedChanges", (hasChanges) => {
    updateAutoSaveIndicator(hasChanges)
  })

  // Initialize with current state
  const currentState = store.getState()
  updateScreenDisplay(currentState.ui.currentScreen)
}

/**
 * Update screen display based on state
 */
function updateScreenDisplay(screenName) {
  const screens = ["upload", "loading", "editor"]

  screens.forEach((screen) => {
    const element = DOM_REFS[`${screen}Screen`]
    if (element) {
      if (screen === screenName) {
        element.classList.add("active")
      } else {
        element.classList.remove("active")
      }
    }
  })

  // Hide the loading progress bar when leaving the loading screen
  if (screenName !== "loading" && DOM_REFS.loadingProgress) {
    DOM_REFS.loadingProgress.style.display = "none"
    if (DOM_REFS.loadingProgressFill) DOM_REFS.loadingProgressFill.style.width = "0%"
  }

  // Initialize screen-specific functionality
  if (screenName === "editor") {
    setTimeout(() => initializeEditor(), 100)
  }
}

/**
 * Update auto-save indicator
 */
function updateAutoSaveIndicator(hasChanges) {
  const indicator = DOM_REFS.autosaveIndicator
  if (!indicator) return

  if (hasChanges) {
    indicator.textContent = "⏳ Unsaved changes"
    indicator.classList.add("show", "unsaved")
  } else {
    indicator.textContent = "💾 Saved"
    indicator.classList.remove("unsaved")
    indicator.classList.add("show")

    setTimeout(() => {
      indicator.classList.remove("show")
    }, 2000)
  }
}

/**
 * Cache DOM element references for performance
 */
function cacheDOMReferences() {
  DOM_REFS = {
    // Screens
    uploadScreen: document.getElementById("uploadScreen"),
    loadingScreen: document.getElementById("loadingScreen"),
    editorScreen: document.getElementById("editorScreen"),

    // Upload elements
    dropZone: document.getElementById("dropZone"),
    fileInput: document.getElementById("fileInput"),
    browseBtn: document.getElementById("browseBtn"),
    blankBtn: document.getElementById("blankBtn"),
    builderThemeToggle: document.getElementById("builderThemeToggle"),

    // Loading elements
    loadingTitle: document.getElementById("loadingTitle"),
    loadingMessage: document.getElementById("loadingMessage"),
    loadingProgress: document.getElementById("loadingProgress"),
    loadingProgressFill: document.getElementById("loadingProgressFill"),

    // Editor elements
    backButton: document.getElementById("backButton"),
    pdfName: document.getElementById("pdfName"),
    sectionsContainer: document.getElementById("sectionsContainer"),
    websitePreview: document.getElementById("websitePreview"),

    // Settings elements
    primaryColor: document.getElementById("primaryColor"),
    secondaryColor: document.getElementById("secondaryColor"),
    primaryColorHex: document.getElementById("primaryColorHex"),
    secondaryColorHex: document.getElementById("secondaryColorHex"),
    colorScheme: document.getElementById("colorScheme"),
    logoInput: document.getElementById("logoInput"),
    logoSize: document.getElementById("logoSize"),
    logoSizeValue: document.getElementById("logoSizeValue"),
    headerAlignment: document.getElementById("headerAlignment"),
    fontStyle: document.getElementById("fontStyle"),
    titleSize: document.getElementById("titleSize"),
    titleSizeValue: document.getElementById("titleSizeValue"),
    contentSize: document.getElementById("contentSize"),
    contentSizeValue: document.getElementById("contentSizeValue"),
    layoutStyle: document.getElementById("layoutStyle"),

    // Settings tab elements
    // Buttons manager elements
    buttonsContainer: document.getElementById("buttonsContainer"),
    addButtonMenu: document.getElementById("addButtonMenu"),
    buttonPreview: document.getElementById("buttonPreview"),
    analyticsCode: document.getElementById("analyticsCode"),

    // Modals
    previewModal: document.getElementById("previewModal"),
    exportModal: document.getElementById("exportModal"),
    infoModal: document.getElementById("infoModal"),
    fullPreview: document.getElementById("fullPreview"),
    previewFrame: document.getElementById("previewFrame"),

    // Other
    autosaveIndicator: document.getElementById("autosaveIndicator"),
    toast: document.getElementById("toast"),
  }
}

/**
 * Load saved project from localStorage
 */
function loadSavedProject() {
  const saved = window.LWB_Utils.loadProject()
  if (saved && window.LWB_Utils.isValidProject(saved)) {
    window.LWB_State.actions.loadProject(saved)
    console.log("📂 Loaded saved project:", saved.title)
  }
}

/**
 * Migrate legacy button settings from older versions of the app to the new
 * `settings.buttons` array. This function checks for the presence of the
 * legacy fields (uploadedFile, downloadButtonText, contactButtonUrl,
 * contactButtonText) that may exist on projects saved before the refactor.
 * If found, it creates up to two buttons (file and contact/email) and
 * appends them to the buttons array, preserving any custom labels. After
 * migration the legacy properties are removed to avoid conflicts.
 */
function migrateLegacySettings() {
  const { store, actions } = window.LWB_State
  const state = store.getState()
  const settings = state.settings

  if (!settings) return

  // If buttons array already exists and has entries, do not migrate.
  if (Array.isArray(settings.buttons) && settings.buttons.length > 0) {
    // Remove any stale legacy fields if present
    delete settings.uploadedFile
    delete settings.uploadedFileName
    delete settings.downloadButtonText
    delete settings.contactButtonUrl
    delete settings.contactButtonText
    return
  }

  const migratedButtons = []

  // Migrate uploaded file to file button
  if (settings.uploadedFile) {
    const label = settings.downloadButtonText || "Download"
    migratedButtons.push({
      id: window.LWB_Utils.createUniqueId(),
      type: "file",
      label: label,
      file: settings.uploadedFile,
    })
  }

  // Migrate contact button (URL or email)
  if (settings.contactButtonUrl) {
    const url = settings.contactButtonUrl.trim()
    let type = "link"
    let valueKey = "href"
    const value = url

    if (url.includes("@") && !url.match(/^https?:/i)) {
      // treat as email if contains '@' and doesn't look like a URL
      type = "email"
      valueKey = "email"
    }

    const label = settings.contactButtonText || "Contact Us"
    const buttonObj = {
      id: window.LWB_Utils.createUniqueId(),
      type: type,
      label: label,
    }
    buttonObj[valueKey] = url
    migratedButtons.push(buttonObj)
  }

  // Assign migrated buttons (max 3) to settings.buttons
  // Update settings with migrated buttons
  if (migratedButtons.length > 0) {
    actions.updateSettings({
      buttons: migratedButtons.slice(0, 3),
      // Remove legacy fields
      uploadedFile: undefined,
      uploadedFileName: undefined,
      downloadButtonText: undefined,
      contactButtonUrl: undefined,
      contactButtonText: undefined,
    })
  }
}

// ===================================================
// SCREEN MANAGEMENT
// ===================================================

/**
 * Show specific screen
 */
function showScreen(screenName) {
  window.LWB_State.actions.setScreen(screenName)
}

/**
 * Handle home navigation
 */
function goHome() {
  const { selectors } = window.LWB_State
  const currentScreen = selectors.getCurrentScreen()
  const hasUnsavedChanges = selectors.hasUnsavedChanges()

  if (currentScreen === "editor" && hasUnsavedChanges) {
    if (confirm("You have unsaved changes. Are you sure you want to go back?")) {
      resetToUploadScreen()
    }
  } else {
    resetToUploadScreen()
  }
}

/**
 * Reset application to upload screen
 */
function resetToUploadScreen() {
  const { actions } = window.LWB_State

  // Reset project and settings
  actions.resetProject()
  // Reset settings to defaults. Legacy fields related to download/contact
  // buttons are omitted in favour of the new `buttons` array. Only
  // primary/secondary colours, typography and layout options are retained.
  actions.updateSettings({
    primaryColor: "#16a34a",
    secondaryColor: "#15803d",
    titleSize: "32",
    contentSize: "16",
    fontStyle: "system",
    headerAlignment: "center",
    logoSize: "120",
    layoutStyle: "single",
    darkMode: false,
    buttons: [],
    analyticsCode: "",
  })

  if (DOM_REFS.fileInput) {
    DOM_REFS.fileInput.value = ""
  }

  showScreen("upload")
  window.LWB_Utils.clearSavedProject()
}

// ===================================================
// FILE HANDLING
// ===================================================

/**
 * Initialize file handling functionality
 */
function initializeFileHandling() {
  // Initialize drag and drop
  if (DOM_REFS.dropZone) {
    window.LWB_FileHandlers.initializeDragAndDrop(DOM_REFS.dropZone, handleFile)

    // Click to upload
    DOM_REFS.dropZone.addEventListener("click", () => {
      if (DOM_REFS.fileInput) DOM_REFS.fileInput.click()
    })
  }

  // Browse button
  if (DOM_REFS.browseBtn) {
    DOM_REFS.browseBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      if (DOM_REFS.fileInput) DOM_REFS.fileInput.click()
    })
  }

  // File input change
  if (DOM_REFS.fileInput) {
    DOM_REFS.fileInput.addEventListener("change", (e) => {
      handleFile(e.target.files[0])
    })
  }

  // Back button
  if (DOM_REFS.backButton) {
    DOM_REFS.backButton.addEventListener("click", goHome)
  }
}

/**
 * Handle file upload and processing
 */
function handleFile(file) {
  if (!file) return

  const { actions } = window.LWB_State

  // Validate file
  const errors = window.LWB_FileHandlers.validateFile(file)
  if (errors.length > 0) {
    window.LWB_Utils.showToast(errors[0], "error")
    return
  }

  // Show loading screen
  actions.setLoading(true, "Processing your file", "Extracting content and analyzing structure...")
  showScreen("loading")

  // Process file
  window.LWB_FileHandlers.handleFile(
    file,
    (sections, fileName) => {
      // Success callback
      const project = {
        sections: sections,
        title: fileName.replace(/\.[^/.]+$/, "") || "My Website",
      }

      actions.loadProject(project)
      // Ensure there is exactly one header at index 0.  This guards
      // against import handlers that do not create a header.
      ensureHeaderExists()

      // Update UI
      if (DOM_REFS.pdfName) {
        DOM_REFS.pdfName.textContent = fileName
      }

      // After processing, attempt template suggestion based on the extracted content
      try {
        // Concatenate all text and HTML content from sections for analysis
        const allText = sections
          .map((sec) => {
            return (sec.content || [])
              .map((c) => {
                if (c.type === "text" || c.type === "html") {
                  // Strip HTML tags for analysis
                  return (c.value || "").replace(/<[^>]+>/g, " ")
                }
                return ""
              })
              .join(" ")
          })
          .join(" ")
        const suggestion = window.LWB_Templates?.suggestTemplateWithConfidence(allText)
        if (suggestion && suggestion.templateId && suggestion.templateId !== "blank") {
          const template = window.LWB_Templates.getTemplate(suggestion.templateId)
          if (template) {
            const pct = Math.round((suggestion.confidence || 0) * 100)
            window.LWB_Utils.showToast(`Suggested template: ${template.name} (${pct}% confidence)`, "info", 6000)
          }
        }
      } catch (e) {
        console.warn("Template suggestion failed:", e)
      }

      // Show editor
      actions.setLoading(false)
      showScreen("editor")
      // Trigger a project update to refresh the preview and schedule an autosave
      // updateProject(); // This is now handled by state management subscriptions
      // Mark unsaved changes after update (updateProject will schedule a save later)
      // markUnsavedChanges(); // This is now handled by state management subscriptions

      window.LWB_Utils.showToast("File processed successfully!", "success")
    },
    (error) => {
      // Error callback
      console.error("File processing error:", error)
      window.LWB_Utils.showToast(error, "error")
      actions.setLoading(false)
      showScreen("upload")
    },
  )
}

/**
 * Show loading screen with custom message
 */
function showLoadingScreen(title, message) {
  if (DOM_REFS.loadingTitle) DOM_REFS.loadingTitle.textContent = title
  if (DOM_REFS.loadingMessage) DOM_REFS.loadingMessage.textContent = message
  // Reset progress bar to 0 and display it
  if (DOM_REFS.loadingProgress && DOM_REFS.loadingProgressFill) {
    DOM_REFS.loadingProgress.style.display = "block"
    DOM_REFS.loadingProgressFill.style.width = "0%"
  }
  // showScreen('loading'); // This is now handled by state management subscriptions
}

/**
 * Update the progress bar and messages shown on the loading screen.
 * `step` updates the loading title, `progress` sets the bar width
 * (0–1), and `message` updates the loading message. Any of these
 * parameters may be omitted. The progress bar is revealed on first
 * update.
 *
 * @param {string} step A short title describing the current step
 * @param {number} progress A value between 0 and 1 indicating completion
 * @param {string} message A descriptive message for the user
 */
function updateLoadingProgress(step, progress, message) {
  // Show progress bar
  if (DOM_REFS.loadingProgress) {
    DOM_REFS.loadingProgress.style.display = "block"
  }
  if (step && DOM_REFS.loadingTitle) {
    DOM_REFS.loadingTitle.textContent = step
  }
  if (message && DOM_REFS.loadingMessage) {
    DOM_REFS.loadingMessage.textContent = message
  }
  if (typeof progress === "number" && DOM_REFS.loadingProgressFill) {
    const pct = Math.min(Math.max(progress, 0), 1) * 100
    DOM_REFS.loadingProgressFill.style.width = pct + "%"
  }
}

// Expose progress updater globally so other modules can emit progress
window.updateLoadingProgress = updateLoadingProgress

// ===================================================
// EDITOR MANAGEMENT
// ===================================================

/**
 * Initialize editor functionality
 */
function initializeEditor() {
  const { selectors, actions } = window.LWB_State
  const project = selectors.getCurrentProject()

  // Render sections
  window.LWB_Editor.renderSections(project)

  // Auto-expand first non-header section
  const firstSection = project.sections.find((s) => !s.isHeader)
  if (firstSection) {
    setTimeout(() => {
      window.LWB_Editor.expandSection(firstSection.id)
      actions.toggleSectionExpanded(firstSection.id)
    }, 100)
  }

  // Load settings into UI
  loadSettingsIntoUI()

  // Update preview
  updatePreview()
}

/**
 * Load current settings into UI elements
 */
function loadSettingsIntoUI() {
  const { selectors } = window.LWB_State
  const settings = selectors.getSettings()

  // Colors
  if (DOM_REFS.primaryColor) DOM_REFS.primaryColor.value = settings.primaryColor
  if (DOM_REFS.primaryColorHex) DOM_REFS.primaryColorHex.value = settings.primaryColor
  if (DOM_REFS.secondaryColor) DOM_REFS.secondaryColor.value = settings.secondaryColor
  if (DOM_REFS.secondaryColorHex) DOM_REFS.secondaryColorHex.value = settings.secondaryColor

  // Sizes
  if (DOM_REFS.titleSize) DOM_REFS.titleSize.value = settings.titleSize
  if (DOM_REFS.contentSize) DOM_REFS.contentSize.value = settings.contentSize
  if (DOM_REFS.logoSize) DOM_REFS.logoSize.value = settings.logoSize

  // Other settings
  if (DOM_REFS.fontStyle) DOM_REFS.fontStyle.value = settings.fontStyle
  if (DOM_REFS.headerAlignment) DOM_REFS.headerAlignment.value = settings.headerAlignment
  if (DOM_REFS.layoutStyle) DOM_REFS.layoutStyle.value = settings.layoutStyle
  if (DOM_REFS.analyticsCode) DOM_REFS.analyticsCode.value = settings.analyticsCode

  // Render custom buttons manager
  if (typeof renderButtonsManager === "function") {
    renderButtonsManager()
  }
  // Update value displays
  updateSizeDisplays()
}

/**
 * Update size value displays
 */
function updateSizeDisplays() {
  const { selectors } = window.LWB_State
  const settings = selectors.getSettings()

  if (DOM_REFS.titleSizeValue) {
    DOM_REFS.titleSizeValue.textContent = `${settings.titleSize}px`
  }
  if (DOM_REFS.contentSizeValue) {
    DOM_REFS.contentSizeValue.textContent = `${settings.contentSize}px`
  }
  if (DOM_REFS.logoSizeValue) {
    DOM_REFS.logoSizeValue.textContent = `${settings.logoSize}px`
  }
}

/**
 * Enforce that the header section (if any) always occupies index 0 in
 * the currentProject.sections array. If multiple sections are marked
 * as header, only the first encountered remains header; others are
 * demoted. If no section is marked header, nothing happens.
 */
function enforceHeaderPosition() {
  const sections = APP_STATE.currentProject.sections
  if (!Array.isArray(sections) || sections.length === 0) return
  let headerIndex = -1
  // Find first header index and demote any subsequent headers
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].isHeader) {
      if (headerIndex === -1) {
        headerIndex = i
      } else {
        // More than one header found; demote extra headers
        sections[i].isHeader = false
      }
    }
  }
  if (headerIndex > 0) {
    // Move the header section to the front
    const [headerSection] = sections.splice(headerIndex, 1)
    sections.unshift(headerSection)
  }
}

/**
 * Ensure that the provided project has exactly one header section at index 0.
 *
 * This function will inspect the project.sections array and do the following:
 *  - If no section is marked as the header, a new header section will be
 *    created and inserted at the beginning of the array.  The new header
 *    will use the project title for its H1 if available; otherwise a
 *    generic "Header" label is used.  A default icon is chosen and the
 *    isHeader flag is set to true.
 *  - If multiple sections are flagged as headers, only the first one is
 *    promoted to index 0.  Any additional headers are demoted by
 *    clearing their isHeader flag.
 *  - If a header exists but is not located at index 0, it will be moved
 *    to the front of the array.
 *
 * This helper is idempotent and may be safely called whenever the
 * sections array might have been mutated (e.g. after loading, importing,
 * creating a blank project or updating the project).  It does not
 * perform any rendering or saving; callers should invoke updateProject()
 * afterwards if the change should trigger a re-render.
 *
 * @param {object} project The current project whose sections should be normalized
 */
function ensureHeaderExists() {
  const { store, actions, selectors } = window.LWB_State
  const project = selectors.getCurrentProject()

  if (!project || !Array.isArray(project.sections)) return

  const sections = [...project.sections]
  const headerIndices = []

  // Find all header sections
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].isHeader) {
      headerIndices.push(i)
    }
  }

  if (headerIndices.length === 0) {
    // No existing header – insert a new one at the beginning
    const title = project.title || "Header"
    const headerId = window.LWB_Utils.createUniqueId()
    const headerSection = {
      id: headerId,
      name: "Header",
      icon: "📄",
      isHeader: true,
      content: [
        {
          type: "text",
          // Wrap the title in an H1; allowHtml false to ensure consistency
          value: `<h1>${title}</h1>`,
          allowHtml: false,
          id: window.LWB_Utils.createUniqueId(),
        },
      ],
    }
    sections.unshift(headerSection)
    actions.updateProject({ sections })
    return
  }

  // If multiple headers exist, demote all but the first
  for (let i = 1; i < headerIndices.length; i++) {
    sections[headerIndices[i]].isHeader = false
  }

  // Move the first header to index 0 if necessary
  const firstHeaderIndex = headerIndices[0]
  if (firstHeaderIndex > 0) {
    const [headerSection] = sections.splice(firstHeaderIndex, 1)
    sections.unshift(headerSection)
  }

  actions.updateProject({ sections })
}

/**
 * Mark project as having unsaved changes
 */
function markUnsavedChanges() {
  // APP_STATE.unsavedChanges = true; // Replaced by state management
  window.LWB_State.actions.setUnsavedChanges(true)
}

/**
 * Update project and trigger save
 */
function updateProject() {
  // window.updateProject = updateProject; // This is no longer needed with state management
  // Guarantee a header section exists and is normalized
  ensureHeaderExists()
  // Ensure the header section remains at the top of the array if present
  enforceHeaderPosition()
  markUnsavedChanges()
  updatePreview()

  // Debounced save
  if (updateProject.saveTimeout) {
    clearTimeout(updateProject.saveTimeout)
  }
  updateProject.saveTimeout = setTimeout(() => {
    const { store, selectors } = window.LWB_State
    window.LWB_Utils.saveProject(selectors.getCurrentProject())
    // APP_STATE.unsavedChanges = false; // Replaced by state management
    store.setState({ unsavedChanges: false }, { silent: true })
  }, 1000)
}

// ===================================================
// PREVIEW MANAGEMENT
// ===================================================

/**
 * Update website preview
 */
function updatePreview() {
  if (!DOM_REFS.websitePreview) return

  // Save scroll position
  let scrollPos = 0
  try {
    if (DOM_REFS.websitePreview.contentWindow) {
      scrollPos = DOM_REFS.websitePreview.contentWindow.pageYOffset || 0
    }
  } catch (e) {
    // Handle cross-origin issues
  }

  // Generate preview HTML
  const previewHtml = generatePreviewHtml()
  DOM_REFS.websitePreview.srcdoc = previewHtml

  // Restore scroll position
  DOM_REFS.websitePreview.onload = () => {
    if (scrollPos > 0) {
      setTimeout(() => {
        try {
          DOM_REFS.websitePreview.contentWindow.scrollTo(0, scrollPos)
        } catch (e) {
          // Handle cross-origin issues
        }
      }, 100)
    }
  }
}

/**
 * Sanitize HTML content for safe embedding in preview. Removes
 * <script> tags and inline event handlers. This mirrors the
 * sanitisation used in the export module but is defined here to
 * avoid cross‑module dependencies.
 *
 * @param {string} html Raw HTML string
 * @returns {string} Sanitised HTML
 */
function sanitizeHtmlContent(html) {
  if (!html) return ""
  let safe = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
  safe = safe.replace(/ on\w+="[^"]*"/gi, "")
  safe = safe.replace(/ on\w+='[^']*'/gi, "")
  return safe
}

/**
 * Generate preview HTML
 */
function generatePreviewHtml() {
  const { selectors } = window.LWB_State
  const settings = selectors.getSettings()
  const project = selectors.getCurrentProject()

  const { primaryColor, secondaryColor, layoutStyle, titleSize, contentSize, fontStyle, headerAlignment, logoSize } =
    settings

  const fontFamily = window.LWB_Export.getFontFamily(fontStyle)

  const navHtml = generatePreviewNavigation()
  const sectionsHtml = generatePreviewSections()
  const buttonsHtml = generatePreviewButtons()

  // Utility to compute text color based on background brightness
  function getContrastColor(hex) {
    // Remove '#' if present
    let clean = hex.replace("#", "")
    // If shorthand (#abc) expand to full form
    if (clean.length === 3) {
      clean = clean
        .split("")
        .map((ch) => ch + ch)
        .join("")
    }
    const r = Number.parseInt(clean.substring(0, 2), 16) / 255
    const g = Number.parseInt(clean.substring(2, 4), 16) / 255
    const b = Number.parseInt(clean.substring(4, 6), 16) / 255
    // Calculate relative luminance per WCAG
    const toLinear = (c) => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    }
    const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
    return L > 0.5 ? "#111111" : "#ffffff"
  }

  const headerTextColor = getContrastColor(primaryColor)

  return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: ${fontFamily};
                    margin: 0;
                    padding: 0;
                    background: #f8fafc;
                    font-size: ${contentSize}px;
                    line-height: 1.6;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background: ${primaryColor};
                    color: ${headerTextColor};
                    padding: 60px 40px;
                    border-radius: 16px;
                    margin-bottom: 30px;
                    text-align: ${headerAlignment};
                    position: relative;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                }
                .logo {
                    max-width: ${logoSize}px;
                    max-height: ${logoSize}px;
                    margin-bottom: 20px;
                    background: white;
                    padding: 12px;
                    border-radius: 12px;
                    display: inline-block;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                h1 { 
                    margin: 0 0 10px 0; 
                    font-size: ${titleSize}px;
                    font-weight: 700;
                }
                h2 {
                    margin: 0 0 16px 0;
                    font-size: ${Math.round(titleSize * 0.75)}px;
                    color: ${primaryColor};
                }
                h3 {
                    margin: 16px 0 12px 0;
                    font-size: ${Math.round(titleSize * 0.6)}px;
                    color: #374151;
                }
                .section {
                    background: white;
                    padding: 30px;
                    margin-bottom: 20px;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    scroll-margin-top: ${layoutStyle === "sections" ? "80px" : "20px"};
                }
                .content-block {
                    margin-bottom: 20px;
                }
                .content-block p {
                    margin-bottom: 12px;
                }
                .content-block ul,
                .content-block ol {
                    margin-left: 20px;
                    margin-bottom: 12px;
                }
                .content-block a {
                    color: ${primaryColor};
                    text-decoration: underline;
                }
                .content-block a:hover {
                    color: ${secondaryColor};
                }
                .image-block {
                    text-align: center;
                    margin: 20px 0;
                }
                .image-block img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .image-caption {
                    margin-top: 12px;
                    font-style: italic;
                    color: #666;
                    font-size: ${Math.round(contentSize * 0.9)}px;
                }
                .image-caption a {
                    color: ${primaryColor};
                    text-decoration: underline;
                }
                .image-caption a:hover {
                    color: ${secondaryColor};
                }
                .pdf-download {
                    background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
                    color: white;
                    padding: 16px 32px;
                    border-radius: 50px;
                    font-weight: 600;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                    border: none;
                    cursor: pointer;
                    font-size: 16px;
                    display: inline-block;
                    margin: 40px auto 20px;
                    transition: all 0.3s ease;
                    text-decoration: none;
                }
                .pdf-download:hover { 
                    transform: translateY(-2px); 
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }
                .pdf-download-container {
                    text-align: center;
                    padding: 20px;
                    background: white;
                    margin-top: 40px;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                }
                
                /* Navigation styles */
                nav {
                    position: sticky;
                    top: 0;
                    background: white;
                    border-bottom: 1px solid #e5e7eb;
                    padding: 16px;
                    z-index: 100;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                nav .nav-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    gap: 20px;
                    align-items: center;
                    flex-wrap: wrap;
                }
                nav a {
                    color: ${primaryColor};
                    text-decoration: none;
                    font-weight: 500;
                    padding: 8px 12px;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }
                nav a:hover {
                    background: #f0fdf4;
                }
                
                /* Hamburger menu styles */
                #hamburgerMenu {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1000;
                }
                #hamburgerMenu button {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 10px;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .menu-line {
                    width: 24px;
                    height: 2px;
                    background: ${primaryColor};
                    margin: 4px 0;
                }
                #menuDropdown {
                    display: none;
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    margin-top: 8px;
                    padding: 16px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                    min-width: 200px;
                }
                #menuDropdown a {
                    display: block;
                    padding: 8px 12px;
                    color: ${primaryColor};
                    text-decoration: none;
                    font-weight: 500;
                    border-radius: 8px;
                    transition: background 0.2s;
                }
                #menuDropdown a:hover {
                    background: #f0fdf4;
                }
                #menuDropdown hr {
                    margin: 12px 0;
                    border: none;
                    border-top: 1px solid #e5e7eb;
                }
                #menuDropdown .pdf-download {
                    background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
                    color: white !important;
                    text-align: center;
                    display: block;
                    margin-top: 8px;
                }
            </style>
        </head>
        <body>
            ${navHtml}
            <div class="container">
                ${sectionsHtml}
            </div>
            ${layoutStyle === "single" ? buttonsHtml : ""}
            
            ${
              layoutStyle === "menu"
                ? `
            <script>
                function toggleMenu() {
                    const dropdown = document.getElementById('menuDropdown');
                    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                }
                document.addEventListener('click', function(event) {
                    const menu = document.getElementById('hamburgerMenu');
                    if (menu && !menu.contains(event.target)) {
                        const dropdown = document.getElementById('menuDropdown');
                        if (dropdown) dropdown.style.display = 'none';
                    }
                });
            </script>
            `
                : ""
            }
        </body>
        </html>
    `
}

/**
 * Generate preview navigation
 */
function generatePreviewNavigation() {
  const { selectors } = window.LWB_State
  const settings = selectors.getSettings()
  const project = selectors.getCurrentProject()
  const { layoutStyle } = settings
  const buttons = generatePreviewButtonsArray()

  // Helper to build section link label respecting the showIcon flag
  const buildSectionLabel = (section) => {
    const iconPart = section.showIcon === false ? "" : `${section.icon} `
    return `${iconPart}${section.name}`
  }

  if (layoutStyle === "sections") {
    return `
            <nav>
                <div class="nav-container">
                    ${project.sections
                      .map((section) => `<a href="#${section.id}">${buildSectionLabel(section)}</a>`)
                      .join("")}
                    <div style="margin-left: auto;">
                        ${buttons.join("")}
                    </div>
                </div>
            </nav>
        `
  } else if (layoutStyle === "menu") {
    return `
            <div id="hamburgerMenu">
                <button onclick="toggleMenu()">
                    <div class="menu-line"></div>
                    <div class="menu-line"></div>
                    <div class="menu-line"></div>
                </button>
                <div id="menuDropdown">
                    ${project.sections
                      .map(
                        (section) =>
                          `<a href="#${section.id}" onclick="toggleMenu()">${buildSectionLabel(section)}</a>`,
                      )
                      .join("")}
                    <hr>
                    ${buttons.join("")}
                </div>
            </div>
        `
  }

  return ""
}

/**
 * Generate preview buttons array
 */
function generatePreviewButtonsArray() {
  const { selectors } = window.LWB_State
  const settings = selectors.getSettings()
  const result = []
  const buttonSettings = settings.buttons || []
  // Simple HTML escaping helper
  const esc = (str) => {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
  }
  buttonSettings.forEach((btn) => {
    const label = btn.label || (btn.type === "file" ? "Download" : btn.type === "email" ? "Email us" : "Visit site")
    if (btn.type === "file" && btn.file) {
      // Use alert for preview to indicate file download
      result.push(
        `<button class="pdf-download" onclick="alert('Download: ${esc(btn.file.name)}')">${getFileIcon(btn.file.name)} ${esc(label)}</button>`,
      )
    } else if (btn.type === "email" && btn.email) {
      result.push(
        `<button class="pdf-download" onclick="alert('Email: ${esc(btn.email)}')">${getEmailIcon()} ${esc(label)}</button>`,
      )
    } else if (btn.type === "link" && btn.href) {
      // Normalize URL: prefix with https:// if protocol missing
      let normalized = btn.href.trim()
      if (!/^https?:\/\//i.test(normalized)) {
        normalized = "https://" + normalized
      }
      result.push(
        `<button class="pdf-download" onclick="alert('Link: ${esc(normalized)}')">${getLinkIcon()} ${esc(label)}</button>`,
      )
    }
  })
  return result
}

/**
 * Generate preview buttons HTML
 */
function generatePreviewButtons() {
  const buttons = generatePreviewButtonsArray()
  return `
        <div class="pdf-download-container">
            ${buttons.join("")}
        </div>
    `
}

/**
 * Generate preview sections
 */
function generatePreviewSections() {
  const { selectors } = window.LWB_State
  const project = selectors.getCurrentProject()

  return project.sections
    .map((section) => {
      if (section.isHeader) {
        // Header section does not display the section name or icon; only the logo and content
        return `
                <div class="header" id="${section.id}">
                    ${project.logoUrl ? `<div><img src="${project.logoUrl}" class="logo" alt="Logo"></div>` : ""}
                    ${section.content
                      .map((content) => {
                        if (content.type === "text") {
                          return content.allowHtml ? sanitizeHtmlContent(content.value) : `<div>${content.value}</div>`
                        } else if (content.type === "html") {
                          return sanitizeHtmlContent(content.value)
                        }
                        return ""
                      })
                      .join("")}
                </div>
            `
      } else {
        // Determine label prefix: include icon only if showIcon is not explicitly false
        const labelPrefix = section.showIcon === false ? "" : `${section.icon} `
        return `
                <div class="section" id="${section.id}">
                    <h2>${labelPrefix}${section.name}</h2>
                    ${section.content
                      .map((content) => {
                        if (content.type === "text") {
                          return `<div class="content-block">${content.value}</div>`
                        } else if (content.type === "html") {
                          // Sanitize HTML content before injecting into preview
                          return `<div class="content-block">${sanitizeHtmlContent(content.value)}</div>`
                        } else if (content.type === "image" && content.url) {
                          return `
                                <div class="image-block">
                                    <img src="${content.url}" alt="${section.name} image">
                                    ${content.caption ? `<div class="image-caption">${content.caption}</div>` : ""}
                                </div>
                            `
                        }
                        return ""
                      })
                      .join("")}
                </div>
            `
      }
    })
    .join("")
}

// Helper functions for button icons
function getFileIcon(filename) {
  const ext = filename.split(".").pop().toLowerCase()
  const icons = {
    pdf: "📄",
    docx: "📝",
    doc: "📝",
    txt: "📄",
    png: "🖼️",
    jpg: "🖼️",
    jpeg: "🖼️",
    pptx: "📊",
    xlsx: "📈",
  }
  return icons[ext] || "📄"
}

function getEmailIcon() {
  return "📧"
}
function getLinkIcon() {
  return "🔗"
}

// ===================================================
// SETTINGS MANAGEMENT
// ===================================================

/**
 * Update color scheme
 */
function updateColorScheme() {
  const scheme = DOM_REFS.colorScheme?.value
  if (!scheme) return

  window.LWB_State.actions.updateColorScheme(scheme)

  if (scheme !== "custom") {
    loadSettingsIntoUI()
  }
}

/**
 * Update title size
 */
function updateTitleSize() {
  const size = DOM_REFS.titleSize?.value
  if (size) {
    window.LWB_State.actions.updateSettings({ titleSize: size })
    updateSizeDisplays()
  }
}

/**
 * Update content size
 */
function updateContentSize() {
  const size = DOM_REFS.contentSize?.value
  if (size) {
    window.LWB_State.actions.updateSettings({ contentSize: size })
    updateSizeDisplays()
  }
}

/**
 * Update logo size
 */
function updateLogoSize() {
  const size = DOM_REFS.logoSize?.value
  if (size) {
    window.LWB_State.actions.updateSettings({ logoSize: size })
    updateSizeDisplays()
  }
}

/**
 * Handle logo upload
 */
function handleLogoUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  // Validate image
  if (!file.type.startsWith("image/")) {
    window.LWB_Utils.showToast("Please upload an image file", "error")
    return
  }

  // Max size 5MB
  if (file.size > 5 * 1024 * 1024) {
    window.LWB_Utils.showToast("Logo file too large. Maximum size is 5MB.", "error")
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    window.LWB_State.actions.updateProject({ logoUrl: e.target.result })

    const logoPreview = document.getElementById("logoPreview")
    if (logoPreview) {
      logoPreview.innerHTML = `
                <img src="${e.target.result}" style="max-width: 200px; margin-top: 10px; border-radius: 8px; border: 1px solid #e5e7eb; padding: 8px; background: white;">
                <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">Logo uploaded successfully! Use the size slider above to adjust.</p>
            `
    }

    window.LWB_Utils.showToast("Logo uploaded successfully", "success")
  }
  reader.readAsDataURL(file)
}

// ===================================================
// TAB MANAGEMENT
// ===================================================

/**
 * Switch between content, design, and settings tabs
 */
function switchTab(tabName) {
  window.LWB_State.actions.setActiveTab(tabName)

  // Update tab buttons
  document.querySelectorAll(".tab").forEach((tab) => {
    if (tab.dataset.tab === tabName) {
      tab.classList.add("active")
    } else {
      tab.classList.remove("active")
    }
  })

  // Update tab content
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active")
  })

  const targetTab = document.getElementById(`${tabName}Tab`)
  if (targetTab) {
    targetTab.classList.add("active")
  }
}

// ===================================================
// SETTINGS TAB FUNCTIONALITY
// ===================================================

// ===================================================
// CUSTOM BUTTONS MANAGER
// ===================================================

/**
 * Create a new button and add it to the settings. Supports a maximum of three buttons.
 * @param {string} type The button type ('file', 'link', or 'email').
 */
function addButton(type) {
  if (!["file", "link", "email"].includes(type)) return

  const { selectors, actions } = window.LWB_State
  const settings = selectors.getSettings()
  const buttons = settings.buttons || []

  if (buttons.length >= 3) {
    window.LWB_Utils.showToast("You can only add up to 3 buttons", "error")
    return
  }

  const id = window.LWB_Utils.createUniqueId()
  // Default labels depending on type
  let label
  if (type === "file") label = "Download"
  else if (type === "link") label = "Visit site"
  else label = "Email us"

  const newBtn = { id, type, label }
  // For link/email, create empty field for user to fill
  if (type === "link") newBtn.href = ""
  if (type === "email") newBtn.email = ""

  const updatedButtons = [...buttons, newBtn]
  actions.updateSettings({ buttons: updatedButtons })

  renderButtonsManager()
}

/**
 * Update a button's property. Accepts partial updates.
 * @param {string} id Button id
 * @param {Object} updates Key-value pairs of properties to update
 */
function updateButton(id, updates) {
  const { selectors, actions } = window.LWB_State
  const settings = selectors.getSettings()
  const buttons = settings.buttons || []

  const updatedButtons = buttons.map((btn) => (btn.id === id ? { ...btn, ...updates } : btn))

  actions.updateSettings({ buttons: updatedButtons })
  renderButtonsManager()
}

/**
 * Remove a button by id
 * @param {string} id Button id
 */
function removeButton(id) {
  const { selectors, actions } = window.LWB_State
  const settings = selectors.getSettings()
  const buttons = settings.buttons || []

  const updatedButtons = buttons.filter((btn) => btn.id !== id)
  actions.updateSettings({ buttons: updatedButtons })

  renderButtonsManager()
}

/**
 * Move a button from one index to another to reorder
 * @param {number} fromIndex Original index
 * @param {number} toIndex Target index
 */
function reorderButtons(fromIndex, toIndex) {
  const { selectors, actions } = window.LWB_State
  const settings = selectors.getSettings()
  const buttons = [...(settings.buttons || [])]

  if (fromIndex < 0 || toIndex < 0 || fromIndex >= buttons.length || toIndex >= buttons.length) return

  const [moved] = buttons.splice(fromIndex, 1)
  buttons.splice(toIndex, 0, moved)

  actions.updateSettings({ buttons })
  renderButtonsManager()
}

/**
 * Handle file upload for a specific button. Reads the file as data URL and updates the button object.
 * @param {Event} event The file input change event
 * @param {string} id The id of the button being updated
 */
function handleButtonFileUpload(event, id) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    updateButton(id, {
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: e.target.result,
      },
    })
    window.LWB_Utils.showToast("File uploaded for button", "success")
  }
  reader.readAsDataURL(file)
}

/**
 * Render the buttons manager UI. This function rebuilds the list of button controls
 * and the add button controls inside the settings tab whenever the buttons array changes.
 */
function renderButtonsManager() {
  const { selectors } = window.LWB_State
  const settings = selectors.getSettings()
  const container = DOM_REFS.buttonsContainer
  const addMenu = DOM_REFS.addButtonMenu
  const preview = DOM_REFS.buttonPreview

  if (!container) return

  const buttons = settings.buttons || []

  // Clear container
  container.innerHTML = ""

  // Build list items
  buttons.forEach((btn, index) => {
    const item = document.createElement("div")
    item.className = "button-item"

    // Type label
    const typeLabel = document.createElement("span")
    typeLabel.textContent = btn.type === "file" ? "File" : btn.type === "link" ? "Link" : "Email"
    item.appendChild(typeLabel)

    // Label input
    const labelInput = document.createElement("input")
    labelInput.type = "text"
    labelInput.value = btn.label || ""
    labelInput.placeholder = "Button label"
    labelInput.className = "form-input"
    labelInput.onchange = (e) => updateButton(btn.id, { label: e.target.value })
    item.appendChild(labelInput)

    // Value input (file/link/email)
    let valueInput
    if (btn.type === "file") {
      valueInput = document.createElement("div")
      const fileButton = document.createElement("label")
      fileButton.className = "file-upload-label"
      fileButton.style.display = "inline-block"
      fileButton.style.padding = "6px 12px"
      fileButton.style.background = "var(--primary)"
      fileButton.style.color = "white"
      fileButton.style.borderRadius = "var(--radius-md)"
      fileButton.style.cursor = "pointer"
      fileButton.textContent = btn.file ? "Change File" : "Upload File"

      const fileInput = document.createElement("input")
      fileInput.type = "file"
      fileInput.style.display = "none"
      fileInput.onchange = (e) => handleButtonFileUpload(e, btn.id)
      fileButton.appendChild(fileInput)
      valueInput.appendChild(fileButton)

      if (btn.file) {
        const fileInfo = document.createElement("div")
        fileInfo.style.fontSize = "12px"
        fileInfo.style.marginTop = "4px"
        fileInfo.textContent = btn.file.name
        valueInput.appendChild(fileInfo)
      }
    } else {
      valueInput = document.createElement("input")
      valueInput.type = btn.type === "email" ? "email" : "url"
      valueInput.value = btn.type === "email" ? btn.email || "" : btn.href || ""
      valueInput.placeholder = btn.type === "email" ? "Email address" : "https://example.com"
      valueInput.className = "form-input"
      valueInput.onchange = (e) => {
        const val = e.target.value
        if (btn.type === "email") {
          updateButton(btn.id, { email: val })
        } else {
          updateButton(btn.id, { href: val })
        }
      }
    }
    item.appendChild(valueInput)

    // Reorder controls
    const reorderContainer = document.createElement("div")
    reorderContainer.style.display = "flex"
    reorderContainer.style.flexDirection = "column"

    const upBtn = document.createElement("button")
    upBtn.className = "icon-btn"
    upBtn.textContent = "↑"
    upBtn.disabled = index === 0
    upBtn.onclick = () => reorderButtons(index, index - 1)

    const downBtn = document.createElement("button")
    downBtn.className = "icon-btn"
    downBtn.textContent = "↓"
    downBtn.disabled = index === buttons.length - 1
    downBtn.onclick = () => reorderButtons(index, index + 1)

    reorderContainer.appendChild(upBtn)
    reorderContainer.appendChild(downBtn)
    item.appendChild(reorderContainer)

    // Delete button
    const deleteBtn = document.createElement("button")
    deleteBtn.className = "icon-btn danger"
    deleteBtn.textContent = "🗑"
    deleteBtn.onclick = () => removeButton(btn.id)
    item.appendChild(deleteBtn)

    container.appendChild(item)
  })

  // Update add button menu visibility
  if (addMenu) {
    if (buttons.length >= 3) {
      addMenu.style.display = "none"
    } else {
      addMenu.style.display = ""
    }
  }

  // Render preview of buttons
  if (preview) {
    const previewButtons = generatePreviewButtonsArray()
    if (previewButtons.length > 0) {
      preview.innerHTML = previewButtons.join("")
    } else {
      preview.innerHTML = '<p style="color: var(--muted-foreground); font-size: 14px;">No buttons configured</p>'
    }
  }
}

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

/**
 * Get file type from filename
 */
function getFileType(filename) {
  return filename.split(".").pop().toLowerCase()
}

/**
 * Toggle dark mode for builder
 */
function toggleBuilderDarkMode() {
  const root = document.body
  root.classList.toggle("builder-dark")
  const isDark = root.classList.contains("builder-dark")

  window.LWB_State.actions.updateSettings({ darkMode: isDark })

  const btn = document.getElementById("builderThemeToggle")
  if (btn) btn.textContent = isDark ? "☀️ Light" : "🌙 Dark"
}

// ===================================================
// MODAL MANAGEMENT
// ===================================================

/**
 * Show preview modal
 */
function showPreviewModal() {
  if (!DOM_REFS.previewModal || !DOM_REFS.fullPreview) return

  // Copy current preview
  DOM_REFS.fullPreview.srcdoc = DOM_REFS.websitePreview.srcdoc

  // Show modal
  DOM_REFS.previewModal.classList.add("active")

  // Sync scroll position
  DOM_REFS.fullPreview.onload = () => {
    try {
      const scrollPos = DOM_REFS.websitePreview.contentWindow.pageYOffset || 0
      if (scrollPos > 0) {
        setTimeout(() => {
          DOM_REFS.fullPreview.contentWindow.scrollTo(0, scrollPos)
        }, 100)
      }
    } catch (e) {
      // Handle cross-origin issues
    }
  }
}

/**
 * Close preview modal
 */
function closePreviewModal() {
  if (!DOM_REFS.previewModal) return

  // Sync scroll position back
  try {
    const modalScrollPos = DOM_REFS.fullPreview.contentWindow.pageYOffset || 0
    if (modalScrollPos > 0) {
      setTimeout(() => {
        DOM_REFS.websitePreview.contentWindow.scrollTo(0, modalScrollPos)
      }, 100)
    }
  } catch (e) {
    // Handle cross-origin issues
  }

  DOM_REFS.previewModal.classList.remove("active")
}

/**
 * Set preview device frame
 */
function setPreviewDevice(device) {
  if (!DOM_REFS.previewFrame) return

  DOM_REFS.previewFrame.className = `preview-frame ${device}`

  // Update button states
  document.querySelectorAll(".modal-header .btn").forEach((btn) => {
    btn.classList.remove("active")
  })

  // Find and activate the right button
  const btnId =
    device === "desktop"
      ? "desktopBtn"
      : device === "tablet-h"
        ? "tabletHBtn"
        : device === "tablet-v"
          ? "tabletVBtn"
          : "mobileBtn"

  const deviceBtn = document.getElementById(btnId)
  if (deviceBtn) {
    deviceBtn.classList.add("active")
  }
}

/**
 * Show export modal
 */
function exportWebsite() {
  if (DOM_REFS.exportModal) {
    DOM_REFS.exportModal.classList.add("active")
  }
}

/**
 * Close export modal
 */
function closeExportModal() {
  if (DOM_REFS.exportModal) {
    DOM_REFS.exportModal.classList.remove("active")
  }
}

/**
 * Download website with selected format
 */
function downloadWebsite() {
  const formatInput = document.querySelector('input[name="exportFormat"]:checked')
  const format = formatInput ? formatInput.value : "html"

  window.LWB_Utils.showToast(`Generating ${format.toUpperCase()} file...`, "success")

  // Add analytics code from settings
  const analyticsCode = DOM_REFS.analyticsCode?.value || ""
  window.LWB_State.actions.updateSettings({ analyticsCode })

  const { selectors } = window.LWB_State
  const project = selectors.getCurrentProject()
  const settings = selectors.getSettings()

  const result = window.LWB_Export.exportWebsite(project, settings, format)

  if (result.success) {
    closeExportModal()
    setTimeout(() => {
      window.LWB_Utils.showToast("Download complete!", "success")
    }, 500)
  } else {
    window.LWB_Utils.showToast(`Export failed: ${result.error}`, "error")
  }
}

/**
 * Show info modal
 */
function showInfo() {
  if (DOM_REFS.infoModal) {
    DOM_REFS.infoModal.classList.add("active")
  }
}

/**
 * Close info modal
 */
function closeInfoModal() {
  if (DOM_REFS.infoModal) {
    DOM_REFS.infoModal.classList.remove("active")
  }
}

// ===================================================
// AUTO-SAVE
// ===================================================

/**
 * Initialize auto-save functionality
 */
function initializeAutoSave() {
  // Auto-save every 30 seconds if there are unsaved changes
  setInterval(() => {
    const { selectors } = window.LWB_State
    if (selectors.hasUnsavedChanges()) {
      window.LWB_Utils.saveProject(selectors.getCurrentProject())
      // APP_STATE.unsavedChanges = false; // Replaced by state management
      window.LWB_State.store.setState({ unsavedChanges: false }, { silent: true })
    }
  }, 30000)
}

// ===================================================
// GLOBAL EVENT LISTENERS
// ===================================================

/**
 * Set up global event listeners
 */
function setupGlobalEventListeners() {
  // 'Create Blank Website' button
  if (DOM_REFS.blankBtn) {
    DOM_REFS.blankBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      createBlankWebsite()
    })
  }

  // Handle settings changes
  const settingsElements = [
    { id: "primaryColor", handler: updateColorInput },
    { id: "primaryColorHex", handler: updateColorInput },
    { id: "secondaryColor", handler: updateColorInput },
    { id: "secondaryColorHex", handler: updateColorInput },
    { id: "headerAlignment", handler: updateSetting },
    { id: "fontStyle", handler: updateSetting },
    { id: "layoutStyle", handler: updateSetting },
  ]

  settingsElements.forEach(({ id, handler }) => {
    const element = DOM_REFS[id]
    if (element) {
      element.addEventListener("change", handler || updateSetting)
    }
  })

  // Handle keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Ctrl+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault()
      const { selectors } = window.LWB_State
      if (selectors.hasUnsavedChanges()) {
        const project = selectors.getCurrentProject()
        window.LWB_Utils.saveProject(project)
        window.LWB_State.store.setState({ unsavedChanges: false }, { silent: true })
        window.LWB_Utils.showToast("Project saved", "success")
      }
    }

    // Escape to close modals
    if (e.key === "Escape") {
      closePreviewModal()
      closeExportModal()
      closeInfoModal()
    }
  })

  // Handle window beforeunload
  window.addEventListener("beforeunload", (e) => {
    const { selectors } = window.LWB_State
    if (selectors.hasUnsavedChanges()) {
      e.preventDefault()
      e.returnValue = ""
    }
  })

  // Close modals when clicking outside
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active")
      }
    })
  })
}

/**
 * Update color input handler
 */
function updateColorInput(e) {
  const id = e.target.id
  const value = e.target.value

  if (id === "primaryColor" || id === "primaryColorHex") {
    window.LWB_State.actions.updateSettings({ primaryColor: value })
    if (DOM_REFS.primaryColor) DOM_REFS.primaryColor.value = value
    if (DOM_REFS.primaryColorHex) DOM_REFS.primaryColorHex.value = value
  } else if (id === "secondaryColor" || id === "secondaryColorHex") {
    window.LWB_State.actions.updateSettings({ secondaryColor: value })
    if (DOM_REFS.secondaryColor) DOM_REFS.secondaryColor.value = value
    if (DOM_REFS.secondaryColorHex) DOM_REFS.secondaryColorHex.value = value
  }
}

/**
 * Update setting handler
 */
function updateSetting(e) {
  const id = e.target.id
  const value = e.target.value
  window.LWB_State.actions.updateSettings({ [id]: value })
}

// ===================================================
// BLANK WEBSITE CREATION
// ===================================================
function createBlankWebsite() {
  const { actions } = window.LWB_State

  // Create blank project
  const blankProject = {
    title: "Untitled Website",
    logoUrl: null,
    sections: [
      {
        id: window.LWB_Utils.createUniqueId(),
        name: "Header",
        icon: "📄",
        isHeader: true,
        collapsed: false,
        content: [
          {
            id: window.LWB_Utils.createUniqueId(),
            type: "text",
            value: "<h1>Title</h1><p>Intro paragraph. Replace me with your content.</p>",
            allowHtml: false,
          },
        ],
      },
      {
        id: window.LWB_Utils.createUniqueId(),
        name: "Content",
        icon: "📝",
        collapsed: false,
        content: [
          {
            id: window.LWB_Utils.createUniqueId(),
            type: "text",
            value: "<h2>Section</h2><p>Add text and images here.</p>",
            allowHtml: false,
          },
        ],
      },
    ],
  }

  actions.loadProject(blankProject)
  actions.updateSettings({ layoutStyle: "single" })

  if (DOM_REFS.pdfName) {
    DOM_REFS.pdfName.textContent = "Blank Project"
  }

  showScreen("editor")
  window.LWB_Utils.showToast("Blank website created", "success")
}

// ===================================================
// INFO MODAL CTA
// ===================================================
function getStartedFromModal() {
  closeInfoModal()

  // Smooth scroll to the upload area
  const uploadContainer = document.querySelector(".upload-container")
  if (uploadContainer) {
    uploadContainer.scrollIntoView({
      behavior: "smooth",
      block: "center",
    })

    // Add a subtle highlight effect
    const dropZone = document.getElementById("dropZone")
    if (dropZone) {
      // Store original styles
      const originalTransform = dropZone.style.transform
      const originalBoxShadow = dropZone.style.boxShadow
      const originalBorderColor = dropZone.style.borderColor

      // Apply highlight effect
      dropZone.style.transform = "scale(1.02)"
      dropZone.style.boxShadow = "var(--shadow-xl)"
      dropZone.style.borderColor = "var(--primary)"

      // Restore original styles after effect
      setTimeout(() => {
        dropZone.style.transform = originalTransform
        dropZone.style.boxShadow = originalBoxShadow
        dropZone.style.borderColor = originalBorderColor
      }, 2000)
    }
  }

  // Optional: Open file dialog after a delay
  setTimeout(() => {
    const fileInput = document.getElementById("fileInput")
    if (fileInput) {
      fileInput.click()
    }
  }, 800)
}

// ===================================================
// GLOBAL FUNCTION EXPORTS
// ===================================================

/**
 * Make functions available globally for inline event handlers
 */
window.goHome = goHome
window.showInfo = showInfo
window.closeInfoModal = closeInfoModal
window.getStartedFromModal = getStartedFromModal
window.updateColorScheme = updateColorScheme
window.updateTitleSize = updateTitleSize
window.updateContentSize = updateContentSize
window.updateLogoSize = updateLogoSize
window.handleLogoUpload = handleLogoUpload
window.switchTab = switchTab
window.showPreviewModal = showPreviewModal
window.closePreviewModal = closePreviewModal
window.setPreviewDevice = setPreviewDevice
window.exportWebsite = exportWebsite
window.closeExportModal = closeExportModal
window.downloadWebsite = downloadWebsite
window.updatePreview = updatePreview
// Buttons manager exposure
window.addButton = addButton
window.updateButton = updateButton
window.removeButton = removeButton
window.reorderButtons = reorderButtons
window.renderButtonsManager = renderButtonsManager
window.handleButtonFileUpload = handleButtonFileUpload
window.toggleBuilderDarkMode = toggleBuilderDarkMode

// Editor functions (connected to the modular editor)
window.addSection = () => {
  const { selectors, actions } = window.LWB_State
  const project = selectors.getCurrentProject()
  window.LWB_Editor.addSection(project, () => {
    actions.updateProject(project)
  })
}

window.deleteSection = (index) => {
  const { selectors, actions } = window.LWB_State
  const project = selectors.getCurrentProject()
  window.LWB_Editor.deleteSection(index, () => {
    actions.updateProject(project)
  })
}

window.moveSection = (index, direction) => {
  const { selectors, actions } = window.LWB_State
  const project = selectors.getCurrentProject()
  window.LWB_Editor.moveSection(index, direction, () => {
    actions.updateProject(project)
  })
}

window.updateSectionName = (index, value) => {
  const { selectors, actions } = window.LWB_State
  const project = selectors.getCurrentProject()
  window.LWB_Editor.updateSectionName(index, value, () => {
    actions.updateProject(project)
  })
}

window.toggleSection = window.LWB_Editor.toggleSection

window.addTextToSection = (sectionIndex) => {
  const { selectors, actions } = window.LWB_State
  const project = selectors.getCurrentProject()
  window.LWB_Editor.addTextToSection(sectionIndex, () => {
    actions.updateProject(project)
  })
}

window.addImageToSection = (sectionIndex) => {
  const { selectors, actions } = window.LWB_State
  const project = selectors.getCurrentProject()
  window.LWB_Editor.addImageToSection(sectionIndex, () => {
    actions.updateProject(project)
  })
}
// Expose HTML block controls
window.addHtmlToSection = (sectionIndex) => {
  const { selectors, actions } = window.LWB_State
  const project = selectors.getCurrentProject()
  window.LWB_Editor.addHtmlToSection(sectionIndex, () => {
    actions.updateProject(project)
  })
}

window.deleteContent = (sectionIndex, contentIndex) => {
  const { selectors, actions } = window.LWB_State
  const project = selectors.getCurrentProject()
  window.LWB_Editor.deleteContent(sectionIndex, contentIndex, () => {
    actions.updateProject(project)
  })
}

window.moveContent = (sectionIndex, contentIndex, direction) => {
  const { selectors, actions } = window.LWB_State
  const project = selectors.getCurrentProject()
  window.LWB_Editor.moveContent(sectionIndex, contentIndex, direction, () => {
    actions.updateProject(project)
  })
}

window.updateContentValue = (sectionIndex, contentIndex, value) => {
  const { selectors, actions } = window.LWB_State
  const project = selectors.getCurrentProject()
  window.LWB_Editor.updateContentValue(sectionIndex, contentIndex, value, () => {
    actions.updateProject(project)
  })
}
// Legacy toggleHtml wrapper remains for backwards compatibility; it simply warns but does nothing now
window.toggleHtml = (sectionIndex, contentIndex, enabled) => {
  if (enabled && window.LWB_Utils) {
    window.LWB_Utils.showToast("⚠️ HTML mode is deprecated. Use dedicated HTML blocks instead.", "error")
  }
  // no-op
}
// Wrapper for updating HTML block content
window.updateHtmlContent = (sectionIndex, contentIndex, value) => {
  const { selectors, actions } = window.LWB_State
  const project = selectors.getCurrentProject()
  window.LWB_Editor.updateHtmlContent(sectionIndex, contentIndex, value, () => {
    actions.updateProject(project)
  })
}

window.formatText = (command, sectionIndex, contentIndex, value) => {
  const { selectors, actions } = window.LWB_State
  const project = selectors.getCurrentProject()
  window.LWB_Editor.formatText(command, sectionIndex, contentIndex, value, () => {
    actions.updateProject(project)
  })
}

window.insertLink = (sectionIndex, contentIndex) => {
  const { selectors, actions } = window.LWB_State
  const project = selectors.getCurrentProject()
  window.LWB_Editor.insertLink(sectionIndex, contentIndex, () => {
    actions.updateProject(project)
  })
}

window.formatCaption = (command, sectionIndex, contentIndex) => {
  const { selectors, actions } = window.LWB_State
  const project = selectors.getCurrentProject()
  window.LWB_Editor.formatCaption(command, sectionIndex, contentIndex, () => {
    actions.updateProject(project)
  })
}

window.insertCaptionLink = (sectionIndex, contentIndex) => {
  const { selectors, actions } = window.LWB_State
  const project = selectors.getCurrentProject()
  window.LWB_Editor.insertCaptionLink(sectionIndex, contentIndex, () => {
    actions.updateProject(project)
  })
}

window.handleImageUpload = (sectionIndex, contentIndex, event) => {
  const { selectors, actions } = window.LWB_State
  const project = selectors.getCurrentProject()
  window.LWB_Editor.handleImageUpload(sectionIndex, contentIndex, event, () => {
    actions.updateProject(project)
  })
}

window.updateImageCaption = (sectionIndex, contentIndex, caption) => {
  const { selectors, actions } = window.LWB_State
  const project = selectors.getCurrentProject()
  window.LWB_Editor.updateImageCaption(sectionIndex, contentIndex, caption, () => {
    actions.updateProject(project)
  })
}

// ===================================================
// APPLICATION STARTUP
// ===================================================

/**
 * Start the application when DOM is ready
 */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp)
} else {
  initializeApp()
}
