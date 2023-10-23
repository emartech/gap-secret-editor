import { writeFileSync, readFileSync } from 'fs';
import { join } from 'node:path';

export const SETTING_FILE_NAME = 'secret-editor-settings.json';

export class SettingsStore {
  constructor(settingsFileBasePath) {
    this._settingsFilePath = join(settingsFileBasePath, SETTING_FILE_NAME);
  }

  save(settings) {
    writeFileSync(this._settingsFilePath, JSON.stringify(settings));
  }

  load() {
    try {
      return JSON.parse(readFileSync(this._settingsFilePath, 'utf8'));
    } catch (error) {
      return {};
    }
  }
}
