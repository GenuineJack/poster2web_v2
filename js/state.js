/**
 * SITEWEAVE - STATE MANAGEMENT
 * Modern reactive state management system with event-driven architecture
 */

// ===================================================
// STATE STORE
// ===================================================

/**
 * Reactive state store with event-driven updates
 */
class StateStore {
  constructor(initialState = {}) {
    this._state = { ...initialState }
    this._listeners = new Map()
    this._middleware = []
    this._history = []
    this._maxHistorySize = 50

    // Bind methods to preserve context
    this.getState = this.getState.bind(this)
    this.setState = this.setState.bind(this)
    this.subscribe = this.subscribe.bind(this)
    this.unsubscribe = this.unsubscribe.bind(this)
  }

  /**
   * Get current state (immutable copy)
   */
  getState() {
    return JSON.parse(JSON.stringify(this._state))
  }

  /**
   * Update state with automatic change detection and notifications
   */
  setState(updates, options = {}) {
    const { silent = false, source = "unknown" } = options
    const prevState = this.getState()

    // Apply middleware before state change
    let processedUpdates = updates
    for (const middleware of this._middleware) {
      processedUpdates = middleware(processedUpdates, prevState, { source })
    }

    // Merge updates with current state
    this._state = this._deepMerge(this._state, processedUpdates)
    const newState = this.getState()

    // Add to history for undo/redo functionality
    if (!silent) {
      this._addToHistory(prevState, newState, source)
    }

    // Notify listeners of changes
    if (!silent) {
      this._notifyListeners(prevState, newState, processedUpdates, source)
    }

    return newState
  }

  /**
   * Subscribe to state changes
   */
  subscribe(path, callback) {
    if (typeof path === "function") {
      // Global listener
      callback = path
      path = "*"
    }

    if (!this._listeners.has(path)) {
      this._listeners.set(path, new Set())
    }

    this._listeners.get(path).add(callback)

    // Return unsubscribe function
    return () => this.unsubscribe(path, callback)
  }

  /**
   * Unsubscribe from state changes
   */
  unsubscribe(path, callback) {
    if (this._listeners.has(path)) {
      this._listeners.get(path).delete(callback)
      if (this._listeners.get(path).size === 0) {
        this._listeners.delete(path)
      }
    }
  }

  /**
   * Add middleware for state transformations
   */
  use(middleware) {
    this._middleware.push(middleware)
  }

  /**
   * Get state at specific path
   */
  getPath(path) {
    return this._getNestedValue(this._state, path)
  }

  /**
   * Set state at specific path
   */
  setPath(path, value, options = {}) {
    const updates = this._setNestedValue({}, path, value)
    return this.setState(updates, options)
  }

  /**
   * Reset state to initial values
   */
  reset(newState = {}) {
    this._state = { ...newState }
    this._history = []
    this._notifyListeners({}, this._state, this._state, "reset")
  }

  /**
   * Get state history for undo/redo
   */
  getHistory() {
    return [...this._history]
  }

  /**
   * Undo last state change
   */
  undo() {
    if (this._history.length > 1) {
      const current = this._history.pop()
      const previous = this._history[this._history.length - 1]
      this._state = { ...previous.state }
      this._notifyListeners(current.state, previous.state, {}, "undo")
      return previous.state
    }
    return null
  }

  // Private methods
  _deepMerge(target, source) {
    const result = { ...target }

    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        result[key] = this._deepMerge(result[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }

    return result
  }

  _notifyListeners(prevState, newState, updates, source) {
    // Notify global listeners
    if (this._listeners.has("*")) {
      this._listeners.get("*").forEach((callback) => {
        try {
          callback(newState, prevState, updates, source)
        } catch (error) {
          console.error("State listener error:", error)
        }
      })
    }

    // Notify path-specific listeners
    for (const [path, callbacks] of this._listeners) {
      if (path === "*") continue

      const prevValue = this._getNestedValue(prevState, path)
      const newValue = this._getNestedValue(newState, path)

      if (JSON.stringify(prevValue) !== JSON.stringify(newValue)) {
        callbacks.forEach((callback) => {
          try {
            callback(newValue, prevValue, newState, source)
          } catch (error) {
            console.error(`State listener error for path "${path}":`, error)
          }
        })
      }
    }
  }

  _addToHistory(prevState, newState, source) {
    this._history.push({
      state: prevState,
      timestamp: Date.now(),
      source,
    })

    // Limit history size
    if (this._history.length > this._maxHistorySize) {
      this._history.shift()
    }
  }

  _getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj)
  }

  _setNestedValue(obj, path, value) {
    const keys = path.split(".")
    const lastKey = keys.pop()
    const target = keys.reduce((current, key) => {
      current[key] = current[key] || {}
      return current[key]
    }, obj)
    target[lastKey] = value
    return obj
  }
}

// ===================================================
// STATE MIDDLEWARE
// ===================================================

/**
 * Validation middleware
 */
const validationMiddleware = (updates, prevState, { source }) => {
  // Validate project structure
  if (updates.currentProject) {
    const project = { ...prevState.currentProject, ...updates.currentProject }
    if (!isValidProject(project)) {
      console.warn("Invalid project structure detected")
      return updates
    }
  }

  // Validate settings
  if (updates.settings) {
    const settings = { ...prevState.settings, ...updates.settings }

    // Validate colors
    if (settings.primaryColor && !isValidHexColor(settings.primaryColor)) {
      console.warn("Invalid primary color:", settings.primaryColor)
      delete updates.settings.primaryColor
    }

    if (settings.secondaryColor && !isValidHexColor(settings.secondaryColor)) {
      console.warn("Invalid secondary color:", settings.secondaryColor)
      delete updates.settings.secondaryColor
    }
  }

  return updates
}

/**
 * Auto-save middleware
 */
const autoSaveMiddleware = (updates, prevState, { source }) => {
  // Skip auto-save for certain sources
  if (source === "load" || source === "reset") {
    return updates
  }

  // Debounced auto-save
  if (autoSaveMiddleware.timeout) {
    clearTimeout(autoSaveMiddleware.timeout)
  }

  autoSaveMiddleware.timeout = setTimeout(() => {
    const currentState = store.getState()
    if (currentState.currentProject) {
      window.LWB_Utils?.saveProject(currentState.currentProject)
      store.setState({ unsavedChanges: false }, { silent: true, source: "auto-save" })
    }
  }, 1000)

  return updates
}

/**
 * Logging middleware for development
 */
const loggingMiddleware = (updates, prevState, { source }) => {
  if (process.env.NODE_ENV === "development" || window.DEBUG_STATE) {
    console.group(`🔄 State Update [${source}]`)
    console.log("Updates:", updates)
    console.log("Previous State:", prevState)
    console.log("New State:", { ...prevState, ...updates })
    console.groupEnd()
  }
  return updates
}

// ===================================================
// GLOBAL STATE INSTANCE
// ===================================================

/**
 * Global application state store
 */
const store = new StateStore({
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
    buttons: [],
    analyticsCode: "",
  },
  ui: {
    currentScreen: "upload",
    isLoading: false,
    activeTab: "content",
    expandedSections: new Set(),
    selectedElements: new Set(),
  },
  unsavedChanges: false,
  lastSaved: null,
})

// Add middleware
store.use(validationMiddleware)
store.use(autoSaveMiddleware)
store.use(loggingMiddleware)

// ===================================================
// STATE ACTIONS
// ===================================================

/**
 * High-level actions for common state operations
 */
const actions = {
  // Project actions
  loadProject(project) {
    store.setState(
      {
        currentProject: project,
        unsavedChanges: false,
        lastSaved: Date.now(),
      },
      { source: "load" },
    )
  },

  updateProject(updates) {
    store.setState(
      {
        currentProject: updates,
        unsavedChanges: true,
      },
      { source: "user-edit" },
    )
  },

  resetProject() {
    store.setState(
      {
        currentProject: {
          title: "My Website",
          sections: [],
          logoUrl: null,
        },
        unsavedChanges: false,
      },
      { source: "reset" },
    )
  },

  // Settings actions
  updateSettings(updates) {
    store.setState(
      {
        settings: updates,
        unsavedChanges: true,
      },
      { source: "settings" },
    )
  },

  updateColorScheme(scheme) {
    const colors = window.LWB_Utils?.getColorScheme(scheme)
    if (colors) {
      this.updateSettings({
        primaryColor: colors.primary,
        secondaryColor: colors.secondary,
      })
    }
  },

  // UI actions
  setScreen(screen) {
    store.setState(
      {
        ui: { currentScreen: screen },
      },
      { source: "navigation" },
    )
  },

  setLoading(isLoading, title = "", message = "") {
    store.setState(
      {
        ui: {
          isLoading,
          loadingTitle: title,
          loadingMessage: message,
        },
      },
      { source: "ui" },
    )
  },

  setActiveTab(tab) {
    store.setState(
      {
        ui: { activeTab: tab },
      },
      { source: "ui" },
    )
  },

  toggleSectionExpanded(sectionId) {
    const expanded = new Set(store.getState().ui.expandedSections)
    if (expanded.has(sectionId)) {
      expanded.delete(sectionId)
    } else {
      expanded.add(sectionId)
    }
    store.setState(
      {
        ui: { expandedSections: expanded },
      },
      { source: "ui" },
    )
  },

  // Section actions
  addSection(section) {
    const state = store.getState()
    const sections = [...state.currentProject.sections, section]
    this.updateProject({ sections })
  },

  updateSection(index, updates) {
    const state = store.getState()
    const sections = [...state.currentProject.sections]
    sections[index] = { ...sections[index], ...updates }
    this.updateProject({ sections })
  },

  deleteSection(index) {
    const state = store.getState()
    const sections = state.currentProject.sections.filter((_, i) => i !== index)
    this.updateProject({ sections })
  },

  moveSection(fromIndex, toIndex) {
    const state = store.getState()
    const sections = [...state.currentProject.sections]
    const [moved] = sections.splice(fromIndex, 1)
    sections.splice(toIndex, 0, moved)
    this.updateProject({ sections })
  },

  // Content actions
  addContent(sectionIndex, content) {
    const state = store.getState()
    const sections = [...state.currentProject.sections]
    sections[sectionIndex] = {
      ...sections[sectionIndex],
      content: [...(sections[sectionIndex].content || []), content],
    }
    this.updateProject({ sections })
  },

  updateContent(sectionIndex, contentIndex, updates) {
    const state = store.getState()
    const sections = [...state.currentProject.sections]
    const content = [...sections[sectionIndex].content]
    content[contentIndex] = { ...content[contentIndex], ...updates }
    sections[sectionIndex] = { ...sections[sectionIndex], content }
    this.updateProject({ sections })
  },

  deleteContent(sectionIndex, contentIndex) {
    const state = store.getState()
    const sections = [...state.currentProject.sections]
    const content = sections[sectionIndex].content.filter((_, i) => i !== contentIndex)
    sections[sectionIndex] = { ...sections[sectionIndex], content }
    this.updateProject({ sections })
  },
}

// ===================================================
// STATE SELECTORS
// ===================================================

/**
 * Computed state selectors for derived data
 */
const selectors = {
  // Project selectors
  getCurrentProject: () => store.getState().currentProject,
  getSections: () => store.getState().currentProject.sections,
  getSection: (index) => store.getState().currentProject.sections[index],
  getHeaderSection: () => store.getState().currentProject.sections.find((s) => s.isHeader),

  // Settings selectors
  getSettings: () => store.getState().settings,
  getColors: () => {
    const settings = store.getState().settings
    return {
      primary: settings.primaryColor,
      secondary: settings.secondaryColor,
    }
  },

  // UI selectors
  getCurrentScreen: () => store.getState().ui.currentScreen,
  getActiveTab: () => store.getState().ui.activeTab,
  isLoading: () => store.getState().ui.isLoading,
  getExpandedSections: () => Array.from(store.getState().ui.expandedSections),

  // Computed selectors
  hasUnsavedChanges: () => store.getState().unsavedChanges,
  canUndo: () => store.getHistory().length > 1,
  getProjectStats: () => {
    const project = store.getState().currentProject
    return {
      sectionCount: project.sections.length,
      contentCount: project.sections.reduce((total, section) => total + (section.content?.length || 0), 0),
      hasLogo: !!project.logoUrl,
      lastModified: store.getState().lastSaved,
    }
  },
}

// ===================================================
// VALIDATION HELPERS
// ===================================================

function isValidProject(project) {
  if (!project || typeof project !== "object") return false
  if (!Array.isArray(project.sections)) return false

  return project.sections.every((section) => section.id && section.name && Array.isArray(section.content))
}

function isValidHexColor(color) {
  return /^#[0-9A-F]{6}$/i.test(color)
}

// ===================================================
// EXPORTS
// ===================================================

// Make state management available globally
window.LWB_State = {
  store,
  actions,
  selectors,
  StateStore,
}

// Legacy compatibility - expose store methods directly
window.APP_STATE = store.getState()
window.updateProject = () => {
  // Update legacy global reference
  window.APP_STATE = store.getState()
  // Trigger preview update if available
  if (window.updatePreview) {
    window.updatePreview()
  }
}

// Update legacy global state when store changes
store.subscribe((newState) => {
  window.APP_STATE = newState
})
