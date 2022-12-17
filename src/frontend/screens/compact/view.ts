// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {h} from '@cycle/react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions as DimensAPI,
  Platform,
} from 'react-native';
import {Circle, CirclePropTypes} from 'react-native-progress';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Typography} from '~frontend/global-styles/typography';
import {globalStyles} from '~frontend/global-styles/styles';
import {t} from '~frontend/drivers/localization';
import LocalizedHumanTime from '~frontend/components/LocalizedHumanTime';
import StatusBarBrand from '~frontend/components/StatusBarBrand';
import {State} from './model';

export const styles = StyleSheet.create({
  screen: {
    ...globalStyles.screen,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.brandMain,
    ...Platform.select({
      web: {
        '-webkit-app-region': 'drag',
      },
    }),
  },

  title: {
    marginBottom: Dimensions.verticalSpaceLarger,
    fontSize: Typography.fontSizeBig,
    lineHeight: Typography.lineHeightBig,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textForBackgroundBrand,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  description: {
    marginTop: Dimensions.verticalSpaceLarger,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textForBackgroundBrand,
    fontWeight: 'normal',
    textAlign: 'center',
    ...Platform.select({
      web: {
        maxWidth: '66ex',
      },
    }),
  },
});

export default function view(state$: Stream<State>) {
  return state$
    .compose(dropRepeatsByKeys(['progress']))
    .map(({progress, estimateDone}) => {
      const win = DimensAPI.get('window');
      const size = Math.min(win.width, win.height) * 0.5;
      return h(View, {style: styles.screen}, [
        h(StatusBarBrand),
        h(Text, {style: styles.title}, t('compact.title')),
        h(
          Circle as any,
          {
            animated: true,
            progress,
            size,
            showsText: true,
            color: Palette.textForBackgroundBrand,
            unfilledColor: Palette.transparencyDarkWeak,
            fill: 'transparent',
            borderWidth: 0,
            strokeCap: 'round',
            thickness: 5,
          } as CirclePropTypes,
        ),
        estimateDone > 0
          ? h(Text, {key: `${estimateDone}`, style: styles.description}, [
              t('drawer.menu.ready_estimate.label'),
              ' ',
              h(LocalizedHumanTime, {time: Date.now() + estimateDone}),
            ])
          : h(Text, {key: 'empty', style: styles.description}, '   '),
      ]);
    });
}
