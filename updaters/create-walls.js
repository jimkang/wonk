import { Bodies, Composite } from 'matter-js';
import { range } from 'd3-array';

export function createWalls({
  wallThickness,
  boardHeight,
  boardWidth,
  groundThickness,
  engine,
  prob,
  containerVariance = 0.5,
}) {
  const baseContainerWidth = Math.min(boardWidth, 500);
  const baseContainerHeight = Math.min(boardHeight, 500);

  var containers = range(3).map(() =>
    createContainer({
      center: { x: prob.roll(boardWidth), y: prob.roll(boardHeight) },
      width: baseContainerWidth * getVariation(containerVariance),
      height: baseContainerHeight * getVariation(containerVariance),
    })
  );
  containers.push(
    createContainer({
      center: { x: boardWidth / 2, y: boardHeight / 2 },
      width: baseContainerWidth,
      height: baseContainerHeight,
    })
  );

  // add all of the bodies to the world
  Composite.add(engine.world, containers.flat());

  function createContainer({ center, width, height }) {
    var wallA = Bodies.rectangle(
      wallThickness / 2 + center.x - width / 2,
      center.y,
      wallThickness,
      height,
      {
        isStatic: true,
        label: 'wall',
      }
    );
    var wallB = Bodies.rectangle(
      width - wallThickness / 2 + center.x - width / 2,
      center.y,
      wallThickness,
      height,
      {
        isStatic: true,
        label: 'wall',
      }
    );
    var bottom = Bodies.rectangle(
      center.x,
      height - groundThickness / 2 + center.y - height / 2,
      width,
      groundThickness,
      { isStatic: true, label: 'wall' }
    );
    return [wallA, wallB, bottom];
  }

  function getVariation(variance) {
    return 1.0 + ((variance * prob.roll(100)) / 100) * prob.roll(2) === 0
      ? -1
      : 1;
  }
}
