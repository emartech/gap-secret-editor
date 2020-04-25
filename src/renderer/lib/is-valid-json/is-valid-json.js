export default data => {
  try {
    JSON.parse(data);
    return true;
  } catch (error) {
    return false;
  }
};
