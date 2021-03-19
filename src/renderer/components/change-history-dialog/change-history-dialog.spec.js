import { mount } from '@vue/test-utils';
import { format } from 'date-fns';
import ChangeHistoryDialog from './change-history-dialog';

describe('ChangeHistoryDialog', () => {
  describe('#modificationTimeOptions', () => {
    it('should create options for e-select from backup times', () => {
      const backups = [
        { data: { FIELD: 'new-value' }, backupTime: '2020-12-24T20:00:00.000Z' },
        { data: { FIELD: 'old-value' }, backupTime: '2020-12-24T18:00:00.000Z' }
      ];
      const { vm } = mount(ChangeHistoryDialog, { propsData: { backups } });
      vm.selectedModificationTime = '2020-12-24T20:00:00.000Z';

      expect(vm.modificationTimeOptions).to.eql([
        {
          type: 'option',
          content: format(new Date('2020-12-24T20:00:00.000Z'), 'yyyy-MM-dd HH:mm:SS'),
          value: '2020-12-24T20:00:00.000Z',
          selected: true
        },
        {
          type: 'option',
          content: format(new Date('2020-12-24T18:00:00.000Z'), 'yyyy-MM-dd HH:mm:SS'),
          value: '2020-12-24T18:00:00.000Z',
          selected: false
        }
      ]);
    });
  });

  describe('#displayChange', () => {
    it('should set selectedModificationTime and secret before and after change', () => {
      const backups = [
        { data: { FIELD: 'etwas-value' }, backupTime: '2020-12-24T21:00:00.000Z' },
        { data: { FIELD: 'value' }, backupTime: '2020-11-24T18:00:00.000Z' },
        { data: { FIELD: 'old-value' }, backupTime: '2020-10-24T20:00:00.000Z' }
      ];
      const { vm } = mount(ChangeHistoryDialog, { propsData: { backups } });

      vm.displayChange('2020-11-24T18:00:00.000Z');

      expect(vm.selectedModificationTime).to.eql('2020-11-24T18:00:00.000Z');
      expect(vm.secretBefore).to.eql({ FIELD: 'old-value' });
      expect(vm.secretAfter).to.eql({ FIELD: 'value' });
    });

    it('should set secrets before to empty object if the first modification is selected', () => {
      const backups = [
        { data: { FIELD: 'etwas-value' }, backupTime: '2020-12-24T21:00:00.000Z' },
        { data: { FIELD: 'value' }, backupTime: '2020-11-24T18:00:00.000Z' }
      ];
      const { vm } = mount(ChangeHistoryDialog, { propsData: { backups } });

      vm.displayChange('2020-11-24T18:00:00.000Z');

      expect(vm.secretBefore).to.eql({});
      expect(vm.secretAfter).to.eql({ FIELD: 'value' });
    });
  });
});
