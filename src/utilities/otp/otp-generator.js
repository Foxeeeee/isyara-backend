export const generatorOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const expiredAt = () => {
  return new Date(Date.now() + 2 * 6 * 10000);
};
