// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

interface Required {
  default: string;
}

function get(img1x: Required, img2x?: Required, img3x?: Required) {
  const DIST_FOLDER = 'renderer-dist/';
  if (window.devicePixelRatio > 2) {
    return DIST_FOLDER + (img3x ?? img2x ?? img1x).default;
  } else if (window.devicePixelRatio > 1) {
    return DIST_FOLDER + (img2x ?? img1x).default;
  } else {
    return DIST_FOLDER + img1x.default;
  }
}

export const Images = {
  emptyAvatar: get(require('~images/empty-avatar.png')),
  imageArea256: get(require('~images/image-area-256.png')),
  imageArea256Dark: get(require('~images/image-area-256-dark.png')),
  calendar256: get(require('~images/calendar-256.png')),
  calendar256Dark: get(require('~images/calendar-256-dark.png')),
  nounGlassware: get(
    require('~images/noun-glassware.png'),
    require('~images/noun-glassware@2x.png'),
    require('~images/noun-glassware@3x.png'),
  ),
  nounButterfly: get(
    require('~images/noun-butterfly.png'),
    require('~images/noun-butterfly@2x.png'),
    require('~images/noun-butterfly@3x.png'),
  ),
  nounBooks: get(
    require('~images/noun-books.png'),
    require('~images/noun-books@2x.png'),
    require('~images/noun-books@3x.png'),
  ),
  nounCamping: get(
    require('~images/noun-camping.png'),
    require('~images/noun-camping@2x.png'),
    require('~images/noun-camping@3x.png'),
  ),
  nounFish: get(
    require('~images/noun-fish.png'),
    require('~images/noun-fish@2x.png'),
    require('~images/noun-fish@3x.png'),
  ),
  nounFarm: get(
    require('~images/noun-farm.png'),
    require('~images/noun-farm@2x.png'),
    require('~images/noun-farm@3x.png'),
  ),
  nounRoots: get(
    require('~images/noun-roots.png'),
    require('~images/noun-roots@2x.png'),
    require('~images/noun-roots@3x.png'),
  ),
  nounWheelbarrow: get(
    require('~images/noun-wheelbarrow.png'),
    require('~images/noun-wheelbarrow@2x.png'),
    require('~images/noun-wheelbarrow@3x.png'),
  ),
  nounFlower: get(
    require('~images/noun-flower.png'),
    require('~images/noun-flower@2x.png'),
    require('~images/noun-flower@3x.png'),
  ),
  nounFingerprint: get(
    require('~images/noun-fingerprint.png'),
    require('~images/noun-fingerprint@2x.png'),
    require('~images/noun-fingerprint@3x.png'),
  ),
  nounBee: get(
    require('~images/noun-bee.png'),
    require('~images/noun-bee@2x.png'),
    require('~images/noun-bee@3x.png'),
  ),
  nounSun: get(
    require('~images/noun-sun.png'),
    require('~images/noun-sun@2x.png'),
    require('~images/noun-sun@3x.png'),
  ),
  nounPlant: get(
    require('~images/noun-plant.png'),
    require('~images/noun-plant@2x.png'),
    require('~images/noun-plant@3x.png'),
  ),
  nounLantern: get(
    require('~images/noun-lantern.png'),
    require('~images/noun-lantern@2x.png'),
    require('~images/noun-lantern@3x.png'),
  ),
  nounCrops: get(
    require('~images/noun-crops.png'),
    require('~images/noun-crops@2x.png'),
    require('~images/noun-crops@3x.png'),
  ),
  plusNetwork: get(
    require('~images/plus-network.png'),
    require('~images/plus-network@2x.png'),
    require('~images/plus-network@3x.png'),
  ),
  screenshotStagedPeers: get(require('~images/screenshot-staged-peers.png')),
  screenshotStagedPeersDark: get(
    require('~images/screenshot-staged-peers-dark.png'),
  ),
  messagePlus: get(
    require('~images/message-plus.png'),
    require('~images/message-plus@2x.png'),
    require('~images/message-plus@3x.png'),
  ),
  pencil: get(
    require('~images/pencil.png'),
    require('~images/pencil@2x.png'),
    require('~images/pencil@3x.png'),
  ),
  appLogo24: get(
    require('~images/app-logo-24.png'),
    require('~images/app-logo-24@2x.png'),
  ),
  appLogo30: get(
    require('~images/app-logo-30.png'),
    require('~images/app-logo-30@2x.png'),
    require('~images/app-logo-30@3x.png'),
  ),
  logoOutline: get(require('~images/logo_outline.png')),
  packageDown: get(
    require('~images/package-down.png'),
    require('~images/package-down@2x.png'),
    require('~images/package-down@3x.png'),
  ),
};
