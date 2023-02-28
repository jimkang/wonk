import { Engine, Body, Composite } from 'matter-js';
import { createWalls } from './create-walls';
import { Soul } from '../types';

export function UpdatePositions({
  fps = 60,
  boardWidth,
  boardHeight,
  groundThickness = 60,
  wallThickness = 60,
  souls,
  prob,
}) {
  var engine = Engine.create({ gravity: { x: 0, y: 0, scale: 0 } });
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
  var boneBoxes = souls.map(createBodyForSoul);
  Composite.add(engine.world, boneBoxes);

  return { updatePositions, addBones };

  function addBones({ bones }) {
    var boneBoxes = bones.map(createBodyForSoul);
    Composite.add(engine.world, boneBoxes);
  }

  function updatePositions() {
    Engine.update(engine, 1000 / fps);
    return Composite.allBodies(engine.world);
  }

  function createBodyForSoul(soul: Soul) {
    const x = prob.roll(boardWidth);
    const y = prob.roll(boardHeight / 4);
    var bodyOpts = {
      angle: 0,
      label: soul.id,
      restitution: 1.25,
      slop: 16,
      density: 1.25,
      // force gets reset to 0, 0 after an update.
      force: { x: 0, y: 100 },
    };

    if (soul.vertices) {
      soul.body = Body.create(
        Object.assign(
          {
            vertices: soul.vertices,
            position: { x, y },
          },
          bodyOpts
        )
      );
      return soul.body;
    }
    throw new Error('Missing vertices.');
  }
}
