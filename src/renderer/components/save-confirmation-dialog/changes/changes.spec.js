import { mount } from '@vue/test-utils';
import Changes from './changes';

describe('Changes', () => {
  describe('#lines', () => {
    it('should return all lines to both sides when the strings are equal', () => {
      const originalValue = 'some\nstring\nwith\nmore\nlines';
      const currentValue = 'some\nstring\nwith\nmore\nlines';
      const { vm } = mount(Changes, { propsData: { originalValue, currentValue } });

      expect(vm.lines).to.eql([
        { left: 'some', right: 'some' },
        { left: 'string', right: 'string' },
        { left: 'with', right: 'with' },
        { left: 'more', right: 'more' },
        { left: 'lines', right: 'lines' }
      ]);
    });

    describe('when lines are added', () => {
      it('should return all lines only to the right side when original value is missing', () => {
        const currentValue = 'some\nstring\nwith\nmore\nlines';
        const { vm } = mount(Changes, { propsData: { currentValue } });

        expect(vm.lines).to.eql([
          { left: undefined, right: 'some' },
          { left: undefined, right: 'string' },
          { left: undefined, right: 'with' },
          { left: undefined, right: 'more' },
          { left: undefined, right: 'lines' }
        ]);
      });

      it('should return added lines only to the right side when added lines are at the end', () => {
        const originalValue = 'some\nstring\n';
        const currentValue = 'some\nstring\nwith\nmore\nlines';
        const { vm } = mount(Changes, { propsData: { originalValue, currentValue } });

        expect(vm.lines).to.eql([
          { left: 'some', right: 'some' },
          { left: 'string', right: 'string' },
          { left: undefined, right: 'with' },
          { left: undefined, right: 'more' },
          { left: undefined, right: 'lines' }
        ]);
      });

      it('should return added lines only to the right side when added lines are in the middle', () => {
        const originalValue = 'some\nstring';
        const currentValue = 'some\ncute\nand\nfancy\nstring';
        const { vm } = mount(Changes, { propsData: { originalValue, currentValue } });

        expect(vm.lines).to.eql([
          { left: 'some', right: 'some' },
          { left: undefined, right: 'cute' },
          { left: undefined, right: 'and' },
          { left: undefined, right: 'fancy' },
          { left: 'string', right: 'string' }
        ]);
      });

      it('should return added lines only to the right side when added lines are at the beginning', () => {
        const originalValue = 'some\nstring';
        const currentValue = 'just\nsome\nstring';
        const { vm } = mount(Changes, { propsData: { originalValue, currentValue } });

        expect(vm.lines).to.eql([
          { left: undefined, right: 'just' },
          { left: 'some', right: 'some' },
          { left: 'string', right: 'string' }
        ]);
      });

      it('should return added lines only to the right side when added lines are only new lines', () => {
        const originalValue = 'some\nstring\nwith\nmore\nlines';
        const currentValue = 'some\nstring\nwith\n\n\nmore\nlines';
        const { vm } = mount(Changes, { propsData: { originalValue, currentValue } });

        expect(vm.lines).to.eql([
          { left: 'some', right: 'some' },
          { left: 'string', right: 'string' },
          { left: 'with', right: 'with' },
          { left: undefined, right: '' },
          { left: undefined, right: '' },
          { left: 'more', right: 'more' },
          { left: 'lines', right: 'lines' }
        ]);
      });
    });

    describe('when lines are removed', () => {
      it('should return all lines only to the left side when current value is missing', () => {
        const originalValue = 'some\nstring\nwith\nmore\nlines';
        const { vm } = mount(Changes, { propsData: { originalValue } });

        expect(vm.lines).to.eql([
          { left: 'some', right: undefined },
          { left: 'string', right: undefined },
          { left: 'with', right: undefined },
          { left: 'more', right: undefined },
          { left: 'lines', right: undefined }
        ]);
      });

      it('should return removed lines only to the left side when removed lines are at the end', () => {
        const originalValue = 'some\nstring\nwith\nmore\nlines';
        const currentValue = 'some\nstring\n';
        const { vm } = mount(Changes, { propsData: { originalValue, currentValue } });

        expect(vm.lines).to.eql([
          { left: 'some', right: 'some' },
          { left: 'string', right: 'string' },
          { left: 'with', right: undefined },
          { left: 'more', right: undefined },
          { left: 'lines', right: undefined }
        ]);
      });

      it('should return removed lines only to the left side when removed lines are in the middle', () => {
        const originalValue = 'some\ncute\nand\nfancy\nstring';
        const currentValue = 'some\nstring';
        const { vm } = mount(Changes, { propsData: { originalValue, currentValue } });

        expect(vm.lines).to.eql([
          { left: 'some', right: 'some' },
          { left: 'cute', right: undefined },
          { left: 'and', right: undefined },
          { left: 'fancy', right: undefined },
          { left: 'string', right: 'string' }
        ]);
      });

      it('should return removed lines only to the left side when removed lines are at the beginning', () => {
        const originalValue = 'just\nsome\nstring';
        const currentValue = 'some\nstring';
        const { vm } = mount(Changes, { propsData: { originalValue, currentValue } });

        expect(vm.lines).to.eql([
          { left: 'just', right: undefined },
          { left: 'some', right: 'some' },
          { left: 'string', right: 'string' }
        ]);
      });

      it('should return removed lines only to the left side when removed lines are only new lines', () => {
        const originalValue = 'some\nstring\nwith\n\n\nmore\nlines';
        const currentValue = 'some\nstring\nwith\nmore\nlines';
        const { vm } = mount(Changes, { propsData: { originalValue, currentValue } });

        expect(vm.lines).to.eql([
          { left: 'some', right: 'some' },
          { left: 'string', right: 'string' },
          { left: 'with', right: 'with' },
          { left: '', right: undefined },
          { left: '', right: undefined },
          { left: 'more', right: 'more' },
          { left: 'lines', right: 'lines' }
        ]);
      });
    });

    describe('when lines are changed', () => {
      it('should return added lines to the right and removed lines to the left when they are at the end', () => {
        const originalValue = 'some\nstring\nwith\nmore\nlines';
        const currentValue = 'some\nstring\nhave\nmultiple\nletters';
        const { vm } = mount(Changes, { propsData: { originalValue, currentValue } });

        expect(vm.lines).to.eql([
          { left: 'some', right: 'some' },
          { left: 'string', right: 'string' },
          { left: 'with', right: 'have' },
          { left: 'more', right: 'multiple' },
          { left: 'lines', right: 'letters' }
        ]);
      });

      it('should return added lines to the right and removed lines to the left when they are in the middle', () => {
        const originalValue = 'some\nstring\nwith\nmore\nlines';
        const currentValue = 'some\ntext\nhave\nmultiple\nlines';
        const { vm } = mount(Changes, { propsData: { originalValue, currentValue } });

        expect(vm.lines).to.eql([
          { left: 'some', right: 'some' },
          { left: 'string', right: 'text' },
          { left: 'with', right: 'have' },
          { left: 'more', right: 'multiple' },
          { left: 'lines', right: 'lines' }
        ]);
      });

      it('should return added lines to the right and removed lines to the left when they are at the beginning', () => {
        const originalValue = 'some\nstring\nwith\nmore\nlines';
        const currentValue = 'cute\ntext\nwith\nmore\nlines';
        const { vm } = mount(Changes, { propsData: { originalValue, currentValue } });

        expect(vm.lines).to.eql([
          { left: 'some', right: 'cute' },
          { left: 'string', right: 'text' },
          { left: 'with', right: 'with' },
          { left: 'more', right: 'more' },
          { left: 'lines', right: 'lines' }
        ]);
      });

      it('should return added and removed lines properly when more lines added than removed', () => {
        const originalValue = 'some\nstring\nwith\nmore\nlines';
        const currentValue = 'some\ntext\nhave\ntoo\nmany\nlines';
        const { vm } = mount(Changes, { propsData: { originalValue, currentValue } });

        expect(vm.lines).to.eql([
          { left: 'some', right: 'some' },
          { left: 'string', right: 'text' },
          { left: 'with', right: 'have' },
          { left: 'more', right: 'too' },
          { left: undefined, right: 'many' },
          { left: 'lines', right: 'lines' }
        ]);
      });

      it('should return added and removed lines properly when more lines removed than added', () => {
        const originalValue = 'some\nstring\nwith\nmore\nlines';
        const currentValue = 'some\ntext\nhave\nlines';
        const { vm } = mount(Changes, { propsData: { originalValue, currentValue } });

        expect(vm.lines).to.eql([
          { left: 'some', right: 'some' },
          { left: 'string', right: 'text' },
          { left: 'with', right: 'have' },
          { left: 'more', right: undefined },
          { left: 'lines', right: 'lines' }
        ]);
      });
    });
  });
});
