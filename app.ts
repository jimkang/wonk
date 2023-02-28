import RouteState from 'route-state';
import handleError from 'handle-error-web';
import { version } from './package.json';
import wireControls from './renderers/wire-controls';
import seedrandom from 'seedrandom';
import RandomId from '@jimkang/randomid';
import { createProbable as Probable } from 'probable';
import { renderBones } from './renderers/render-bones';
import { UpdatePositions } from './updaters/update-positions';
import { CreateFromDef } from './souls';
import { tealTileDef } from './defs/teal-tile-def';
import { Soul } from './types';

var randomId = RandomId();
var routeState;
var prob;

(async function go() {
  window.onerror = reportTopLevelError;
  renderVersion();

  routeState = RouteState({
    followRoute,
    windowObject: window,
    propsToCoerceToBool: ['skullOnly', 'showBodyBounds'],
  });
  routeState.routeFromHash();
})();

async function followRoute({
  seed,
  showBodyBounds = false,
}) {
  if (!seed) {
    routeState.addToRoute({ seed: randomId(8) });
    return;
  }

  var random = seedrandom(seed);
  prob = Probable({ random });
  var createFromDef = CreateFromDef({ seed });

  var board = document.getElementById('canvas');
  const boardWidth = +board.getAttribute('width');
  const boardHeight = +board.getAttribute('height');

  var souls: Soul[] = [];

  try {
    var tealTile: Soul = await createFromDef(tealTileDef);
    console.log(tealTile);
    souls.push(tealTile);

  } catch (error) {
    handleError(error);
  }

  var { updatePositions } = UpdatePositions({
    boardWidth,
    boardHeight,
    souls,
    prob,
  });

  wireControls({
    onReset: () => routeState.addToRoute({ seed: randomId(8) }),
    onBone,
  });

  loop();

  function loop() {
    var bodies = updatePositions();
    renderBones({
      souls,
      showBodyBounds,
    });
    requestAnimationFrame(loop);
  }

  // Do we actually need to keep track of all of the bones we added?
  function onBone() {
    // addBones({ bones: [cloneDeep(prob.pick(flatSkeleton))] });
  }
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info');
  versionInfo.textContent = version;
}
