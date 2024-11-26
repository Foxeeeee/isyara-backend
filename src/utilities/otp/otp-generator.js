export const generator = {
  otp: () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },
  expired: () => {
    return new Date(Date.now() + 2 * 6 * 10000);
  },
};
