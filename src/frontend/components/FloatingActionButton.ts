// SPDX-FileCopyrightText: 2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {Platform, StyleSheet, View} from 'react-native';
import {
  FloatingAction,
  IFloatingActionProps,
} from 'react-native-floating-action';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
import {withTitle} from './withTitle';

const FIXED_PROPS: IFloatingActionProps = {
  iconHeight: Dimensions.iconSizeNormal,
  iconWidth: Dimensions.iconSizeNormal,
  overlayColor: Palette.transparencyDark,
  overrideWithAction: true,
};

export interface Props
  extends Pick<
      IFloatingActionProps,
      | 'color'
      | 'distanceToEdge'
      | 'floatingIcon'
      | 'overrideWithAction'
      | 'visible'
    >,
    Required<Pick<IFloatingActionProps, 'actions'>> {
  sel: string;
  title: string;
}

export function FloatingActionButton(props: Props) {
  return Platform.OS === 'web'
    ? h(
        withTitle(View),
        {style: styles.desktopFabContainer, title: props.title},
        [h(FloatingAction, {...props, ...FIXED_PROPS})],
      )
    : h(FloatingAction, {...props, ...FIXED_PROPS});
}

const styles = StyleSheet.create({
  desktopFabContainer: {
    position: 'absolute',
    bottom: 0,
    right: `calc(50vw - ${Dimensions.desktopMiddleWidth.px} * 0.5)`,
  },
});
