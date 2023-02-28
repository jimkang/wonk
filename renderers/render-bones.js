import accessor from 'accessor';

import { select } from 'd3-selection';
import { zoom as Zoom } from 'd3-zoom';

var boneRoot = select('#bone-root');
var wallRoot = select('#wall-root');
var diagnosticsRoot = select('#diagnostics-root');
var board = select('#canvas');
var zoomLayer = board.select('#zoom-layer');
var zoom = Zoom().scaleExtent([0.125, 8]).on('zoom', zoomed);
board.call(zoom);

function zoomed(zoomEvent) {
  zoomLayer.attr('transform', zoomEvent.transform);
}

export function renderBones({
  bodies,
  svgPathsForBones,
  skeletonInfo,
  showBodyBounds,
}) {
  //console.log(bodies.map((body) => body.vertices));
  if (showBodyBounds) {
    renderBounds({ bodies });
  }
  renderWalls({ bodies: bodies.filter((body) => body.label === 'wall') });

  var bones = boneRoot
    .selectAll('.bone')
    .data(bodies.filter((body) => body.label in svgPathsForBones, accessor()));
  bones.exit().remove();
  var newBones = bones
    .enter()
    .append('g')
    .attr('class', (body) => 'bone ' + body.label);
  newBones.each(appendPaths);

  newBones
    .merge(bones)
    //.attr('transform-origin', getTransformOrigin)
    .attr('transform', getTransform);

  function getTransform(body) {
    const angleDegrees = (body.angle / (2 * Math.PI)) * 360;
    //if (body.label === 'back-bone') {
    //console.log('bbox', bbox);
    //}
    var boneInfo = skeletonInfo.bones.find((bone) => bone.id === body.label);
    if (!boneInfo) {
      throw new Error(`No boneInfo for ${body.label}.`);
    }

    // body.position is the center of the body.
    // Additionally, you can't assume that the vertices and
    // the svg share the same center.
    // Everything that goes into the translate command has to be pre-rotation.
    // Find the where the corner of the body would be if it weren't rotated.
    const bodyCornerX = body.position.x - boneInfo.verticesWidth / 2;
    const bodyCornerY = body.position.y - boneInfo.verticesHeight / 2;
    // Find where the representation's corner should be by using verticesOffset
    // and the body's corner.
    const translateString = `translate(${
      bodyCornerX - boneInfo.verticesOffset.x
    }, ${bodyCornerY - boneInfo.verticesOffset.y})`;
    const rotationString = `rotate(${angleDegrees}, ${body.position.x}, ${body.position.y})`;
    // The last command in the transform string goes first. Translate to the
    // destination, then rotate.
    return `${rotationString} ${translateString}`;
  }

  function appendPaths({ label }) {
    // cloneNode is necessary because appending it here will remove it from its
    // source tree.
    svgPathsForBones[label].forEach((path) =>
      this.appendChild(path.cloneNode())
    );
  }
}

function renderBounds({ bodies }) {
  var edges = bodies.map((body) => verticesToEdges(body.vertices)).flat();
  var lines = diagnosticsRoot.selectAll('line').data(edges);
  lines.exit().remove();
  lines
    .enter()
    .append('line')
    .attr('stroke', 'hsl(120, 50%, 50%)')
    .merge(lines)
    .attr('x1', (edge) => edge.x1)
    .attr('y1', (edge) => edge.y1)
    .attr('x2', (edge) => edge.x2)
    .attr('y2', (edge) => edge.y2);

  var dots = diagnosticsRoot.selectAll('circle').data(bodies);
  dots.exit().remove();
  dots
    .enter()
    .append('circle')
    .attr('r', 4)
    .attr('fill', 'hsl(150, 50%, 50%)')
    .merge(dots)
    .attr('cx', (body) => body.position.x)
    .attr('cy', (body) => body.position.y);
}

function verticesToEdges(vertices) {
  var edges = [];
  for (let i = 0; i < vertices.length - 1; ++i) {
    edges.push({
      x1: vertices[i].x,
      y1: vertices[i].y,
      x2: vertices[i + 1].x,
      y2: vertices[i + 1].y,
    });
  }
  if (edges.length > 2) {
    let lastEdge = edges[edges.length - 1];
    let firstEdge = edges[0];
    edges.push({
      x1: lastEdge.x2,
      y1: lastEdge.y2,
      x2: firstEdge.x1,
      y2: firstEdge.y1,
    });
    return edges;
  }
}

function renderWalls({ bodies }) {
  var walls = wallRoot.selectAll('polygon').data(bodies);
  walls.exit().remove();
  walls
    .enter()
    .append('polygon')
    .attr('fill', 'hsl(30, 10%, 70%)')
    .merge(walls)
    .attr('points', (body) => verticesToPolygonPoints(body.vertices));
}

function verticesToPolygonPoints(vertices) {
  return vertices.map((v) => v.x + ',' + v.y).join(' ');
}
