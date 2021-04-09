import { mount } from '@vue/test-utils';
import SecretEditor from './secret-editor';
import { mountWithFakeAceEditor } from '../../../../test-helpers/mount-helpers';

describe('SecretEditor', () => {
  const fields = () => [
    { key: 'name', value: 'James Bond' },
    { key: 'code', value: '007' }
  ];

  describe('#filteredFields', () => {
    it('should return given fields with an extra empty field when searchTerm is empty', () => {
      const { vm } = mount(SecretEditor, { propsData: { value: fields(), searchTerm: '' } });

      expect(vm.filteredFields).to.eql([
        { key: 'name', value: 'James Bond', index: 0 },
        { key: 'code', value: '007', index: 1 },
        { key: '', value: '', index: 2 }
      ]);
    });

    it('should return matching field when key equals searchTerm', () => {
      const { vm } = mount(SecretEditor, { propsData: { value: fields(), searchTerm: 'name' } });

      expect(vm.filteredFields).to.eql([
        { key: 'name', value: 'James Bond', index: 0 }
      ]);
    });

    it('should return matching field when key contains searchTerm', () => {
      const { vm } = mount(SecretEditor, { propsData: { value: fields(), searchTerm: 'od' } });

      expect(vm.filteredFields).to.eql([
        { key: 'code', value: '007', index: 1 }
      ]);
    });

    it('should return matching field when key contains searchTerm with different casing', () => {
      const { vm } = mount(SecretEditor, { propsData: { value: fields(), searchTerm: 'OD' } });

      expect(vm.filteredFields).to.eql([
        { key: 'code', value: '007', index: 1 }
      ]);
    });

    it('should return matching field when value equals searchTerm', () => {
      const { vm } = mount(SecretEditor, { propsData: { value: fields(), searchTerm: 'James Bond' } });

      expect(vm.filteredFields).to.eql([
        { key: 'name', value: 'James Bond', index: 0 }
      ]);
    });

    it('should return matching field when value contains searchTerm', () => {
      const { vm } = mount(SecretEditor, { propsData: { value: fields(), searchTerm: 'Bond' } });

      expect(vm.filteredFields).to.eql([
        { key: 'name', value: 'James Bond', index: 0 }
      ]);
    });

    it('should return matching field when value contains searchTerm with different casing', () => {
      const { vm } = mount(SecretEditor, { propsData: { value: fields(), searchTerm: 'bOND' } });

      expect(vm.filteredFields).to.eql([
        { key: 'name', value: 'James Bond', index: 0 }
      ]);
    });

    it('should return matching fields when more fields are matching with searchTerm', () => {
      const { vm } = mount(SecretEditor, { propsData: { value: fields(), searchTerm: 'o' } });

      expect(vm.filteredFields).to.eql([
        { key: 'name', value: 'James Bond', index: 0 },
        { key: 'code', value: '007', index: 1 }
      ]);
    });
  });

  describe('#isDuplicatedField', () => {
    it('should return false when field key is unique', () => {
      const value = [
        { key: 'name', value: 'James Bond' },
        { key: 'code', value: '007' },
        { key: 'name', value: 'Johnny English' }
      ];
      const { vm } = mount(SecretEditor, { propsData: { value, searchTerm: '' } });

      expect(vm.isDuplicatedField('code')).to.be.false;
    });

    it('should return true when field key appears multiple times', () => {
      const value = [
        { key: 'name', value: 'James Bond' },
        { key: 'code', value: '007' },
        { key: 'name', value: 'Johnny English' }
      ];
      const { vm } = mount(SecretEditor, { propsData: { value, searchTerm: '' } });

      expect(vm.isDuplicatedField('name')).to.be.true;
    });
  });

  it('should display fields with an extra empty row', () => {
    const { vm } = mountWithFakeAceEditor(SecretEditor, { propsData: { value: fields() } });

    const renderedKeys = Array.from(vm.$el.querySelectorAll('input')).map(input => input.value);
    expect(renderedKeys).to.eql(['name', 'code', '']);
    const renderedValues = Array.from(vm.$el.querySelectorAll('textarea')).map(input => input.value);
    expect(renderedValues).to.eql(['James Bond', '007', '']);
  });

  it('should display fields matching with search term', () => {
    const { vm } = mountWithFakeAceEditor(SecretEditor, { propsData: { value: fields(), searchTerm: 'name' } });

    const renderedKeys = Array.from(vm.$el.querySelectorAll('input')).map(input => input.value);
    expect(renderedKeys).to.eql(['name']);
    const renderedValues = Array.from(vm.$el.querySelectorAll('textarea')).map(input => input.value);
    expect(renderedValues).to.eql(['James Bond']);
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

      expect(wrapper.vm.value).to.eql([
        { key: 'name', value: 'James Bond' },
        { key: 'code', value: '007' }
      ]);
    });

    it('should emit modified secret when a value changes', async () => {
      const wrapper = mountWithFakeAceEditor(SecretEditor, { propsData: { value: fields() } });

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
      const wrapper = mountWithFakeAceEditor(SecretEditor, { propsData: { value: fields() } });

      wrapper.findAll('textarea').at(2).setValue('Martini');

      expect(wrapper.emitted()).to.eql({ input: [[[
        { key: 'name', value: 'James Bond' },
        { key: 'code', value: '007' },
        { key: '', value: 'Martini' }
      ]]] });
    });

    it('should emit the whole modified secret when search term is provided and a value is modified', () => {
      const wrapper = mountWithFakeAceEditor(SecretEditor, { propsData: { value: fields(), searchTerm: 'code' } });

      wrapper.findAll('textarea').at(0).setValue('42');

      expect(wrapper.emitted()).to.eql({ input: [[[
        { key: 'name', value: 'James Bond' },
        { key: 'code', value: '42' }
      ]]] });
    });

    it('should emit modified secret when a field is deleted', () => {
      const wrapper = mount(SecretEditor, { propsData: { value: fields() } });

      wrapper.findAll('.e-btn').at(1).trigger('click');

      expect(wrapper.emitted()).to.eql({ input: [[[
        { key: 'name', value: 'James Bond' }
      ]]] });
    });

    it('should emit the whole modified secret when search term is provided and a field is deleted', () => {
      const wrapper = mount(SecretEditor, { propsData: { value: fields(), searchTerm: 'code' } });

      wrapper.findAll('.e-btn').at(0).trigger('click');

      expect(wrapper.emitted()).to.eql({ input: [[[
        { key: 'name', value: 'James Bond' }
      ]]] });
    });
  });
});
