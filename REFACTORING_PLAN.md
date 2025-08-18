# Refactoring and Bug Fix Plan

This document tracks the status of ongoing refactoring and bug fixing tasks.

## Sprint 1

### Bugs

- [x] **[Fixed]** Fix repository path validation logic.
- [x] **[Fixed]** Subfolder scan mode was not correctly handled by path validation.
- [x] **[Fixed]** `window.api.getSubRepos` was not a function due to preload script not being updated.
- [x] **[Fixed]** Log panel text was not selectable.
- [x] **[Fixed]** Single-line layout for form items was not working.

### Features

- [x] Add loading state to the "Select Directory" button during validation.
- [x] Add a "Clear Path" button to the repository path input.
- [x] Implement scanning of subfolders.
- [x] Redesign the layout of the settings page to be two-column.
- [x] Make the log panel always visible and equal in height to the settings panel.
- [x] Refactor `BasicSettings.vue` into smaller components.
  - [x] `ActionPanel.vue` created.
  - [x] `LogPanel.vue` created.
  - [x] `SettingsForm.vue` created.
  - [x] `BasicSettings.vue` refactored to use new components.
- [x] **[Done]** The "Select Repository" dropdown should always be visible, but disabled when not applicable.
- [x] **[Done]** When `scanSubfolders` is turned off, the "Select Repository" box should be auto-populated with the current valid repo.