// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {Animated, TouchableOpacity, View} from 'react-native';
import TopBar from '~frontend/components/TopBar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';
import {IconNames} from '~frontend/global-styles/icons';
import {Dimensions} from '~frontend/global-styles/dimens';
import {State} from '../model';
import ProfileAvatar from './ProfileAvatar';
import ProfileID from './ProfileID';
import ProfileName from './ProfileName';
import {styles} from './styles';
import ConnectionDot from './ConnectionDot';

export default function ProfileTopBar({
  state,
  isSelfProfile,
  opacity,
  transY,
}: {
  state: State;
  isSelfProfile: boolean;
  opacity: Animated.AnimatedInterpolation;
  transY: Animated.AnimatedInterpolation;
}) {
  const commonProps = {state, opacity, transY, inTopBar: true as const};

  return h(
    TopBar,
    {sel: 'topbar', style: styles.topBar, smallerIOSBackButton: true},
    [
      // This spacer exists to stretch the innerContainer of the topBar
      h(View, {style: styles.topBarSpacer}),

      h(ProfileAvatar, commonProps),
      state.connection ? h(ConnectionDot, commonProps) : null,

      h(View, {style: styles.nameContainer}, [
        h(ProfileName, commonProps),
        h(ProfileID, commonProps),
      ]),

      isSelfProfile
        ? null
        : h(
            TouchableOpacity,
            {
              sel: 'manage',
              accessible: true,
              accessibilityRole: 'button',
              accessibilityLabel: t(
                'profile.call_to_action.manage.accessibility_label',
              ),
            },
            [
              h(Icon, {
                size: Dimensions.iconSizeNormal,
                color: Palette.textWeak,
                name: IconNames.etcDropdown,
              }),
            ],
          ),
    ],
  );
}
