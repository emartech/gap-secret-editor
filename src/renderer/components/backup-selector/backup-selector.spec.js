import { mount } from '@vue/test-utils';
import { format } from 'date-fns';
import BackupSelector from './backup-selector';

describe('BackupSelector', () => {
  describe('#options', () => {
    it('should return available backups with formatted time and selected info', () => {
      sinon.stub(Date.prototype, 'getTimezoneOffset').returns(-180);
      const backups = [
        { data: { FIELD: 'value' }, backupTime: '2020-12-24T18:00:00.000Z' },
        { data: { FIELD: 'old-value' }, backupTime: '2020-12-24T20:00:00.000Z' }
      ];
      const { vm } = mount(BackupSelector, {
        propsData: {
          backups,
          selectedTime: backups[0].backupTime,
          disabled: false
        }
      });

      expect(vm.options).to.eql([
        {
          id: '2020-12-24T18:00:00.000Z',
          displayedTime: format(new Date('2020-12-24T18:00:00.000Z'), 'yyyy-MM-dd HH:mm:ss'),
          selected: true,
          backup: backups[0]
        },
        {
          id: '2020-12-24T20:00:00.000Z',
          displayedTime: format(new Date('2020-12-24T20:00:00.000Z'), 'yyyy-MM-dd HH:mm:ss'),
          selected: false,
          backup: backups[1]
        }
      ]);
    });
  });
});
