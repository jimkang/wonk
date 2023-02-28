export function pairsToXYObjects(pairs) {
  return pairs.map((pair) => ({ x: pair[0], y: pair[1] }));
}
