const getISTDateObject = () => {
  const dateInIST = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  return new Date(dateInIST);
};

module.exports = getISTDateObject;
