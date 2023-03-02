import { SoulDefMap } from '../../types';
import { tealTileDef } from '../teal-tile-def';
import { range } from 'd3-array';

export var exampleBGMap: SoulDefMap = range(10)
  .map((i) =>
    range(10).map((j) => ({
      def: tealTileDef,
      pos: {
        x: (i + 0.5) * tealTileDef.verticesBox.width,
        y: (j + 0.5) * tealTileDef.verticesBox.height,
      },
    }))
  )
  .flat();
