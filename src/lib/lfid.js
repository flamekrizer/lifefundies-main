export const generateLFID = () => {
  return "LF-" + Date.now().toString().slice(-6);
};