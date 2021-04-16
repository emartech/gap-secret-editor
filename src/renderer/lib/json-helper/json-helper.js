import prettier from 'prettier/standalone';
import babelParser from 'prettier/parser-babel';

export const isValidJson = (data) => {
  if (!looksLikeJson(data)) return false;
  try {
    JSON.parse(data);
    return true;
  } catch (error) {
    return false;
  }
};

export const isJsonWithErrors = (value) => {
  return looksLikeJson(value) && !isValidJson(value);
};

export const looksLikeJson = (value) => {
  const valueWithoutSpaces = value.toString().replace(/\s/g, '');
  return (
    (valueWithoutSpaces.startsWith('{') && valueWithoutSpaces.endsWith('}')) ||
    (valueWithoutSpaces.startsWith('[') && valueWithoutSpaces.endsWith(']'))
  );
};

export const minify = (json) => {
  return JSON.stringify(JSON.parse(json));
};

export const prettify = (json) => {
  return prettier
    .format(json, { parser: 'json', printWidth: 80, plugins: [babelParser] })
    .slice(0, -1);
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
