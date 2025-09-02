const getISTDateObject = (date = new Date()) => {
  const istDateString = new Date(date).toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });

  return new Date(istDateString);
};

module.exports = getISTDateObject;
