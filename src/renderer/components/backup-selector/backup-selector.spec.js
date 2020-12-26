import { mount } from '@vue/test-utils';
import BackupSelector from './backup-selector';

describe('BackupSelector', () => {
  const backups = [
    { backupTime: '2020-12-24T18:00:00.000Z', data: { SANTA_CLAUS: 'coming to town' } },
    { backupTime: '2020-12-24T20:00:00.000Z', data: { SANTA_CLAUS: 'getting drunk' } }
  ];

  describe('#actionlistItems', () => {
    it("should return backups with formatted backup time in user's timezone", () => {
      sinon.stub(Date.prototype, 'getTimezoneOffset').returns(-180);
      const { vm } = mount(BackupSelector, { propsData: { backups, disabled: false } });
      vm.actionlistOpen = true;

      expect(vm.actionlistItems).to.eql([
        {
          type: 'option',
          content: '2020-12-24 21:00:00',
          value: { SANTA_CLAUS: 'coming to town' }
        },
        {
          type: 'option',
          content: '2020-12-24 23:00:00',
          value: { SANTA_CLAUS: 'getting drunk' }
        }
      ]);
    });

    it('should return empty array when action list is closed', () => {
      const { vm } = mount(BackupSelector, { propsData: { backups, disabled: false } });

      expect(vm.actionlistItems).to.eql([]);
    });

    it('should return "no backups" when there are no backups', () => {
      const { vm } = mount(BackupSelector, { propsData: { backups: [], disabled: false } });
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
      const wrapper = mount(BackupSelector, { propsData: { backups, disabled: false } });
      wrapper.vm.onActionlistChange({ SANTA_CLAUS: 'getting drunk' });
      expect(wrapper.emitted()).to.eql({
        input: [
          [{ SANTA_CLAUS: 'getting drunk' }]
        ]
      });
    });

    it('should not emit anything when nothing selected', () => {
      const wrapper = mount(BackupSelector, { propsData: { backups: [], disabled: false } });
      wrapper.vm.onActionlistChange(null);
      expect(wrapper.emitted()).to.eql({});
    });
  });
});
