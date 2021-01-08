export const isValidJson = (data) => {
  if (_isNumber(data) || _isBoolean(data)) return false;
  try {
    JSON.parse(data);
    return true;
  } catch (error) {
    return false;
  }
};

const _isNumber = (val) => {
  return !isNaN(val) && Number(val) === +val;
};

const _isBoolean = (val) => {
  return val === false || val === true || val === 'false' || val === 'true';
};

export const isJsonWithErrors = (value) => {
  return _startsLikeJson(value) && !isValidJson(value);
};

const _startsLikeJson = (value) => {
  const formattedValue = value.replace(/\s/g, '');
  return (
    (formattedValue.startsWith('{') || formattedValue.startsWith('[{')) &&
    (formattedValue.endsWith('}') || formattedValue.endsWith('}]'))
  );
};

export const minify = (json) => {
  return _formatJson(json);
};

export const prettify = (json) => {
  return _formatJson(json, 2);
};

const _formatJson = (json, spaces = 0) => {
  return JSON.stringify(JSON.parse(json), null, spaces);
};

export const isJsonPrettified = (jsonState) => {
  return jsonState === states.PRETTIFIED;
};

export const getParseErrorMessage = (value) => {
  try {
    JSON.parse(value);
  } catch (error) {
    return error.message;
  }
};

export const states = {
  DEFAULT: '',
  MINIFIED: 'minified',
  PRETTIFIED: 'prettified'
};
