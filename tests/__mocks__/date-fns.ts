export const format = (date: Date | number, formatStr: string, options?: { locale?: { format: Function } }) => {
  const d = typeof date === 'number' ? new Date(date) : date;
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const es = {};
