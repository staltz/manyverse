// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import debounce from 'xstream/extra/debounce';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {h} from '@cycle/react';
import {ReactElement} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions as DimensAPI,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const byteSize = require('byte-size').default;
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Typography} from '~frontend/global-styles/typography';
import {globalStyles} from '~frontend/global-styles/styles';
import {IconNames} from '~frontend/global-styles/icons';
import {t} from '~frontend/drivers/localization';
import LocalizedHumanTime from '~frontend/components/LocalizedHumanTime';
import Button from '~frontend/components/Button';
import TopBar from '~frontend/components/TopBar';
import ProgressBar from '~frontend/components/ProgressBar';
import {State} from './model';

export const styles = StyleSheet.create({
  screen: {
    ...globalStyles.screen,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.brandMain,
  },

  scroll: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'column',
    backgroundColor: Palette.brandMain,
  },

  contentContainerWeb: {
    flex: 1,
    alignSelf: 'center',
    flexDirection: 'column',
    backgroundColor: Palette.brandMain,
    width: Dimensions.desktopMiddleWidth.px,
  },

  page: {
    flexDirection: 'column',
    alignSelf: 'stretch',
    justifyContent: 'center',
    paddingBottom: Dimensions.toolbarHeight,
    backgroundColor: Palette.brandMain,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
  },

  topBar: {
    alignSelf: 'center',
  },

  title: {
    marginBottom: Dimensions.verticalSpaceBig,
    fontSize: Typography.fontSizeBig,
    lineHeight: Typography.lineHeightBig,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textForBackgroundBrand,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  progressBar: {
    backgroundColor: Palette.brandStrong,
    borderRadius: Dimensions.borderRadiusSmall,
  },

  underProgressBar: {
    marginTop: Dimensions.verticalSpaceLarger,
    height: Dimensions.verticalSpaceHuge,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  timeEstimate: {
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

  // buttonContainer: {
  //   alignSelf: 'center',
  // },

  button: {
    borderColor: Palette.colors.white,
  },

  buttonText: {
    color: Palette.colors.white,
  },

  scrollMore: {
    position: 'absolute',
    bottom: Dimensions.verticalSpaceBig,
    left: 0,
    right: 0,
    alignItems: 'center',
    flexDirection: 'column',
  },

  scrollMoreText: {
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeakForBackgroundBrand,
    fontWeight: 'normal',
    textAlign: 'center',
  },

  longDescription: {
    marginTop: Dimensions.verticalSpaceLarger,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textForBackgroundBrand,
    fontWeight: 'normal',
    textAlign: 'left',
    ...Platform.select({
      web: {
        maxWidth: '66ex',
      },
    }),
  },
});

function pageHeight(win: {width: number; height: number}) {
  return win.height - Dimensions.toolbarHeight;
}

function StatusPage({
  win,
  combinedProgress,
  estimateProgressDone,
  logSize,
}: {
  win: {width: number; height: number};
  combinedProgress: number;
  estimateProgressDone: number;
  logSize: number;
}) {
  const progress = (combinedProgress * 100).toFixed(2);

  return h(
    View,
    {key: 'page1', style: [styles.page, {height: pageHeight(win)}]},
    [
      h(
        Text,
        {style: styles.title, selectable: false},
        t('indexing.title', {progress}),
      ),
      h(ProgressBar, {
        style: styles.progressBar,
        progress: combinedProgress,
        theme: 'blank',
        disappearAt100: false,
        appearAnimation: false,
        width:
          Platform.OS === 'web'
            ? '100%'
            : win.width - 2 * Dimensions.horizontalSpaceBig,
        height: 10,
      }),

      h(View, {style: styles.underProgressBar}, [
        combinedProgress < 1 && estimateProgressDone > 0
          ? h(
              Text,
              {
                key: `${estimateProgressDone}`,
                style: styles.timeEstimate,
                selectable: false,
              },
              [
                t('drawer.menu.ready_estimate.label'),
                ' ',
                h(LocalizedHumanTime, {
                  time: Date.now() + estimateProgressDone,
                }),
              ],
            )
          : null,

        combinedProgress >= 1
          ? h(Button, {
              sel: 'extraBack',
              style: styles.button,
              textStyle: styles.buttonText,
              text: t('call_to_action.go_back.label'),
              strong: false,
              accessible: true,
              accessibilityLabel: t(
                'call_to_action.go_back.accessibility_label',
              ),
            })
          : null,
      ]),

      logSize > 0
        ? h(View, {key: 'sm', style: styles.scrollMore}, [
            h(
              Text,
              {style: styles.scrollMoreText, selectable: false},
              t('call_to_action.read_more'),
            ),
            h(Icon, {
              name: IconNames.scrollToSeeMore,
              selectable: false,
              size: Dimensions.iconSizeHuge,
              color: Palette.textWeakForBackgroundBrand,
            }),
          ])
        : null,
    ],
  );
}

function InfoPage({
  win,
  logSize,
}: {
  win: {width: number; height: number};
  logSize: number;
}) {
  return h(
    View,
    {key: 'page2', style: [styles.page, {height: pageHeight(win)}]},
    [
      h(Text, {key: 'a', style: styles.title}, t('indexing.info.title')),
      h(
        Text,
        {key: 'b', style: styles.longDescription},
        t('indexing.info.description', {bytes: byteSize(logSize).toString()}),
      ),
    ],
  );
}

export default function view(state$: Stream<State>) {
  let topBar: ReactElement | null = null;

  return state$
    .compose(debounce(16)) // avoid quick re-renders
    .compose(
      dropRepeatsByKeys([
        'logSize',
        'combinedProgress',
        'estimateProgressDone',
      ]),
    )
    .map(({logSize, combinedProgress, estimateProgressDone}) => {
      const win = DimensAPI.get('window');

      if (!topBar) {
        // Hack to avoid rerendering the top bar (which would cause glitches
        // when hovering on the Back Button)
        topBar = h(TopBar, {
          sel: 'topbar',
          style: styles.topBar,
          theme: 'brand',
        });
      }

      const snapToOffsets = Platform.select({
        web: undefined,
        default:
          logSize > 0 ? [0, pageHeight(win), 2 * pageHeight(win)] : undefined,
      });

      return h(View, {style: styles.screen}, [
        topBar,

        h(
          ScrollView,
          {
            style: [styles.scroll, {maxHeight: pageHeight(win)}],
            contentContainerStyle: Platform.select({
              web: styles.contentContainerWeb,
              default: null,
            }),
            snapToOffsets,
          },
          [
            h(StatusPage, {
              win,
              combinedProgress,
              estimateProgressDone,
              logSize,
            }),

            logSize > 0 ? h(InfoPage, {win, logSize}) : null,
          ],
        ),
      ]);
    });
}
