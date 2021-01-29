export const isValidJson = (data) => {
  if (!_looksLikeJson(data)) return false;
  try {
    JSON.parse(data);
    return true;
  } catch (error) {
    return false;
  }
};

export const isJsonWithErrors = (value) => {
  return _looksLikeJson(value) && !isValidJson(value);
};

const _looksLikeJson = (value) => {
  const valueWithoutSpaces = value.toString().replace(/\s/g, '');
  return (
    (valueWithoutSpaces.startsWith('{') && valueWithoutSpaces.endsWith('}')) ||
    (valueWithoutSpaces.startsWith('[') && valueWithoutSpaces.endsWith(']'))
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

export const isJsonMinified = (jsonString) => {
  return jsonString.split('\n').length === 1;
};

export const getParseErrorMessage = (value) => {
  try {
    JSON.parse(value);
  } catch (error) {
    return error.message;
  }
};
