import { mount } from '@vue/test-utils';
import { format } from 'date-fns';
import BackupSelector from './backup-selector';

describe('BackupSelector', () => {
  const availableTimes = ['2020-12-24T18:00:00.000Z', '2020-12-24T20:00:00.000Z'];
  const selectedTime = availableTimes[0];

  describe('#options', () => {
    it("should return available backup times formatted in user's timezone", () => {
      sinon.stub(Date.prototype, 'getTimezoneOffset').returns(-180);
      const { vm } = mount(BackupSelector, {
        propsData: { availableTimes, selectedTime, disabled: false }
      });

      expect(vm.options).to.eql([
        {
          time: '2020-12-24T18:00:00.000Z',
          displayedTime: format(new Date('2020-12-24T18:00:00.000Z'), 'yyyy-MM-dd HH:mm:SS'),
          selected: true
        },
        {
          time: '2020-12-24T20:00:00.000Z',
          displayedTime: format(new Date('2020-12-24T20:00:00.000Z'), 'yyyy-MM-dd HH:mm:SS'),
          selected: false
        }
      ]);
    });

    it('should return "no backups" when there are no backup times', () => {
      const { vm } = mount(BackupSelector, {
        propsData: { availableTimes: [], selectedTime: null, disabled: false }
      });

      expect(vm.options).to.eql([
        {
          displayedTime: 'No backups found'
        }
      ]);
    });
  });

  describe('#viewBackup', () => {
    it('should emit the time of selected backup and the time of the one before it', () => {
      const availableTimes = [
        '2020-12-24T18:00:00.000Z',
        '2020-12-24T21:00:00.000Z',
        '2020-12-24T20:00:00.000Z'
      ];
      const wrapper = mount(BackupSelector, { propsData: { availableTimes } });

      wrapper.vm.viewBackup('2020-12-24T20:00:00.000Z');

      expect(wrapper.emitted()).to.eql({
        'preview-backup': [
          [
            {
              modificationTime: '2020-12-24T20:00:00.000Z',
              lastModificationBefore: '2020-12-24T18:00:00.000Z'
            }
          ]
        ]
      });
    });

    it('should emit time and null for last modification if it was the first modification', () => {
      const availableTimes = [
        '2020-12-24T18:00:00.000Z',
        '2020-12-24T21:00:00.000Z'
      ];
      const wrapper = mount(BackupSelector, { propsData: { availableTimes } });

      wrapper.vm.viewBackup('2020-12-24T18:00:00.000Z');

      expect(wrapper.emitted()).to.eql({
        'preview-backup': [
          [
            {
              modificationTime: '2020-12-24T18:00:00.000Z',
              lastModificationBefore: null
            }
          ]
        ]
      });
    });
  });
});
