import { SoulDef } from '../types'
export let tealTileDef: SoulDef = {
  tags: ['bg'],
  kind: 'tile',
  collisionMask: -1,
  collisionCategory: 1,
  collisionGroup: 0,
  svgSrcForDirections: {
    default: 'squirrel-facing-right.svg'
  },
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