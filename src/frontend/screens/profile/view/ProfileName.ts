// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {Animated} from 'react-native';
import {t} from '~frontend/drivers/localization';
import {displayName} from '~frontend/ssb/utils/from-ssb';
import {State} from '../model';
import {styles} from './styles';

interface PropsType1 {
  state: State;
  inTopBar: true;
  opacity: Animated.AnimatedInterpolation;
  transY: Animated.AnimatedInterpolation;
}

interface PropsType2 {
  state: State;
  inTopBar: false;
  opacity?: undefined;
  transY?: undefined;
}

export default function ProfileName({
  state,
  opacity,
  transY,
  inTopBar,
}: PropsType1 | PropsType2) {
  const animStyle = inTopBar
    ? {opacity: opacity!, transform: [{translateY: transY!}]}
    : null;

  return h(
    Animated.Text,
    {
      style: [styles.name, animStyle],
      numberOfLines: 1,
      ellipsizeMode: 'middle',
      accessible: true,
      accessibilityRole: 'text',
      accessibilityLabel: t('profile.name.accessibility_label'),
    },
    displayName(state.about.name || state.snapshot.name, state.about.id),
  );
}
