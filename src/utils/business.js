// Datos del local que se muestran en varias páginas.
// weekdays: 0 = domingo ... 6 = sábado. ranges: [apertura, cierre] en horas.
export const BUSINESS_HOURS = [
  { days: "Lunes a sábado", weekdays: [1, 2, 3, 4, 5, 6], ranges: [[9, 13], [17, 21]] },
  { days: "Domingos", weekdays: [0], ranges: [[9, 13]] },
];

export const formatRange = ([opens, closes]) => `${opens}:00 a ${closes}:00`;

const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

// Se calcula con la hora de Argentina, sin importar la zona horaria del visitante
export const isOpenNow = (date = new Date()) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Argentina/Buenos_Aires",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map(({ type, value }) => [type, value])
  );

  const weekday = WEEKDAY_INDEX[parts.weekday];
  const time = Number(parts.hour) + Number(parts.minute) / 60;

  return BUSINESS_HOURS.some(
    ({ weekdays, ranges }) =>
      weekdays.includes(weekday) && ranges.some(([opens, closes]) => time >= opens && time < closes)
  );
};
