"use client"

export interface Section {
  id: string
  icon: string
  name: string
  isHeader?: boolean
  content: Array<{
    type: "text" | "image" | "html"
    value?: string
    url?: string
    caption?: string
    allowHtml?: boolean
    allowRawHtml?: boolean
  }>
}

export interface Project {
  title: string
  sections: Section[]
  logoUrl: string | null
}

export interface Settings {
  primaryColor: string
  secondaryColor: string
  titleSize: string
  contentSize: string
  fontStyle: "system" | "serif" | "mono"
  headerAlignment: "left" | "center" | "right"
  logoSize: string
  layoutStyle: "single" | "sections" | "menu"
  darkMode: boolean
  buttons: Array<{
    id: string
    type: "file" | "link" | "email"
    label: string
    value: string
  }>
  analyticsCode: string
}

export interface UIState {
  currentScreen: "upload" | "editor"
  isLoading: boolean
  loadingTitle: string
  loadingMessage: string
  activeTab: "content" | "design" | "settings"
  expandedSections: string[]
  selectedElements: string[]
}

export interface AppState {
  currentProject: Project
  settings: Settings
  ui: UIState
  unsavedChanges: boolean
  lastSaved: number | null
}

export interface AppActions {
  // Project actions
  loadProject: (project: Project) => void
  updateProject: (updates: Partial<Project>) => void
  resetProject: () => void

  // Settings actions
  updateSettings: (updates: Partial<Settings>) => void
  updateColorScheme: (scheme: string) => void

  // UI actions
  setScreen: (screen: "upload" | "editor") => void
  setLoading: (isLoading: boolean, title?: string, message?: string) => void
  setActiveTab: (tab: "content" | "design" | "settings") => void
  toggleSectionExpanded: (sectionId: string) => void

  // Section actions
  addSection: (section: Section) => void
  updateSection: (index: number, updates: Partial<Section>) => void
  deleteSection: (index: number) => void
  moveSection: (fromIndex: number, toIndex: number) => void
}

const initialProject: Project = {
  title: "My Website",
  sections: [],
  logoUrl: null,
}

const initialSettings: Settings = {
  primaryColor: "#ffffff",
  secondaryColor: "#f5f5f5",
  titleSize: "32",
  contentSize: "16",
  fontStyle: "system",
  headerAlignment: "center",
  logoSize: "120",
  layoutStyle: "single",
  darkMode: true,
  buttons: [],
  analyticsCode: "",
}

const initialUI: UIState = {
  currentScreen: "upload",
  isLoading: false,
  loadingTitle: "",
  loadingMessage: "",
  activeTab: "content",
  expandedSections: [],
  selectedElements: [],
}

const toggleArrayItem = <T>(array: T[], item: T): T[] => {\
  const index = array.indexOf(item)
  if (index === -1) {\
    return [...array, item]
  } else {\
    return array.filter((_, i) => i !== index)
  }
}
\
export const useAppState = create<AppState & { actions: AppActions }>()( 
  persist(
    (set, get) => ({\
      currentProject: initialProject,
      settings: initialSettings,
      ui: initialUI,
      unsavedChanges: false,
      lastSaved: null,

      actions: {\
        loadProject: (project) =>
          set({\
            currentProject: project,
            unsavedChanges: false,
            lastSaved: Date.now(),
          }),

        updateProject: (updates) =>
          set((state) => ({\
            currentProject: { ...state.currentProject, ...updates },
            unsavedChanges: true,
          })),

        resetProject: () =>
          set({\
            currentProject: initialProject,
            unsavedChanges: false,
          }),

        updateSettings: (updates) =>
          set((state) => ({\
            settings: { ...state.settings, ...updates },
            unsavedChanges: true,
          })),

        updateColorScheme: (scheme) => {\
          const colors = getColorScheme(scheme)
          if (colors) {
            set((state) => ({
              settings: {
                ...state.settings,
                primaryColor: colors.primary,
                secondaryColor: colors.secondary,
              },
              unsavedChanges: true,
            }))
          }
        },

        setScreen: (screen) =>
          set((state) => ({\
            ui: { ...state.ui, currentScreen: screen },
          })),

        setLoading: (isLoading, title = "", message = "") =>
          set((state) => ({\
            ui: {
              ...state.ui,
              isLoading,\
              loadingTitle: title,
              loadingMessage: message,
            },
          })),

        setActiveTab: (tab) =>
          set((state) => ({\
            ui: { ...state.ui, activeTab: tab },
          })),

        toggleSectionExpanded: (sectionId) =>
          set((state) => ({\
            ui: { 
              ...state.ui, \
              expandedSections: toggleArrayItem(state.ui.expandedSections, sectionId)
            },
          })),

        addSection: (section) =>
          set((state) => ({\
            currentProject: {
              ...state.currentProject,\
              sections: [...state.currentProject.sections, section],
            },
            unsavedChanges: true,
          })),

        updateSection: (index, updates) =>
          set((state) => {\
            const sections = [...state.currentProject.sections]\
            sections[index] = { ...sections[index], ...updates }
            return {\
              currentProject: {
                ...state.currentProject,
                sections,
              },
              unsavedChanges: true,
            }
          }),

        deleteSection: (index) =>
          set((state) => ({\
            currentProject: {
              ...state.currentProject,\
              sections: state.currentProject.sections.filter((_, i) => i !== index),
            },
            unsavedChanges: true,
          })),

        moveSection: (fromIndex, toIndex) =>
          set((state) => {\
            const sections = [...state.currentProject.sections]
            const [moved] = sections.splice(fromIndex, 1)
            sections.splice(toIndex, 0, moved)
            return {\
              currentProject: {
                ...state.currentProject,
                sections,
              },
              unsavedChanges: true,
            }
          }),
      },
    }),
    {\
      name: "poster2web-storage",
      partialize: (state) => ({\
        currentProject: state.currentProject,
        settings: state.settings,
        lastSaved: state.lastSaved,
        ui: {\
          activeTab: state.ui.activeTab,
          expandedSections: state.ui.expandedSections,
        },
      }),
      onRehydrateStorage: () => (state) => {\
        if (state && !state.ui) {
          state.ui = initialUI
        }
        if (state?.ui) {
          state.ui = {
            ...initialUI,
            ...state.ui,
          }
        }
      },
      skipHydration: typeof window === "undefined",
    },
  ),
)

function getColorScheme(scheme: string) {
  const schemes: Record<string, { primary: string; secondary: string }> = {
    "growth-green": { primary: "#16a34a", secondary: "#15803d" },
    "trust-blue": { primary: "#2563eb", secondary: "#1d4ed8" },
    "premium-purple": { primary: "#9333ea", secondary: "#7c3aed" },
    "bold-red": { primary: "#dc2626", secondary: "#b91c1c" },
    "modern-teal": { primary: "#0d9488", secondary: "#0f766e" },
    "sunset-orange": { primary: "#ea580c", secondary: "#c2410c" },
    "energy-yellow": { primary: "#ca8a04", secondary: "#a16207" },
    "professional-grey": { primary: "#374151", secondary: "#1f2937" },
  }

  return schemes[scheme]
}
