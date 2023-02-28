import { SoulDef } from '../types';

export let tealTileDef: SoulDef = {
  tags: ['bg'],
  kind: 'tile',
  collisionMask: -1,
  collisionCategory: 1,
  collisionGroup: 0,
  svgSrcForDirections: {
    default: 'teal-tile.svg'
  },
  verticesBox: { x: 0, y: 0, width: 64, height: 64 },
  vertices: [
    {
      'x': 0,
      'y': 0
    },
    {
      'x': 0,
      'y': 64
    },
    {
      'x': 64,
      'y': 64
    },
    {
      'x': 64,
      'y': 0
    }
  ]
};