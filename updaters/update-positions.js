import { Engine, Body, Composite } from 'matter-js';
import { createWalls } from './create-walls';

export function UpdatePositions({
  fps = 60,
  boardWidth,
  boardHeight,
  groundThickness = 60,
  wallThickness = 60,
  flatSkeleton,
  prob,
}) {
  var engine = new Engine.create({ gravity: { x: 0, y: 2 } });
  // create two walls and a ground
  createWalls({
    wallThickness,
    boardHeight,
    boardWidth,
    groundThickness,
    engine,
    prob,
  });

  // Make boxes for the bones.
  var boneBoxes = flatSkeleton.map(boxForBone);
  Composite.add(engine.world, boneBoxes);

  return { updatePositions, addBones };

  function addBones({ bones }) {
    var boneBoxes = bones.map(boxForBone);
    Composite.add(engine.world, boneBoxes);
  }

  function updatePositions() {
    Engine.update(engine, 1000 / fps);
    return Composite.allBodies(engine.world);
  }

  function boxForBone(bone) {
    const x = prob.roll(boardWidth);
    const y = prob.roll(boardHeight / 4);
    var bodyOpts = {
      angle: bone.rotationAngle,
      label: bone.id,
      restitution: 1.25,
      slop: 16,
      density: 1.25,
      // force gets reset to 0, 0 after an update.
      force: { x: 0, y: 100 },
    };

    if (bone.vertices) {
      return Body.create(
        Object.assign(
          {
            vertices: bone.vertices.map((pt) => ({ x: pt[0], y: pt[1] })),
            position: { x, y },
          },
          bodyOpts
        )
      );
    }
    throw new Error('Missing vertices.');
  }
}
