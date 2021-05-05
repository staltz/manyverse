/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {h} from '@cycle/react';
import {Animated} from 'react-native';
import {t} from '../../../drivers/localization';
import {State} from '../model';
import {styles} from './styles';

export default function ProfileName({
  state,
  translateY,
}: {
  state: State;
  translateY: Animated.AnimatedInterpolation;
}) {
  const animStyle = {transform: [{translateY}]};

  if (!state.about.name) return null;

  return h(
    Animated.Text,
    {
      style: [styles.name, , animStyle],
      numberOfLines: 1,
      ellipsizeMode: 'middle',
      accessible: true,
      accessibilityRole: 'text',
      accessibilityLabel: t('profile.name.accessibility_label'),
    },
    state.about.name,
  );
}
