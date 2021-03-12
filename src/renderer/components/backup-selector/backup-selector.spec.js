import { mount } from '@vue/test-utils';
import { format } from 'date-fns';
import BackupSelector from './backup-selector';

describe('BackupSelector', () => {
  const availableTimes = ['2020-12-24T18:00:00.000Z', '2020-12-24T20:00:00.000Z'];
  const selectedTime = availableTimes[0];

  describe('#actionlistItems', () => {
    it("should return available backup times formatted in user's timezone", () => {
      sinon.stub(Date.prototype, 'getTimezoneOffset').returns(-180);
      const { vm } = mount(BackupSelector, { propsData: { availableTimes, selectedTime, disabled: false } });
      vm.actionlistOpen = true;

      expect(vm.actionlistItems).to.eql([
        {
          type: 'option',
          content: format(new Date('2020-12-24T18:00:00.000Z'), 'yyyy-MM-dd HH:mm:SS'),
          value: '2020-12-24T18:00:00.000Z',
          selected: true
        },
        {
          type: 'option',
          content: format(new Date('2020-12-24T20:00:00.000Z'), 'yyyy-MM-dd HH:mm:SS'),
          value: '2020-12-24T20:00:00.000Z',
          selected: false
        }
      ]);
    });

    it('should return empty array when action list is closed', () => {
      const { vm } = mount(BackupSelector, { propsData: { availableTimes, selectedTime, disabled: false } });

      expect(vm.actionlistItems).to.eql([]);
    });

    it('should return "no backups" when there are no backup times', () => {
      const { vm } = mount(BackupSelector, { propsData: { availableTimes: [], selectedTime: null, disabled: false } });
      vm.actionlistOpen = true;

      expect(vm.actionlistItems).to.eql([
        {
          type: 'option',
          content: 'No backups found',
          value: null
        }
      ]);
    });
  });

  describe('#onActionlistChange', () => {
    it('should emit input when value selected', () => {
      const wrapper = mount(BackupSelector, { propsData: { availableTimes, selectedTime, disabled: false } });
      wrapper.vm.onActionlistChange('2020-12-24T20:00:00.000Z');
      expect(wrapper.emitted()).to.eql({
        input: [
          ['2020-12-24T20:00:00.000Z']
        ]
      });
    });

    it('should not emit anything when nothing selected', () => {
      const wrapper = mount(BackupSelector, { propsData: { availableTimes: [], selectedTime: null, disabled: false } });
      wrapper.vm.onActionlistChange(null);
      expect(wrapper.emitted()).to.eql({});
    });
  });
});
