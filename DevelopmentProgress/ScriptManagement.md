
# Script Management Development Progress

- [ ] **Phase 0: Dependencies**
    - [x] Verify `nanoid` exists in `package.json`.

- [ ] **Phase 1: Database**
    - [ ] Create `src/main/features/database/schema/scripts.ts` with the `scripts` table schema.
    - [ ] Update `src/main/features/database/schema.ts` to register the new schema.
    - [ ] Find the schema for `scheduled_tasks` and add the nullable `script_id` TEXT field.

- [ ] **Phase 2: Backend**
    - [ ] Create `src/shared/types/dtos/ScriptManagement.ts` with `Script` and CRUD DTOs.
    - [ ] Create `src/main/features/services/ScriptManagement/index.ts`.
        - [ ] Implement `createScript` (with `nanoid`).
        - [ ] Implement `getAllScripts`.
        - [ ] Implement `getScriptById`.
        - [ ] Implement `updateScript`.
        - [ ] Implement `deleteScript`.
        - [ ] Implement `executeScript`.
    - [ ] Create `src/main/features/handlers/ScriptManagement/index.ts` to expose service methods.
    - [ ] Update `SchedulerService` to handle the new `script_id` field.

- [ ] **Phase 3: Integration**
    - [ ] Register the new handlers in `src/main/features/handlers/ipcHandlers.ts`.
    - [ ] Expose the APIs in `src/main/preload/index.ts` and `index.d.ts`.

- [ ] **Phase 4: Frontend**
    - [ ] Install `monaco-editor` and `monaco-editor-vue3`.
    - [ ] Create `src/renderer/src/api/scriptManagement.ts`.
    - [ ] Create `src/renderer/src/views/ScriptManagement.vue`.
        - [ ] Implement script list display.
        - [ ] Implement create/edit modal with Monaco Editor.
        - [ ] Implement delete functionality.
    - [ ] Add route and menu item for `ScriptManagement.vue` in `src/shared/types/dtos/MenuManagement.ts`.
    - [ ] Modify `Scheduler.vue` (or equivalent).
        - [ ] Replace script input with a dropdown.
        - [ ] Populate dropdown with saved scripts and a `[ Write new script ]` option.
        - [ ] Implement the modal/pop-up editor for the 'new script' option.
        - [ ] Ensure the selected/newly created script's ID is saved with the task.
