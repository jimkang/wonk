import RouteState from 'route-state';
import handleError from 'handle-error-web';
import { version } from './package.json';
import wireControls from './renderers/wire-controls';
import seedrandom from 'seedrandom';
import RandomId from '@jimkang/randomid';
import { createProbable as Probable } from 'probable';
import { renderBones } from './renderers/render-bones';
import { UpdatePositions } from './updaters/update-positions';
import skeletonInfo from './data/skeleton.json';
import { getPathsFromSVG } from './util/get-paths-from-svg';
import cloneDeep from 'lodash.clonedeep';

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
  skullOnly = false,
  showBodyBounds = false,
}) {
  if (!seed) {
    routeState.addToRoute({ seed: randomId(8) });
    return;
  }

  var random = seedrandom(seed);
  prob = Probable({ random });

  var board = document.getElementById('bone-canvas');
  const boardWidth = +board.getAttribute('width');
  const boardHeight = +board.getAttribute('height');

  var flatSkeleton = skeletonInfo.bones
    .filter((src) => src.vertices)
    .map((src) => Object.assign({}, { rotationAngle: prob.roll(360) }, src));

  console.log(flatSkeleton);

  var svgPathsForBones = await getSVGPathsForBones({
    flatSkeleton,
    skeletonInfo,
  });

  if (skullOnly) {
    flatSkeleton = [flatSkeleton.find((bone) => bone.id === 'head-bone')];
    if (!flatSkeleton[0]) {
      throw new Error('No skeleton.');
    }
  }

  var { updatePositions, addBones } = UpdatePositions({
    boardWidth,
    boardHeight,
    flatSkeleton,
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
      bodies,
      svgPathsForBones,
      skeletonInfo,
      showBodyBounds,
    });
    requestAnimationFrame(loop);
  }

  // Do we actually need to keep track of all of the bones we added?
  function onBone() {
    addBones({ bones: [cloneDeep(prob.pick(flatSkeleton))] });
  }
}

async function getSVGPathsForBones({ flatSkeleton, skeletonInfo }) {
  var dict = {};
  var uniqueBoneIds = flatSkeleton
    .map((node) => node.id)
    .reduce((ids, id) => (ids.includes(id) ? ids : ids.concat([id])), []);

  await Promise.all(uniqueBoneIds.map(addSVGRootForBone));
  return dict;

  async function addSVGRootForBone(id) {
    const imageURL = `${skeletonInfo.baseLocation}${id}.svg`;
    try {
      let res = await fetch(imageURL);
      let text = await res.text();
      let parser = new window.DOMParser();
      let root = parser.parseFromString(text, 'image/svg+xml');
      dict[id] = getPathsFromSVG({
        svgNode: root,
        discardTransforms: false,
        normalize: false, // This is important.
      });
    } catch (error) {
      console.error(`Could not get SVG root for ${id}.`, error);
    }
  }
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info');
  versionInfo.textContent = version;
}
