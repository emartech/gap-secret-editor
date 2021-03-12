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
});
