export const upKeys = (o: Object) => {
  const keys = Object.keys(o);
  const n: any = {};
  for (let key of keys) n[key.toUpperCase()] = o[key];
  return n;
};

export const upValues = (o: Object) => {
  const keys = Object.keys(o);
  const n: any = {};
  for (let key of keys) n[key] = o[key].toUpperCase();
  return n;
};

export const arrayToMap = (arr: any[]) => {
  return arr.reduce((map, element) => {
    map.set(element.name, element);
    return map;
  }, new Map());
};
