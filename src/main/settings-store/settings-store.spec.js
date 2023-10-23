import { mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { SettingsStore, SETTING_FILE_NAME } from './settings-store';

describe('SettingsStore', () => {
  let settingsFilePath;

  beforeEach(() => {
    settingsFilePath = mkdtempSync('/tmp/');
  });

  describe('#save', () => {
    it('should save settings to a JSON file', () => {
      const settingsStore = new SettingsStore(settingsFilePath);

      settingsStore.save({ james: 'bond' });

      expect(readFileSync(`${settingsFilePath}/${SETTING_FILE_NAME}`, 'utf8')).to.eql('{"james":"bond"}');
    });

    it('should update settings when an older version is already saved', () => {
      writeFileSync(`${settingsFilePath}/${SETTING_FILE_NAME}`, '{"james":"bond"}');
      const settingsStore = new SettingsStore(settingsFilePath);

      settingsStore.save({ johnny: 'english' });

      expect(readFileSync(`${settingsFilePath}/${SETTING_FILE_NAME}`, 'utf8')).to.eql('{"johnny":"english"}');
    });
  });

  describe('#load', () => {
    it('should return settings stored in a JSON file', () => {
      writeFileSync(`${settingsFilePath}/${SETTING_FILE_NAME}`, '{"ethan":"hunt"}');
      const settingsStore = new SettingsStore(settingsFilePath);

      expect(settingsStore.load()).to.eql({ ethan: 'hunt' });
    });

    it('should return empty settings when nothing is stored yet', () => {
      const settingsStore = new SettingsStore(settingsFilePath);
      expect(settingsStore.load()).to.eql({});
    });

    it('should return empty settings when the stored settings are not in valid JSON format', () => {
      writeFileSync(`${settingsFilePath}/${SETTING_FILE_NAME}`, 'frank drebin');
      const settingsStore = new SettingsStore(settingsFilePath);
      expect(settingsStore.load()).to.eql({});
    });
  });
});
