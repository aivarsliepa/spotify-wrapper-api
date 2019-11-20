export const plusSeconds = (date: Date, seconds: number) => {
  const newDate = new Date();
  newDate.setTime(date.getTime() + seconds * 1000);
  return newDate;
};
