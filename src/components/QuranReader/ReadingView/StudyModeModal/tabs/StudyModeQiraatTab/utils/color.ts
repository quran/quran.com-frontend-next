export const COLOR_MAP = {
  green: ['#b7d7a8', 'green'],
  pink: ['#ea9999', 'pink'],
  transparent: ['#ffffff', 'transparent'],
  blue: ['#a4c2f4', 'blue'],
  orange: ['#f5e2cd', 'orange'],
};

export function getColorClass(id: string) {
  const hexOrName = id?.toLowerCase() ?? '#ffffff';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const color = Object.entries(COLOR_MAP).find(([n, values]) => values.includes(hexOrName));
  return color?.[0] ?? 'transparent';
}
