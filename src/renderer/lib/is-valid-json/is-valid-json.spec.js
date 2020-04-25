import isValidJson from './is-valid-json';

describe('#isValidJson', () => {
  it('should return true when string is a valid JSON', () => {
    expect(isValidJson('{"addressee": "Luke", "message": "I am your father", "response": "Noooo!"}')).to.be.true;
  });

  it('should return false when string is not a valid JSON', () => {
    expect(isValidJson('Noooo!')).to.be.false;
  });
});
