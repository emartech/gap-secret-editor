import { isNil } from 'lodash';
import { createPatch } from 'diff';
import * as Diff2Html from 'diff2html';
import { isValidJson } from '../../../lib/json-helper/json-helper';

export default {
  name: 'difference',
  template: require('./difference.html'),
  props: {
    label: String,
    originalValue: String,
    currentValue: String
  },
  computed: {
    content() {
      const patch = createPatch(this.label, this.originalValue || '', this.currentValue || '');
      const diffJson = Diff2Html.parse(patch);
      return Diff2Html.html(diffJson, {
        drawFileList: false,
        matching: 'lines',
        outputFormat: 'side-by-side',
        rawTemplates: {
          'generic-file-path':
            `<span>${this.label}</span>
             <span class="e-padding-left-l text-color-gray-400">${this.changeType}</span>
             ${this.invalidatedJsonMessage}`,
          'generic-empty-diff':
            `<tr>
              <td class="{{CSSLineClass.INFO}}">
                <div class="{{contentClass}} {{CSSLineClass.INFO}}">
                  Value is empty
                </div>
              </td>
            </tr>`
        }
      });
    },
    changeType() {
      return !isNil(this.originalValue) && !isNil(this.currentValue)
        ? 'CHANGED'
        : isNil(this.originalValue)
          ? 'ADDED'
          : 'REMOVED';
    },
    invalidatedJsonMessage() {
      if (!isValidJson(this.originalValue || '') || !this.currentValue || isValidJson(this.currentValue)) return '';

      return `<span class="e-padding-left-xl text-color-warning">
                <e-icon class="e-padding-right-2xs" icon="warning" color="warning"></e-icon>
                JSON became invalid
              </span>`;
    }
  },
  methods: {
    enableSynchronizedScrolling() {
      const [originalSide, currentSide] = this.$el.querySelectorAll('.d2h-file-side-diff');
      originalSide.addEventListener('scroll', () => currentSide.scrollLeft = originalSide.scrollLeft);
      currentSide.addEventListener('scroll', () => originalSide.scrollLeft = currentSide.scrollLeft);
    }
  },
  mounted() {
    this.enableSynchronizedScrolling();
  },
  updated() {
    this.enableSynchronizedScrolling();
  }
};
