import { Soul, SoulDef } from './types';
import cloneDeep from 'lodash.clonedeep';
import RandomId from '@jimkang/randomid';
import seedrandom from 'seedrandom';
import { getSVGPathsFromFile } from './util/svg-utils';

const baseLocation = 'static/svg';

export function CreateFromDef({ seed }) {
  var randomId = RandomId({ random: seedrandom(seed) });
  return createFromDef;

  async function createFromDef(def: SoulDef): Promise<Soul> {
    var svgsForDirections = {};
    for (let dir in def.svgSrcForDirections) {
      try {
        svgsForDirections[dir] = await getSVGPathsFromFile({
          baseLocation,
          filename: def.svgSrcForDirections[dir],
        });
      } catch (error) {
        console.error(
          `Error while trying to load ${def.svgSrcForDirections[dir]}.`
        );
      }
    }

    var soul = {
      ...cloneDeep(def) as SoulDef,
      id: `${def.kind}-${randomId(4)}`,
      svgsForDirections,
      body: null,
      destination: { x: 0, y: 0 },
      holdings: []
    };
    return soul;
  }
}
