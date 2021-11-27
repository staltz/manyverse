// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {t} from '../../../../drivers/localization';
import {Palette} from '../../../../global-styles/palette';
import {getImg} from '../../../../global-styles/utils';
import {Props as InstructionsProps} from '../../../instructions/props';
import {State} from '../model';

export function makeInstructionsProps(state: State): InstructionsProps {
  const IMG_WIDTH = 814;
  const IMG_HEIGHT = 296;
  const ASPECT_RATIO = IMG_WIDTH / IMG_HEIGHT;
  let width = IMG_WIDTH * 0.5;
  let height = IMG_HEIGHT * 0.5;
  if (state.windowSize) {
    const portraitMode = state.windowSize.width < state.windowSize.height;
    if (portraitMode) {
      width = Math.min(state.windowSize.width * 0.8, width);
      height = Math.min((state.windowSize.width * 0.8) / ASPECT_RATIO, height);
    } else {
      width = Math.min(state.windowSize.width * 0.5, width);
      height = Math.min((state.windowSize.width * 0.5) / ASPECT_RATIO, width);
    }
  }

  const connectedNum = state.peers.filter(
    (p) => p[1].state === 'connected',
  ).length;

  return {
    title: t('connections.recommendations.follow_staged_manually'),
    content1:
      connectedNum === 0
        ? t(
            'connections.recommendation_descriptions.follow_staged_manually.part1.not_connected',
          )
        : t(
            'connections.recommendation_descriptions.follow_staged_manually.part1.connected',
          ),
    content2: t(
      'connections.recommendation_descriptions.follow_staged_manually.part2',
    ),
    image2: getImg(
      Palette.isDarkTheme
        ? require('../../../../../../images/screenshot-staged-peers-dark.png')
        : require('../../../../../../images/screenshot-staged-peers.png'),
    ),
    image2Style: {
      width,
      height,
    },
  };
}
