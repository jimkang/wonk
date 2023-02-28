export function getPathsFromSVG({ svgNode, discardTransforms }): SVGPathElement[] {
  var paths = Array.from(svgNode.querySelectorAll('path')) as SVGPathElement[];
  if (discardTransforms) {
    paths.forEach((path) => path.removeAttribute('transform'));
  }
  return paths;
}

export async function getSVGPathsFromFile({ baseLocation, filename }): Promise<SVGPathElement[]> {
  const imageURL = `${baseLocation}/${filename}`;
  try {
    let res = await fetch(imageURL);
    let text = await res.text();
    let parser = new window.DOMParser();
    let root = parser.parseFromString(text, 'image/svg+xml');
    return getPathsFromSVG({
      svgNode: root,
      discardTransforms: false,
    });
  } catch (error) {
    console.error(`Could not get SVG root for ${filename}.`, error);
  }
}