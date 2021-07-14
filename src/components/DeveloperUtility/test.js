// Calculate the seconds between two days
const calcSecondsBetweenDays = (day1, day2) => {
  const date1 = new Date(day1);
  const date2 = new Date(day2);
  return Math.abs(date1.getTime() - date2.getTime()) / 1000;
};

export default calcSecondsBetweenDays;
