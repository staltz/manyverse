// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {Animated, TouchableWithoutFeedback} from 'react-native';
import {isBlurhashValid} from 'blurhash';
import {t} from '~frontend/drivers/localization';
import Avatar from '~frontend/components/Avatar';
import BlurhashAvatar from '~frontend/components/BlurhashAvatar';
import {State} from '../model';
import {AVATAR_SIZE, AVATAR_SIZE_TOOLBAR, styles} from './styles';

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

export default function ProfileAvatar({
  state,
  opacity,
  transY,
  inTopBar,
}: PropsType1 | PropsType2) {
  const animStyle = inTopBar
    ? {opacity: opacity!, transform: [{translateY: transY!}]}
    : null;
  const touchableStyle = inTopBar
    ? styles.avatarTouchableInTopBar
    : styles.avatarTouchable;

  if (
    !state.about.imageUrl &&
    state.snapshot.blurhash &&
    isBlurhashValid(state.snapshot.blurhash).result
  ) {
    return h(Animated.View, {style: [touchableStyle, animStyle]}, [
      h(BlurhashAvatar, {
        blurhash: state.snapshot.blurhash,
        size: inTopBar ? AVATAR_SIZE_TOOLBAR : AVATAR_SIZE,
      }),
    ]);
  }

  return h(
    TouchableWithoutFeedback,
    {
      sel: 'avatar',
      accessible: true,
      accessibilityRole: 'image',
      accessibilityLabel: t('profile.picture.accessibility_label'),
    },
    [
      h(
        Animated.View,
        {style: [touchableStyle, animStyle], pointerEvents: 'box-only'},
        [
          h(Avatar, {
            size: inTopBar ? AVATAR_SIZE_TOOLBAR : AVATAR_SIZE,
            url: state.about.imageUrl,
            style: styles.avatar,
          }),
        ],
      ),
    ],
  );
}
