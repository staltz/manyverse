// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {Animated} from 'react-native';
import {t} from '../../../drivers/localization';
import {State} from '../model';
import {styles} from './styles';

export default function ProfileID({
  state,
  translateY,
  inTopBar,
}: {
  state: State;
  translateY: Animated.AnimatedInterpolation;
  inTopBar: boolean;
}) {
  const animStyle = {transform: [{translateY}]};

  return h(
    Animated.Text,
    {
      style: [
        styles.feedId,
        inTopBar ? styles.feedIdInTopBar : null,
        animStyle,
      ],
      numberOfLines: 1,
      ellipsizeMode: 'tail',
      sel: 'feedId',
      accessible: true,
      accessibilityRole: 'text',
      accessibilityLabel: t('profile.details.id.accessibility_label'),
    },
    state.about.id,
  );
}
