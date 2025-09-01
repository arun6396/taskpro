const getISTDateObject = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; 
  return new Date(now.getTime() + istOffset);
};


module.exports = getISTDateObject;
