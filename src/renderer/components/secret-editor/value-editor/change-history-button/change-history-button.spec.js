import { mount } from '@vue/test-utils';
import ChangeHistoryButton from './change-history-button';
import createStore from '../../../../store/store';
import { mountWithStore } from '../../../../../../test-helpers/mount-helpers';

describe('ChangeHistoryButton', () => {
  describe('#fieldBackups', () => {
    it('should return only the given field from all backups', () => {
      const backups = [
        { backupTime: '2020-12-24T01:00:00.000Z', data: { FIELD1: 'value1B', FIELD2: 'value2B', FIELD3: 'value3B' } },
        { backupTime: '2020-12-24T00:00:00.000Z', data: { FIELD1: 'value1A', FIELD2: 'value2A', FIELD3: 'value3A' } }
      ];
      const store = createStore();
      store.commit('setBackups', backups);
      const { vm } = mount(ChangeHistoryButton, { store, propsData: { fieldKey: 'FIELD2' } });

      expect(vm.fieldBackups).to.eql([
        { backupTime: '2020-12-24T01:00:00.000Z', data: { FIELD2: 'value2B' } },
        { backupTime: '2020-12-24T00:00:00.000Z', data: { FIELD2: 'value2A' } }
      ]);
    });

    it('should not return backup when given field has not changed', () => {
      const backups = [
        { backupTime: '2020-12-24T02:00:00.000Z', data: { FIELD1: 'value1C', FIELD2: 'value2C', FIELD3: 'value3C' } },
        { backupTime: '2020-12-24T01:00:00.000Z', data: { FIELD1: 'value1B', FIELD2: 'value2A', FIELD3: 'value3B' } },
        { backupTime: '2020-12-24T00:00:00.000Z', data: { FIELD1: 'value1A', FIELD2: 'value2A', FIELD3: 'value3A' } }
      ];
      const store = createStore();
      store.commit('setBackups', backups);
      const { vm } = mount(ChangeHistoryButton, { store, propsData: { fieldKey: 'FIELD2' } });

      expect(vm.fieldBackups).to.eql([
        { backupTime: '2020-12-24T02:00:00.000Z', data: { FIELD2: 'value2C' } },
        { backupTime: '2020-12-24T00:00:00.000Z', data: { FIELD2: 'value2A' } }
      ]);
    });

    it('should return empty backup data when given field was deleted', () => {
      const backups = [
        { backupTime: '2020-12-24T03:00:00.000Z', data: { FIELD1: 'value1D', FIELD2: 'value2A', FIELD3: 'value3D' } },
        { backupTime: '2020-12-24T02:00:00.000Z', data: { FIELD1: 'value1C', FIELD3: 'value3C' } },
        { backupTime: '2020-12-24T01:00:00.000Z', data: { FIELD1: 'value1B', FIELD3: 'value3B' } },
        { backupTime: '2020-12-24T00:00:00.000Z', data: { FIELD1: 'value1A', FIELD2: 'value2A', FIELD3: 'value3A' } }
      ];
      const store = createStore();
      store.commit('setBackups', backups);
      const { vm } = mount(ChangeHistoryButton, { store, propsData: { fieldKey: 'FIELD2' } });

      expect(vm.fieldBackups).to.eql([
        { backupTime: '2020-12-24T03:00:00.000Z', data: { FIELD2: 'value2A' } },
        { backupTime: '2020-12-24T01:00:00.000Z', data: {} },
        { backupTime: '2020-12-24T00:00:00.000Z', data: { FIELD2: 'value2A' } }
      ]);
    });

    it('should not return backup when given field has not added yet', () => {
      const backups = [
        { backupTime: '2020-12-24T02:00:00.000Z', data: { FIELD1: 'value1C', FIELD2: 'value2C', FIELD3: 'value3C' } },
        { backupTime: '2020-12-24T01:00:00.000Z', data: { FIELD1: 'value1B', FIELD2: 'value2B', FIELD3: 'value3B' } },
        { backupTime: '2020-12-24T00:00:00.000Z', data: { FIELD1: 'value1A', FIELD3: 'value3A' } }
      ];
      const store = createStore();
      store.commit('setBackups', backups);
      const { vm } = mount(ChangeHistoryButton, { store, propsData: { fieldKey: 'FIELD2' } });

      expect(vm.fieldBackups).to.eql([
        { backupTime: '2020-12-24T02:00:00.000Z', data: { FIELD2: 'value2C' } },
        { backupTime: '2020-12-24T01:00:00.000Z', data: { FIELD2: 'value2B' } }
      ]);
    });

  });

  describe('#selectBackup', () => {
    it('should return only the given field from all backups', () => {
      const wrapper = mountWithStore(ChangeHistoryButton, { propsData: { fieldKey: 'THE_FIELD' } });
      wrapper.vm.selectBackup({ backupTime: '2020-12-24T01:00:00.000Z', data: { THE_FIELD: 'NEW_VALUE' } });
      expect(wrapper.emitted()).to.eql({ 'load-field-backup': [['NEW_VALUE']] });
    });
  });
});
