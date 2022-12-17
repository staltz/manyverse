// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import debounce from 'xstream/extra/debounce';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {h} from '@cycle/react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Typography} from '~frontend/global-styles/typography';
import tutorialSlide from '~frontend/components/tutorial-slide';
import Button from '~frontend/components/Button';
import StatusBarBlank from '~frontend/components/StatusBarBlank';
import {Circle, CirclePropTypes} from 'react-native-progress';
import {State} from './model';
import tutorialPresentation from '~frontend/components/tutorial-presentation';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.brandMain,
    flexDirection: 'column',
    ...Platform.select({
      web: {
        '-webkit-app-region': 'drag',
      },
    }),
  },

  bold: {
    fontWeight: 'bold',
  },

  button1: {
    borderColor: Palette.colors.white,
    marginBottom: Dimensions.verticalSpaceBig,
  },

  button2: {
    borderColor: Palette.colors.white,
    ...Platform.select({
      web: {},
      default: {
        marginBottom: 62,
      },
    }),
  },

  buttonText: {
    color: Palette.colors.white,
  },

  progressContainer: {
    paddingHorizontal: Dimensions.horizontalSpaceNormal,
    paddingVertical: Dimensions.verticalSpaceNormal,
    flexDirection: 'column',
    alignItems: 'center',
  },

  progressTitle: {
    marginBottom: Dimensions.verticalSpaceNormal,
    fontSize: Typography.fontSizeBig,
    lineHeight: Typography.lineHeightBig,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textForBackgroundBrand,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  progressDescription: {
    marginBottom: Dimensions.verticalSpaceBig,
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

function bold(innerText: string) {
  return h(Text, {style: styles.bold}, innerText);
}

function NotConnected(props: unknown) {
  return tutorialPresentation('swiper', {showDots: false}, [
    tutorialSlide({
      show: true,
      portraitMode: false,
      title: t('resync.introduction.title'),
      renderDescription: () => [
        t('resync.introduction.description.1_normal'),
        bold(t('resync.introduction.description.2_bold')),
        t('resync.introduction.description.3_normal'),
        bold(t('resync.introduction.description.4_bold')),
        t('resync.introduction.description.5_normal'),
      ],
      renderBottom: () => [
        h(Button, {
          sel: 'connect-via-wifi',
          style: styles.button1,
          textStyle: styles.buttonText,
          text: t('resync.buttons.connect_via_wifi'),
          strong: false,
          accessible: true,
        }),
        h(Button, {
          sel: 'paste-invite',
          style: styles.button2,
          textStyle: styles.buttonText,
          text: t('resync.buttons.paste_invite'),
          strong: false,
          accessible: true,
        }),
      ],
    }),
  ]);
}

function Connected({
  megabytes,
  progressToSkip,
}: {
  megabytes: string;
  progressToSkip: number;
}) {
  return h(View, {style: styles.progressContainer}, [
    h(Text, {style: styles.progressTitle}, [
      t('resync.progress.title', {megabytes}),
    ]),
    h(Text, {style: styles.progressDescription}, [
      t('resync.progress.description'),
    ]),
    h(
      Circle as any,
      {
        animated: true,
        progress: progressToSkip,
        size: Dimensions.iconSizeHuge,
        showsText: false,
        color: Palette.textForBackgroundBrand,
        unfilledColor: Palette.transparencyDarkWeak,
        fill: 'transparent',
        borderWidth: 0,
        strokeCap: 'round',
        thickness: 5,
        style: {
          opacity: Math.min(1, progressToSkip / 0.25),
        },
      } as CirclePropTypes,
    ),
  ]);
}

export default function view(state$: Stream<State>) {
  return state$
    .compose(debounce(16)) // avoid quick re-renders
    .compose(
      dropRepeatsByKeys(['logSize', 'progressToSkip', 'connectedToSomeone']),
    )
    .map((state) =>
      h(View, {style: styles.screen}, [
        h(StatusBarBlank),
        !state.connectedToSomeone
          ? h(NotConnected)
          : h(Connected, {
              megabytes:
                state.logSize <= 0
                  ? '0.00 MB'
                  : Math.max(0.01, state.logSize * 1e-6).toFixed(2) + ' MB',
              progressToSkip: state.progressToSkip,
            }),
      ]),
    );
}
