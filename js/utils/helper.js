export const qs = name => {
  return document.querySelector(name);
};

export const degreesToRadians = degrees => {
  return (degrees * Math.PI) / 180;
};

export const getRandomInt = ({ min, max }) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};
