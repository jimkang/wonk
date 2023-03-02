import accessor from 'accessor';

import { select } from 'd3-selection';
import { zoom as Zoom } from 'd3-zoom';

var depictionRoot = select('#bone-root');
var diagnosticsRoot = select('#diagnostics-root');
var board = select('#canvas');
var zoomLayer = board.select('#zoom-layer');
var zoom = Zoom().scaleExtent([0.125, 8]).on('zoom', zoomed);
board.call(zoom);

function zoomed(zoomEvent) {
  zoomLayer.attr('transform', zoomEvent.transform);
}

export function renderBones({ souls, showBodyBounds }) {
  //console.log(bodies.map((body) => body.vertices));
  if (showBodyBounds) {
    renderBounds({ bodies: souls.map((soul) => soul.body) });
  }
  // TODO: Move this out.
  //renderWalls({ bodies: bodies.filter((body) => body.label === 'wall') });

  var depictions = depictionRoot
    .selectAll('.depiction')
    .data(souls, accessor());
  depictions.exit().remove();
  var newDepictions = depictions
    .enter()
    .append('g')
    .attr('class', (soul) => `depiction ${soul.id}`);
  newDepictions.each(appendPaths);

  newDepictions
    .merge(depictions)
    //.attr('transform-origin', getTransformOrigin)
    .attr('transform', getTransform);

  function getTransform(soul) {
    const angleDegrees = (soul.body.angle / (2 * Math.PI)) * 360;
    //if (body.label === 'back-bone') {
    //console.log('bbox', bbox);
    //}

    // body.position is the center of the body.
    // Additionally, you can't assume that the vertices and
    // the svg share the same center.
    // Everything that goes into the translate command has to be pre-rotation.
    // Find the where the corner of the body would be if it weren't rotated.
    const bodyCornerX = soul.body.position.x - soul.verticesBox.width / 2;
    const bodyCornerY = soul.body.position.y - soul.verticesBox.height / 2;
    // Find where the representation's corner should be by using verticesOffset
    // and the body's corner.
    const translateString = `translate(${bodyCornerX - soul.verticesBox.x}, ${
      bodyCornerY - soul.verticesBox.y
    })`;
    const rotationString = `rotate(${angleDegrees}, ${soul.body.position.x}, ${soul.body.position.y})`;
    const scaleString = isNaN(soul.svgScale) ? '' : `scale(${soul.svgScale})`;
    // The last command in the transform string goes first. Scale, then translate to the
    // destination, then rotate.
    return `${rotationString} ${translateString} ${scaleString}`;
  }

  function appendPaths(soul) {
    // cloneNode is necessary because appending it here will remove it from its
    // source tree.
    // TODO: Instead using default, check which direction the soul is facing and use the appropriate paths for that direction.
    soul.svgsForDirections.default.forEach((path) =>
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
