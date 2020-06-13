import { mount } from '@vue/test-utils';
import SecretEditor from './secret-editor';

describe('SecretEditor', () => {
  const fields = () => [
    { key: 'name', value: 'James Bond' },
    { key: 'code', value: '007' }
  ];

  it('should display fields with an extra empty row', () => {
    const { vm } = mount(SecretEditor, { propsData: { value: fields() } });

    const renderedKeys = Array.from(vm.$el.querySelectorAll('input')).map(input => input.value);
    expect(renderedKeys).to.eql(['name', 'code', '']);
    const renderedValues = Array.from(vm.$el.querySelectorAll('textarea')).map(input => input.value);
    expect(renderedValues).to.eql(['James Bond', '007', '']);
  });

  it('should display delete buttons for every field, and disable the last one', () => {
    const { vm } = mount(SecretEditor, { propsData: { value: fields() } });

    const isButtonDisabled = button => Array.from(button.classList).includes('e-btn-disabled');
    const deleteButtons = Array.from(vm.$el.querySelectorAll('.e-btn'));
    expect(isButtonDisabled(deleteButtons[0])).to.be.false;
    expect(isButtonDisabled(deleteButtons[1])).to.be.false;
    expect(isButtonDisabled(deleteButtons[2])).to.be.true;
  });

  describe('change emitting', () => {
    it('should emit modified secret when a key changes', async () => {
      const wrapper = mount(SecretEditor, { propsData: { value: fields() } });

      wrapper.findAll('input').at(1).setValue('kod');

      expect(wrapper.emitted()).to.eql({ input: [[[
        { key: 'name', value: 'James Bond' },
        { key: 'kod', value: '007' }
      ]]] });
    });

    it('should emit modified secret when a value changes', async () => {
      const wrapper = mount(SecretEditor, { propsData: { value: fields() } });

      wrapper.findAll('textarea').at(0).setValue('James Bandi');

      expect(wrapper.emitted()).to.eql({ input: [[[
        { key: 'name', value: 'James Bandi' },
        { key: 'code', value: '007' }
      ]]] });
    });

    it('should emit modified secret when a new key entered', () => {
      const wrapper = mount(SecretEditor, { propsData: { value: fields() } });

      wrapper.findAll('input').at(2).setValue('drink');

      expect(wrapper.emitted()).to.eql({ input: [[[
        { key: 'name', value: 'James Bond' },
        { key: 'code', value: '007' },
        { key: 'drink', value: '' }
      ]]] });
    });

    it('should emit modified secret when a new value entered', () => {
      const wrapper = mount(SecretEditor, { propsData: { value: fields() } });

      wrapper.findAll('textarea').at(2).setValue('Martini');

      expect(wrapper.emitted()).to.eql({ input: [[[
        { key: 'name', value: 'James Bond' },
        { key: 'code', value: '007' },
        { key: '', value: 'Martini' }
      ]]] });
    });

    it('should emit modified secret when a field is deleted', () => {
      const wrapper = mount(SecretEditor, { propsData: { value: fields() } });

      wrapper.findAll('.e-btn').at(1).trigger('click');

      expect(wrapper.emitted()).to.eql({ input: [[[
        { key: 'name', value: 'James Bond' }
      ]]] });
    });
  });
});
