
export const objectToKeyValueArray = object => {
  const tuples = Object.entries(object);
  return tuples.map(([key, value]) => ({ key, value }));
};

export const keyValueArrayToObject = keyValueArray => {
  const tuples = keyValueArray.map(({ key, value }) => ([key, value]));
  return Object.fromEntries(tuples);
};
