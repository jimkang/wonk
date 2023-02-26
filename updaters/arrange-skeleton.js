import cloneDeep from 'lodash.clonedeep';

export function arrangeSkeleton({
  boardWidth,
  boardHeight,
  skeletonInfo,
  prob,
  useExtraParts = false,
  maxBonesPerSet = 12,
  numberOfSetsToUse = 1,
  maxTries = 3,
  minimumNumberOfBones = 7,
  partExtension = '.svg',
}) {
  var scaleX = boardWidth / skeletonInfo.canvasWidth;
  var scaleY = boardHeight / skeletonInfo.canvasHeight;
  var scale = scaleX;
  if (scaleY < scale) {
    scale = scaleY;
  }

  var tries = 0;
  var center = [boardWidth / 2, boardHeight / 2];
  let boneCount;
  let rootBone;
  let flatSkeleton;

  do {
    let singleSkeletonSet = prob.shuffle(skeletonInfo.bones).map(scaleBoneSrc);
    // The "deep" properties will only be copied by reference, but
    // that should be OK for now.
    let unusedBoneSrcs = singleSkeletonSet.slice(0, maxBonesPerSet);
    if (useExtraParts) {
      numberOfSetsToUse += 1;
    }

    for (var i = 1; i < numberOfSetsToUse; ++i) {
      unusedBoneSrcs = unusedBoneSrcs.concat(
        prob.sample(singleSkeletonSet, prob.roll(singleSkeletonSet.length))
      );
    }

    rootBone = connectNewBoneToParent(unusedBoneSrcs.pop());
    let nodesWithOpenConnectors = [rootBone];
    flatSkeleton = [rootBone];

    // TODO: Put in a generator so it can yield.
    while (unusedBoneSrcs.length > 0 && nodesWithOpenConnectors.length > 0) {
      let parentConnectorIndex = prob.roll(nodesWithOpenConnectors.length);
      let parentNode = nodesWithOpenConnectors[parentConnectorIndex];
      let node = connectNewBoneToParent(unusedBoneSrcs.pop(), parentNode);
      flatSkeleton.push(node);
      // TODO: Omit reference to parentNode?

      if (parentNode.openConnectors.length < 1) {
        removeItem(nodesWithOpenConnectors, parentConnectorIndex);
      }
      if (node.openConnectors.length > 0) {
        nodesWithOpenConnectors.push(node);
      }

      //if (renderSpecs.length > 1) {
      //  // If we've just connected a bone to the center starting point,
      //  // then we can use this connect again.
      //  connectors.splice(connectorIndex, 1);
      //}
    }
    tries += 1;
    boneCount = countTreeNodes(0, rootBone);
    console.log('tries:', tries, 'bone count:', boneCount);
  } while (tries < maxTries && boneCount < minimumNumberOfBones);

  return { skeleton: rootBone, flatSkeleton };

  function scaleBoneSrc(bone) {
    var scaled = Object.assign({}, bone);
    scaled.connectors = bone.connectors.map(scalePoint);
    scaled.imageWidth = bone.imageWidth * scale;
    scaled.imageHeight = bone.imageHeight * scale;
    return scaled;
  }

  function scalePoint(point) {
    return [point[0] * scale, point[1] * scale];
  }

  function connectNewBoneToParent(src, parent) {
    let connectors = cloneDeep(src.connectors);
    let fixPoint = center;
    let connector;

    if (parent) {
      let connectorIndex = prob.roll(connectors.length);
      connector = connectors[connectorIndex];

      let fixPointIndex = prob.roll(parent.openConnectors.length);
      fixPoint = parent.openConnectors[fixPointIndex];

      removeItem(parent.openConnectors, fixPointIndex);
      removeItem(connectors, connectorIndex);
    }

    const rotationAngle = prob.roll(360);
    const rotationCenterX = fixPoint[0];
    const rotationCenterY = fixPoint[1];

    var newNode = {
      src,
      imageURL: `${skeletonInfo.baseLocation}${src.id}.${partExtension}`,
      rotationAngle,
      direction: prob.roll(2) === 0 ? -1 : 1,
      msPerRotation: (2 + prob.rollDie(20)) * 1000,
      shouldReverseDirection: prob.pickFromArray([
        shouldReverseNever,
        shouldReverseSeldom,
        shouldReverseOften,
      ]),
      rotateCount: prob.roll(2) === 0 ? 'indefinite' : prob.rollDie(20),
      rotationCenterX,
      rotationCenterY,
      translateX: connector ? fixPoint[0] - connector[0] : center[0],
      translateY: connector ? fixPoint[1] - connector[1] : center[1],
      openConnectors: connectors,
      children: [],
    };

    if (parent) {
      parent.children.push(newNode);
    }
    return newNode;
  }

  function shouldReverseNever() {
    return false;
  }

  function shouldReverseSeldom() {
    return prob.roll(800) === 0;
  }

  function shouldReverseOften() {
    return prob.roll(16) === 0;
  }
}

function removeItem(array, index) {
  return array.splice(index, 1);
}

function countTreeNodes(sum, node) {
  if (node.children.length > 0) {
    return sum + node.children.reduce(countTreeNodes, sum + 1);
  } else {
    return sum + 1;
  }
}
