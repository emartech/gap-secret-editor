import { isValidJson, isJsonWithErrors, minify, prettify } from './json-helper';

describe('#isValidJson', () => {
  it('should return true when string is a valid JSON', () => {
    expect(
      isValidJson('{"addressee": "Luke", "message": "I am your father", "response": "Noooo!"}')
    ).to.be.true;
  });

  it('should return false when string is not a valid JSON', () => {
    expect(isValidJson('Noooo!')).to.be.false;
  });
  it('should return false when input is a boolean value', () => {
    expect(isValidJson(true)).to.be.false;
  });
  it('should return false when input is a boolean value as a string', () => {
    expect(isValidJson('false')).to.be.false;
  });
  it('should return false when input is a number', () => {
    expect(isValidJson(1)).to.be.false;
  });
  it('should return false when input is a number as string', () => {
    expect(isValidJson('1')).to.be.false;
  });
});

describe('#isJsonWithErrors', () => {
  it('should return true when input seems like a json but it contains errors', () => {
    const invalidJsonString = '[{ "val: "id }]';

    const result = isJsonWithErrors(invalidJsonString);

    expect(result).to.be.true;
  });

  it('should return true when input starts like a json but it is not a valid one', () => {
    const invalidJsonString = '[{ "not_json" }]';

    const result = isJsonWithErrors(invalidJsonString);

    expect(result).to.be.true;
  });

  it('should return false when input not starts like a valid json', () => {
    const invalidJsonString = '] "val": "id" ]';

    const result = isJsonWithErrors(invalidJsonString);

    expect(result).to.be.false;
  });
});

describe('#minify and prettify', () => {
  it('should minify a stringified json', () => {
    const jsonString = `[{\n
      "key": "value"
    \n}]`;

    const minifiedJsonString = minify(jsonString);

    expect(_getNumberOfLines(jsonString)).to.eql(5);
    expect(_getNumberOfLines(minifiedJsonString)).to.eql(1);
  });

  it('should prettify a minified json', () => {
    const jsonString = '[{"key":"value"}]';

    const prettifiedJsonString = prettify(jsonString);

    expect(_getNumberOfLines(jsonString)).to.eql(1);
    expect(_getNumberOfLines(prettifiedJsonString)).to.eql(5);
  });
});

const _getNumberOfLines = (string) => {
  return string.split('\n').length;
};
