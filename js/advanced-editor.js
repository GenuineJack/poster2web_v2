/**
 * SITEWEAVE - ADVANCED EDITOR FEATURES
 * Enhanced editing capabilities including drag-and-drop, keyboard shortcuts, and advanced formatting
 */

// ===================================================
// DRAG AND DROP FUNCTIONALITY
// ===================================================

/**
 * Initialize drag and drop for sections
 */
function initializeDragAndDrop() {
  const sectionsContainer = document.getElementById("sectionsContainer")
  if (!sectionsContainer) return

  // Add drag and drop event listeners
  sectionsContainer.addEventListener("dragstart", handleDragStart)
  sectionsContainer.addEventListener("dragover", handleDragOver)
  sectionsContainer.addEventListener("drop", handleDrop)
  sectionsContainer.addEventListener("dragend", handleDragEnd)
}

let draggedElement = null
let draggedIndex = null

/**
 * Handle drag start
 */
function handleDragStart(e) {
  const sectionElement = e.target.closest(".section-editor")
  if (!sectionElement || sectionElement.classList.contains("header-section")) {
    e.preventDefault()
    return
  }

  draggedElement = sectionElement
  draggedIndex = Array.from(sectionElement.parentNode.children).indexOf(sectionElement)

  sectionElement.classList.add("dragging")
  e.dataTransfer.effectAllowed = "move"
  e.dataTransfer.setData("text/html", sectionElement.outerHTML)
}

/**
 * Handle drag over
 */
function handleDragOver(e) {
  e.preventDefault()
  e.dataTransfer.dropEffect = "move"

  const afterElement = getDragAfterElement(e.clientY)
  const draggingElement = document.querySelector(".dragging")

  if (afterElement == null) {
    document.getElementById("sectionsContainer").appendChild(draggingElement)
  } else {
    document.getElementById("sectionsContainer").insertBefore(draggingElement, afterElement)
  }
}

/**
 * Handle drop
 */
function handleDrop(e) {
  e.preventDefault()

  if (!draggedElement) return

  const container = document.getElementById("sectionsContainer")
  const newIndex = Array.from(container.children).indexOf(draggedElement)

  if (newIndex !== draggedIndex) {
    // Update the project data
    const project = window.APP_STATE?.currentProject
    if (project) {
      const movedSection = project.sections.splice(draggedIndex, 1)[0]
      project.sections.splice(newIndex, 1, movedSection)

      if (window.updateProject) window.updateProject()
      if (window.LWB_Utils) window.LWB_Utils.showToast("Section moved successfully", "success")
    }
  }
}

/**
 * Handle drag end
 */
function handleDragEnd(e) {
  if (draggedElement) {
    draggedElement.classList.remove("dragging")
    draggedElement = null
    draggedIndex = null
  }
}

/**
 * Get element after which to insert dragged element
 */
function getDragAfterElement(y) {
  const container = document.getElementById("sectionsContainer")
  const draggableElements = [...container.querySelectorAll(".section-editor:not(.dragging)")]

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect()
      const offset = y - box.top - box.height / 2

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child }
      } else {
        return closest
      }
    },
    { offset: Number.NEGATIVE_INFINITY },
  ).element
}

// ===================================================
// KEYBOARD SHORTCUTS
// ===================================================

/**
 * Initialize keyboard shortcuts
 */
function initializeKeyboardShortcuts() {
  document.addEventListener("keydown", handleKeyboardShortcuts)
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(e) {
  // Don't trigger shortcuts when typing in inputs or contenteditable elements
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.contentEditable === "true") {
    return
  }

  const project = window.APP_STATE?.currentProject
  if (!project) return

  // Ctrl/Cmd + S: Save project
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault()
    if (window.updateProject) {
      window.updateProject()
      if (window.LWB_Utils) window.LWB_Utils.showToast("Project saved", "success")
    }
  }

  // Ctrl/Cmd + Z: Undo (if state management supports it)
  if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
    e.preventDefault()
    if (window.StateStore && window.StateStore.undo) {
      window.StateStore.undo()
      if (window.LWB_Utils) window.LWB_Utils.showToast("Undone", "info")
    }
  }

  // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
  if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Z") || ((e.ctrlKey || e.metaKey) && e.key === "y")) {
    e.preventDefault()
    if (window.StateStore && window.StateStore.redo) {
      window.StateStore.redo()
      if (window.LWB_Utils) window.LWB_Utils.showToast("Redone", "info")
    }
  }

  // Ctrl/Cmd + D: Duplicate current section
  if ((e.ctrlKey || e.metaKey) && e.key === "d") {
    e.preventDefault()
    const focusedSection = document.querySelector(".section-editor.focused")
    if (focusedSection) {
      const sectionIndex = Array.from(focusedSection.parentNode.children).indexOf(focusedSection)
      duplicateSection(sectionIndex)
    }
  }

  // Ctrl/Cmd + /: Toggle help panel
  if ((e.ctrlKey || e.metaKey) && e.key === "/") {
    e.preventDefault()
    toggleHelpPanel()
  }

  // Escape: Close any open dropdowns or panels
  if (e.key === "Escape") {
    closeAllDropdowns()
  }

  // Arrow keys for section navigation
  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    const focusedSection = document.querySelector(".section-editor.focused")
    if (focusedSection) {
      e.preventDefault()
      navigateSections(e.key === "ArrowUp" ? -1 : 1)
    }
  }
}

/**
 * Duplicate a section
 */
function duplicateSection(sectionIndex) {
  const project = window.APP_STATE?.currentProject
  if (!project || !project.sections[sectionIndex]) return

  const originalSection = project.sections[sectionIndex]
  if (originalSection.isHeader) {
    if (window.LWB_Utils) window.LWB_Utils.showToast("Cannot duplicate header section", "error")
    return
  }

  const duplicatedSection = JSON.parse(JSON.stringify(originalSection))
  duplicatedSection.id = `section-${Date.now()}`
  duplicatedSection.name = `${originalSection.name} (Copy)`

  // Generate new IDs for content blocks
  duplicatedSection.content = duplicatedSection.content.map((content) => ({
    ...content,
    id: `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  }))

  project.sections.splice(sectionIndex + 1, 0, duplicatedSection)

  if (window.LWB_Editor && window.LWB_Editor.renderSections) {
    window.LWB_Editor.renderSections(project)
  }

  if (window.updateProject) window.updateProject()
  if (window.LWB_Utils) window.LWB_Utils.showToast("Section duplicated", "success")
}

/**
 * Navigate between sections using keyboard
 */
function navigateSections(direction) {
  const sections = document.querySelectorAll(".section-editor")
  const currentFocused = document.querySelector(".section-editor.focused")
  const currentIndex = currentFocused ? Array.from(sections).indexOf(currentFocused) : -1

  const newIndex = currentIndex + direction
  if (newIndex >= 0 && newIndex < sections.length) {
    // Remove focus from current section
    if (currentFocused) currentFocused.classList.remove("focused")

    // Add focus to new section
    sections[newIndex].classList.add("focused")
    sections[newIndex].scrollIntoView({ behavior: "smooth", block: "center" })
  }
}

/**
 * Close all open dropdowns
 */
function closeAllDropdowns() {
  document.querySelectorAll(".emoji-picker-dropdown").forEach((dropdown) => {
    dropdown.style.display = "none"
  })
  document.querySelectorAll(".dropdown-arrow").forEach((arrow) => {
    arrow.style.transform = "rotate(0deg)"
  })
}

// ===================================================
// ENHANCED RICH TEXT EDITING
// ===================================================

/**
 * Enhanced text formatting with more options
 */
function enhancedFormatText(command, sectionIndex, contentIndex, value = null) {
  const editor = document.getElementById(`editor-${sectionIndex}-${contentIndex}`)
  if (!editor) return

  editor.focus()

  switch (command) {
    case "insertTable":
      insertTable(editor, sectionIndex, contentIndex)
      break
    case "insertCode":
      insertCodeBlock(editor, sectionIndex, contentIndex)
      break
    case "insertQuote":
      document.execCommand("formatBlock", false, "blockquote")
      break
    case "textColor":
      document.execCommand("foreColor", false, value)
      break
    case "backgroundColor":
      document.execCommand("backColor", false, value)
      break
    case "insertHorizontalRule":
      document.execCommand("insertHorizontalRule", false, null)
      break
    default:
      document.execCommand(command, false, value)
  }

  // Update stored value
  const project = window.APP_STATE?.currentProject
  if (project && project.sections[sectionIndex]) {
    project.sections[sectionIndex].content[contentIndex].value = editor.innerHTML
  }

  if (window.updateProject) window.updateProject()
}

/**
 * Insert a table into the editor
 */
function insertTable(editor, sectionIndex, contentIndex) {
  const rows = prompt("Number of rows:", "3")
  const cols = prompt("Number of columns:", "3")

  if (!rows || !cols || isNaN(rows) || isNaN(cols)) return

  let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">'

  for (let i = 0; i < Number.parseInt(rows); i++) {
    tableHTML += "<tr>"
    for (let j = 0; j < Number.parseInt(cols); j++) {
      tableHTML +=
        i === 0 ? '<th style="padding: 8px; background: #f5f5f5;">Header</th>' : '<td style="padding: 8px;">Cell</td>'
    }
    tableHTML += "</tr>"
  }

  tableHTML += "</table>"

  document.execCommand("insertHTML", false, tableHTML)
}

/**
 * Insert a code block
 */
function insertCodeBlock(editor, sectionIndex, contentIndex) {
  const code = prompt("Enter code:", "")
  if (!code) return

  const codeHTML = `<pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; font-family: monospace;"><code>${code}</code></pre>`
  document.execCommand("insertHTML", false, codeHTML)
}

/**
 * Enhanced toolbar with more formatting options
 */
function generateEnhancedToolbar(sectionIndex, contentIndex) {
  return `
        <div class="editor-toolbar enhanced-toolbar" id="toolbar-${sectionIndex}-${contentIndex}">
             Basic formatting 
            <div class="toolbar-group">
                <button class="toolbar-btn" onclick="window.LWB_AdvancedEditor.enhancedFormatText('bold', ${sectionIndex}, ${contentIndex})" title="Bold (Ctrl+B)"><b>B</b></button>
                <button class="toolbar-btn" onclick="window.LWB_AdvancedEditor.enhancedFormatText('italic', ${sectionIndex}, ${contentIndex})" title="Italic (Ctrl+I)"><i>I</i></button>
                <button class="toolbar-btn" onclick="window.LWB_AdvancedEditor.enhancedFormatText('underline', ${sectionIndex}, ${contentIndex})" title="Underline (Ctrl+U)"><u>U</u></button>
                <button class="toolbar-btn" onclick="window.LWB_AdvancedEditor.enhancedFormatText('strikeThrough', ${sectionIndex}, ${contentIndex})" title="Strikethrough"><s>S</s></button>
            </div>
            
             Lists 
            <div class="toolbar-group">
                <button class="toolbar-btn" onclick="window.LWB_AdvancedEditor.enhancedFormatText('insertUnorderedList', ${sectionIndex}, ${contentIndex})" title="Bullet List">•</button>
                <button class="toolbar-btn" onclick="window.LWB_AdvancedEditor.enhancedFormatText('insertOrderedList', ${sectionIndex}, ${contentIndex})" title="Numbered List">1.</button>
                <button class="toolbar-btn" onclick="window.LWB_AdvancedEditor.enhancedFormatText('outdent', ${sectionIndex}, ${contentIndex})" title="Decrease Indent">⇤</button>
                <button class="toolbar-btn" onclick="window.LWB_AdvancedEditor.enhancedFormatText('indent', ${sectionIndex}, ${contentIndex})" title="Increase Indent">⇥</button>
            </div>
            
             Alignment 
            <div class="toolbar-group">
                <button class="toolbar-btn" onclick="window.LWB_AdvancedEditor.enhancedFormatText('justifyLeft', ${sectionIndex}, ${contentIndex})" title="Align Left">⇤</button>
                <button class="toolbar-btn" onclick="window.LWB_AdvancedEditor.enhancedFormatText('justifyCenter', ${sectionIndex}, ${contentIndex})" title="Center">⇔</button>
                <button class="toolbar-btn" onclick="window.LWB_AdvancedEditor.enhancedFormatText('justifyRight', ${sectionIndex}, ${contentIndex})" title="Align Right">⇥</button>
                <button class="toolbar-btn" onclick="window.LWB_AdvancedEditor.enhancedFormatText('justifyFull', ${sectionIndex}, ${contentIndex})" title="Justify">⇿</button>
            </div>
            
             Advanced formatting 
            <div class="toolbar-group">
                <button class="toolbar-btn" onclick="window.LWB_AdvancedEditor.enhancedFormatText('superscript', ${sectionIndex}, ${contentIndex})" title="Superscript">X²</button>
                <button class="toolbar-btn" onclick="window.LWB_AdvancedEditor.enhancedFormatText('subscript', ${sectionIndex}, ${contentIndex})" title="Subscript">X₂</button>
                <button class="toolbar-btn" onclick="window.LWB_AdvancedEditor.enhancedFormatText('insertQuote', ${sectionIndex}, ${contentIndex})" title="Quote">❝</button>
                <button class="toolbar-btn" onclick="window.LWB_AdvancedEditor.enhancedFormatText('insertCode', ${sectionIndex}, ${contentIndex})" title="Code Block">&lt;/&gt;</button>
            </div>
            
             Insert elements 
            <div class="toolbar-group">
                <button class="toolbar-btn" onclick="window.LWB_Editor.insertLink(${sectionIndex}, ${contentIndex})" title="Insert Link">🔗</button>
                <button class="toolbar-btn" onclick="window.LWB_AdvancedEditor.enhancedFormatText('insertTable', ${sectionIndex}, ${contentIndex})" title="Insert Table">⊞</button>
                <button class="toolbar-btn" onclick="window.LWB_AdvancedEditor.enhancedFormatText('insertHorizontalRule', ${sectionIndex}, ${contentIndex})" title="Horizontal Line">―</button>
            </div>
            
             Dropdowns 
            <div class="toolbar-group">
                <select class="toolbar-select" onchange="window.LWB_AdvancedEditor.enhancedFormatText('fontSize', ${sectionIndex}, ${contentIndex}, this.value); this.value=''">
                    <option value="">Size</option>
                    <option value="1">X-Small</option>
                    <option value="2">Small</option>
                    <option value="3">Normal</option>
                    <option value="4">Medium</option>
                    <option value="5">Large</option>
                    <option value="6">X-Large</option>
                    <option value="7">XX-Large</option>
                </select>
                
                <select class="toolbar-select" onchange="window.LWB_AdvancedEditor.enhancedFormatText('formatBlock', ${sectionIndex}, ${contentIndex}, this.value); this.value=''">
                    <option value="">Style</option>
                    <option value="p">Paragraph</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="h4">Heading 4</option>
                    <option value="h5">Heading 5</option>
                    <option value="h6">Heading 6</option>
                    <option value="blockquote">Quote</option>
                    <option value="pre">Preformatted</option>
                </select>
            </div>
            
             Utility 
            <div class="toolbar-group">
                <button class="toolbar-btn" onclick="window.LWB_AdvancedEditor.enhancedFormatText('removeFormat', ${sectionIndex}, ${contentIndex})" title="Clear Formatting">✖</button>
                <button class="toolbar-btn" onclick="window.LWB_AdvancedEditor.enhancedFormatText('undo', ${sectionIndex}, ${contentIndex})" title="Undo">↶</button>
                <button class="toolbar-btn" onclick="window.LWB_AdvancedEditor.enhancedFormatText('redo', ${sectionIndex}, ${contentIndex})" title="Redo">↷</button>
            </div>
        </div>
    `
}

// ===================================================
// HELP PANEL AND COMMAND PALETTE
// ===================================================

/**
 * Toggle help panel
 */
function toggleHelpPanel() {
  let helpPanel = document.getElementById("help-panel")

  if (!helpPanel) {
    helpPanel = createHelpPanel()
    document.body.appendChild(helpPanel)
  }

  helpPanel.style.display = helpPanel.style.display === "none" ? "block" : "none"
}

/**
 * Create help panel
 */
function createHelpPanel() {
  const panel = document.createElement("div")
  panel.id = "help-panel"
  panel.className = "help-panel"
  panel.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        padding: 20px;
        max-width: 500px;
        max-height: 70vh;
        overflow-y: auto;
        z-index: 1000;
        display: none;
    `

  panel.innerHTML = `
        <div class="help-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0;">Keyboard Shortcuts</h3>
            <button onclick="toggleHelpPanel()" style="background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
        </div>
        
        <div class="help-content">
            <div class="shortcut-group">
                <h4>General</h4>
                <div class="shortcut-item">
                    <kbd>Ctrl/Cmd + S</kbd>
                    <span>Save project</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Ctrl/Cmd + Z</kbd>
                    <span>Undo</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Ctrl/Cmd + Y</kbd>
                    <span>Redo</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Ctrl/Cmd + D</kbd>
                    <span>Duplicate section</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Ctrl/Cmd + /</kbd>
                    <span>Toggle help</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Escape</kbd>
                    <span>Close dropdowns</span>
                </div>
            </div>
            
            <div class="shortcut-group">
                <h4>Navigation</h4>
                <div class="shortcut-item">
                    <kbd>↑/↓</kbd>
                    <span>Navigate sections</span>
                </div>
            </div>
            
            <div class="shortcut-group">
                <h4>Text Formatting</h4>
                <div class="shortcut-item">
                    <kbd>Ctrl/Cmd + B</kbd>
                    <span>Bold</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Ctrl/Cmd + I</kbd>
                    <span>Italic</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Ctrl/Cmd + U</kbd>
                    <span>Underline</span>
                </div>
            </div>
        </div>
    `

  // Add CSS for shortcuts
  const style = document.createElement("style")
  style.textContent = `
        .shortcut-group {
            margin-bottom: 20px;
        }
        .shortcut-group h4 {
            margin: 0 0 10px 0;
            color: #374151;
            font-size: 14px;
            font-weight: 600;
        }
        .shortcut-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        .shortcut-item:last-child {
            border-bottom: none;
        }
        kbd {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            padding: 2px 6px;
            font-family: monospace;
            font-size: 12px;
            color: #374151;
        }
        .shortcut-item span {
            color: #6b7280;
            font-size: 14px;
        }
    `
  document.head.appendChild(style)

  return panel
}

// ===================================================
// SECTION FOCUS AND NAVIGATION
// ===================================================

/**
 * Add focus management to sections
 */
function initializeSectionFocus() {
  document.addEventListener("click", (e) => {
    const sectionElement = e.target.closest(".section-editor")
    if (sectionElement) {
      // Remove focus from all sections
      document.querySelectorAll(".section-editor").forEach((section) => {
        section.classList.remove("focused")
      })

      // Add focus to clicked section
      sectionElement.classList.add("focused")
    }
  })
}

// ===================================================
// ENHANCED CONTENT BLOCKS
// ===================================================

/**
 * Add bulk operations for content blocks
 */
function initializeBulkOperations() {
  // Add selection checkboxes to content blocks
  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("content-select-checkbox")) {
      updateBulkOperationsUI()
    }
  })
}

/**
 * Update bulk operations UI
 */
function updateBulkOperationsUI() {
  const selectedCheckboxes = document.querySelectorAll(".content-select-checkbox:checked")
  const bulkToolbar = document.getElementById("bulk-operations-toolbar")

  if (selectedCheckboxes.length > 0) {
    if (!bulkToolbar) {
      createBulkOperationsToolbar()
    }
    bulkToolbar.style.display = "flex"
    bulkToolbar.querySelector(".selected-count").textContent = `${selectedCheckboxes.length} selected`
  } else if (bulkToolbar) {
    bulkToolbar.style.display = "none"
  }
}

/**
 * Create bulk operations toolbar
 */
function createBulkOperationsToolbar() {
  const toolbar = document.createElement("div")
  toolbar.id = "bulk-operations-toolbar"
  toolbar.className = "bulk-operations-toolbar"
  toolbar.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        padding: 12px 20px;
        display: none;
        align-items: center;
        gap: 12px;
        z-index: 100;
    `

  toolbar.innerHTML = `
        <span class="selected-count">0 selected</span>
        <button class="btn btn-small btn-danger" onclick="window.LWB_AdvancedEditor.bulkDeleteContent()">Delete Selected</button>
        <button class="btn btn-small btn-secondary" onclick="window.LWB_AdvancedEditor.bulkMoveContent('up')">Move Up</button>
        <button class="btn btn-small btn-secondary" onclick="window.LWB_AdvancedEditor.bulkMoveContent('down')">Move Down</button>
        <button class="btn btn-small btn-secondary" onclick="window.LWB_AdvancedEditor.clearSelection()">Clear Selection</button>
    `

  document.body.appendChild(toolbar)
}

/**
 * Bulk delete selected content
 */
function bulkDeleteContent() {
  const selectedCheckboxes = document.querySelectorAll(".content-select-checkbox:checked")
  if (selectedCheckboxes.length === 0) return

  if (!confirm(`Delete ${selectedCheckboxes.length} selected content blocks?`)) return

  const project = window.APP_STATE?.currentProject
  if (!project) return

  // Collect indices to delete (in reverse order to avoid index shifting)
  const toDelete = []
  selectedCheckboxes.forEach((checkbox) => {
    const sectionIndex = Number.parseInt(checkbox.dataset.sectionIndex)
    const contentIndex = Number.parseInt(checkbox.dataset.contentIndex)
    toDelete.push({ sectionIndex, contentIndex })
  })

  // Sort by section and content index in reverse order
  toDelete.sort((a, b) => {
    if (a.sectionIndex !== b.sectionIndex) {
      return b.sectionIndex - a.sectionIndex
    }
    return b.contentIndex - a.contentIndex
  })

  // Delete content blocks
  toDelete.forEach(({ sectionIndex, contentIndex }) => {
    if (project.sections[sectionIndex] && project.sections[sectionIndex].content[contentIndex]) {
      project.sections[sectionIndex].content.splice(contentIndex, 1)
    }
  })

  // Re-render sections
  if (window.LWB_Editor && window.LWB_Editor.renderSections) {
    window.LWB_Editor.renderSections(project)
  }

  if (window.updateProject) window.updateProject()
  if (window.LWB_Utils) window.LWB_Utils.showToast(`${toDelete.length} content blocks deleted`, "success")

  clearSelection()
}

/**
 * Clear all selections
 */
function clearSelection() {
  document.querySelectorAll(".content-select-checkbox:checked").forEach((checkbox) => {
    checkbox.checked = false
  })
  updateBulkOperationsUI()
}

// ===================================================
// INITIALIZATION
// ===================================================

/**
 * Initialize all advanced editor features
 */
function initializeAdvancedEditor() {
  initializeDragAndDrop()
  initializeKeyboardShortcuts()
  initializeSectionFocus()
  initializeBulkOperations()

  // Add CSS for enhanced features
  addAdvancedEditorStyles()

  console.log("[v0] Advanced editor features initialized")
}

/**
 * Add CSS styles for advanced editor features
 */
function addAdvancedEditorStyles() {
  const style = document.createElement("style")
  style.textContent = `
        /* Drag and drop styles */
        .section-editor[draggable="true"] {
            cursor: move;
        }
        
        .section-editor.dragging {
            opacity: 0.5;
            transform: rotate(2deg);
        }
        
        .section-editor.focused {
            outline: 2px solid var(--primary);
            outline-offset: 2px;
        }
        
        /* Enhanced toolbar styles */
        .enhanced-toolbar {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            padding: 12px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            margin-bottom: 8px;
        }
        
        .toolbar-group {
            display: flex;
            gap: 4px;
            padding: 0 8px;
            border-right: 1px solid #e5e7eb;
        }
        
        .toolbar-group:last-child {
            border-right: none;
        }
        
        .toolbar-btn {
            padding: 6px 8px;
            border: 1px solid #d1d5db;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
        }
        
        .toolbar-btn:hover {
            background: #f3f4f6;
            border-color: #9ca3af;
        }
        
        .toolbar-btn:active {
            background: #e5e7eb;
        }
        
        .toolbar-select {
            padding: 4px 6px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            background: white;
            font-size: 12px;
            cursor: pointer;
        }
        
        /* Content selection styles */
        .content-select-checkbox {
            position: absolute;
            top: 8px;
            left: 8px;
            z-index: 10;
        }
        
        .content-block {
            position: relative;
        }
        
        .content-block:hover .content-select-checkbox {
            opacity: 1;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
            .enhanced-toolbar {
                flex-direction: column;
                gap: 4px;
            }
            
            .toolbar-group {
                border-right: none;
                border-bottom: 1px solid #e5e7eb;
                padding: 4px 0;
            }
            
            .toolbar-group:last-child {
                border-bottom: none;
            }
        }
    `
  document.head.appendChild(style)
}

// ===================================================
// EXPORTS
// ===================================================

// Make functions available globally
window.LWB_AdvancedEditor = {
  // Initialization
  initializeAdvancedEditor,

  // Drag and drop
  initializeDragAndDrop,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,

  // Keyboard shortcuts
  initializeKeyboardShortcuts,
  handleKeyboardShortcuts,
  duplicateSection,
  navigateSections,

  // Enhanced editing
  enhancedFormatText,
  generateEnhancedToolbar,
  insertTable,
  insertCodeBlock,

  // Help and UI
  toggleHelpPanel,
  createHelpPanel,

  // Bulk operations
  bulkDeleteContent,
  clearSelection,

  // Focus management
  initializeSectionFocus,
}

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeAdvancedEditor)
} else {
  initializeAdvancedEditor()
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
