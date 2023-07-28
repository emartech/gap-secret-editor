import { range } from 'lodash';
import LazyComponent from 'v-lazy-component/vue2';
import SecretEditor from './secret-editor';
import {
  mountWithFakeAceEditor,
  mountWithFakeLazyComponent,
  mountWithStore,
  shallowMountWithStore
} from '../../../../test-helpers/mount-helpers';

describe('SecretEditor', () => {
  const fields = () => [
    { key: 'name', value: 'James Bond' },
    { key: 'code', value: '007' }
  ];

  describe('#filteredFields', () => {
    it('should return given fields with an extra empty field when searchTerm is empty', () => {
      const { vm } = mountWithStore(SecretEditor, { propsData: { value: fields(), searchTerm: '' } });

      expect(vm.filteredFields).to.eql([
        { key: 'name', value: 'James Bond', index: 0 },
        { key: 'code', value: '007', index: 1 },
        { key: '', value: '', index: 2 }
      ]);
    });

    it('should return matching field with an extra empty field when key equals searchTerm', () => {
      const { vm } = mountWithStore(SecretEditor, { propsData: { value: fields(), searchTerm: 'name' } });

      expect(vm.filteredFields).to.eql([
        { key: 'name', value: 'James Bond', index: 0 },
        { key: '', value: '', index: 2 }
      ]);
    });

    it('should return matching field with an extra empty field when key contains searchTerm', () => {
      const { vm } = mountWithStore(SecretEditor, { propsData: { value: fields(), searchTerm: 'od' } });

      expect(vm.filteredFields).to.eql([
        { key: 'code', value: '007', index: 1 },
        { key: '', value: '', index: 2 }
      ]);
    });

    it('should return matching field with an empty field when key contains searchTerm with different casing', () => {
      const { vm } = mountWithStore(SecretEditor, { propsData: { value: fields(), searchTerm: 'OD' } });

      expect(vm.filteredFields).to.eql([
        { key: 'code', value: '007', index: 1 },
        { key: '', value: '', index: 2 }
      ]);
    });

    it('should return matching field with an extra empty field when value equals searchTerm', () => {
      const { vm } = mountWithStore(SecretEditor, { propsData: { value: fields(), searchTerm: 'James Bond' } });

      expect(vm.filteredFields).to.eql([
        { key: 'name', value: 'James Bond', index: 0 },
        { key: '', value: '', index: 2 }
      ]);
    });

    it('should return matching field with an extra empty field when value contains searchTerm', () => {
      const { vm } = mountWithStore(SecretEditor, { propsData: { value: fields(), searchTerm: 'Bond' } });

      expect(vm.filteredFields).to.eql([
        { key: 'name', value: 'James Bond', index: 0 },
        { key: '', value: '', index: 2 }
      ]);
    });

    it('should return matching field with an empty field when value contains searchTerm with different casing', () => {
      const { vm } = mountWithStore(SecretEditor, { propsData: { value: fields(), searchTerm: 'bOND' } });

      expect(vm.filteredFields).to.eql([
        { key: 'name', value: 'James Bond', index: 0 },
        { key: '', value: '', index: 2 }
      ]);
    });

    it('should return matching fields with an extra empty field when more fields are matching with searchTerm', () => {
      const { vm } = mountWithStore(SecretEditor, { propsData: { value: fields(), searchTerm: 'o' } });

      expect(vm.filteredFields).to.eql([
        { key: 'name', value: 'James Bond', index: 0 },
        { key: 'code', value: '007', index: 1 },
        { key: '', value: '', index: 2 }
      ]);
    });

    it('should update return value when searchTerm changes', async () => {
      const wrapper = mountWithStore(SecretEditor, { propsData: { value: fields(), searchTerm: 'o' } });

      expect(wrapper.vm.filteredFields).to.eql([
        { key: 'name', value: 'James Bond', index: 0 },
        { key: 'code', value: '007', index: 1 },
        { key: '', value: '', index: 2 }
      ]);

      wrapper.setProps({ value: fields(), searchTerm: 'code' });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.filteredFields).to.eql([
        { key: 'code', value: '007', index: 1 },
        { key: '', value: '', index: 2 }
      ]);
    });

    it('should not update return value when value changes', async () => {
      const wrapper = mountWithStore(SecretEditor, { propsData: { value: fields(), searchTerm: 'o' } });

      expect(wrapper.vm.filteredFields).to.eql([
        { key: 'name', value: 'James Bond', index: 0 },
        { key: 'code', value: '007', index: 1 },
        { key: '', value: '', index: 2 }
      ]);

      const secret = fields();
      secret[0].value = 'James Bandi';
      wrapper.setProps({ value: secret, searchTerm: 'o' });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.filteredFields).to.eql([
        { key: 'name', value: 'James Bandi', index: 0 },
        { key: 'code', value: '007', index: 1 },
        { key: '', value: '', index: 2 }
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
      const { vm } = mountWithStore(SecretEditor, { propsData: { value, searchTerm: '' } });

      expect(vm.isDuplicatedField('code')).to.be.false;
    });

    it('should return true when field key appears multiple times', () => {
      const value = [
        { key: 'name', value: 'James Bond' },
        { key: 'code', value: '007' },
        { key: 'name', value: 'Johnny English' }
      ];
      const { vm } = mountWithStore(SecretEditor, { propsData: { value, searchTerm: '' } });

      expect(vm.isDuplicatedField('name')).to.be.true;
    });
  });

  it('should display fields with an extra empty row', () => {
    const { vm } = mountWithFakeAceEditor(SecretEditor, { propsData: { value: fields() } });

    const renderedKeys = Array.from(vm.$el.querySelectorAll('.secret-key')).map(input => input.value);
    expect(renderedKeys).to.eql(['name', 'code', '']);
    const renderedValues = Array.from(vm.$el.querySelectorAll('.secret-value')).map(input => input.value);
    expect(renderedValues).to.eql(['James Bond', '007', '']);
  });

  it('should display fields matching with search term', async () => {
    const { vm } = mountWithFakeAceEditor(SecretEditor, { propsData: { value: fields(), searchTerm: 'name' } });
    await vm.$nextTick();

    const renderedKeys = Array.from(vm.$el.querySelectorAll('.secret-key')).map(input => input.value);
    expect(renderedKeys).to.eql(['name', '']);
    const renderedValues = Array.from(vm.$el.querySelectorAll('.secret-value')).map(input => input.value);
    expect(renderedValues).to.eql(['James Bond', '']);
  });

  it('should display delete buttons for every field, and disable the last one', () => {
    const { vm } = shallowMountWithStore(SecretEditor, { propsData: { value: fields() } });

    const isButtonDisabled = button => Array.from(button.classList).includes('e-btn-disabled');
    const deleteButtons = Array.from(vm.$el.querySelectorAll('.e-btn'));
    expect(isButtonDisabled(deleteButtons[0])).to.be.false;
    expect(isButtonDisabled(deleteButtons[1])).to.be.false;
    expect(isButtonDisabled(deleteButtons[2])).to.be.true;
  });

  describe('change emitting', () => {
    it('should emit modified secret when a key changes', async () => {
      const wrapper = mountWithFakeAceEditor(SecretEditor, { propsData: { value: fields() } });

      wrapper.findAll('.secret-key').at(1).setValue('kod');

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

      wrapper.findAll('.secret-value').at(0).setValue('James Bandi');

      expect(wrapper.emitted()).to.eql({ input: [[[
        { key: 'name', value: 'James Bandi' },
        { key: 'code', value: '007' }
      ]]] });
    });

    it('should emit modified secret when a new key entered', () => {
      const wrapper = mountWithFakeAceEditor(SecretEditor, { propsData: { value: fields() } });

      wrapper.findAll('.secret-key').at(2).setValue('drink');

      expect(wrapper.emitted()).to.eql({ input: [[[
        { key: 'name', value: 'James Bond' },
        { key: 'code', value: '007' },
        { key: 'drink', value: '' }
      ]]] });
    });

    it('should emit modified secret when a new value entered', () => {
      const wrapper = mountWithFakeAceEditor(SecretEditor, { propsData: { value: fields() } });

      wrapper.findAll('.secret-value').at(2).setValue('Martini');

      expect(wrapper.emitted()).to.eql({ input: [[[
        { key: 'name', value: 'James Bond' },
        { key: 'code', value: '007' },
        { key: '', value: 'Martini' }
      ]]] });
    });

    it('should emit the whole modified secret when search term is provided and a value is modified', async () => {
      const wrapper = mountWithFakeAceEditor(SecretEditor, { propsData: { value: fields(), searchTerm: 'code' } });
      await wrapper.vm.$nextTick();

      wrapper.findAll('.secret-value').at(0).setValue('42');

      expect(wrapper.emitted()).to.eql({ input: [[[
        { key: 'name', value: 'James Bond' },
        { key: 'code', value: '42' }
      ]]] });
    });

    it('should emit modified secret when a field is deleted', () => {
      const wrapper = shallowMountWithStore(SecretEditor, { propsData: { value: fields() } });

      wrapper.findAll('.e-btn').at(1).trigger('click');

      expect(wrapper.emitted()).to.eql({ input: [[[
        { key: 'name', value: 'James Bond' }
      ]]] });
    });

    it('should emit the whole modified secret when search term is provided and a field is deleted', async () => {
      const wrapper = shallowMountWithStore(SecretEditor, { propsData: { value: fields(), searchTerm: 'code' } });
      await wrapper.vm.$nextTick();

      wrapper.findAll('.e-btn').at(0).trigger('click');

      expect(wrapper.emitted()).to.eql({ input: [[[
        { key: 'name', value: 'James Bond' }
      ]]] });
    });
  });

  describe('lazy loading', () => {
    it('should display only the first 30 fields and show loading indicator for the rest', () => {
      const fields = range(35).map(i => ({ key: `key_${i}`, value: `value_${i}` }));
      const { vm } = mountWithFakeLazyComponent(SecretEditor, { propsData: { value: fields } });

      const renderedValues = vm.$el.querySelectorAll('.secret-value');
      expect(renderedValues.length).to.eql(30);

      const renderedLoadingIndicators = vm.$el.querySelectorAll('e-spinner');
      expect(renderedLoadingIndicators.length).to.eql(6);
    });

    it('should display the remaining fields when the user scrolls to them', async () => {
      const fields = range(35).map(i => ({ key: `key_${i}`, value: `value_${i}` }));
      const wrapper = mountWithFakeLazyComponent(SecretEditor, { propsData: { value: fields } });

      wrapper.findAllComponents(LazyComponent).wrappers.forEach(wrapper => wrapper.vm.handleBecomingVisible());
      await wrapper.vm.$nextTick();

      const renderedValues = wrapper.vm.$el.querySelectorAll('.secret-value');
      expect(renderedValues.length).to.eql(36);

      const renderedLoadingIndicators = wrapper.vm.$el.querySelectorAll('e-spinner');
      expect(renderedLoadingIndicators.length).to.eql(0);
    });
  });
});
