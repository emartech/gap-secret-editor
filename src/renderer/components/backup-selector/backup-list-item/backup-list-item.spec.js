import { mount } from '@vue/test-utils';
import BackupListItem from './backup-list-item';

describe('BackupListItem', () => {
  const isHovered = wrapper => wrapper.classes('e-actionlist__item-active');

  it('should listen to mouse enter/leave events and update hover state accordingly', async () => {
    const wrapper = mount(BackupListItem);
    expect(isHovered(wrapper)).to.be.false;

    wrapper.trigger('mouseenter');
    await wrapper.vm.$nextTick();
    expect(isHovered(wrapper)).to.be.true;

    wrapper.trigger('mouseleave');
    await wrapper.vm.$nextTick();
    expect(isHovered(wrapper)).to.be.false;
  });
});
