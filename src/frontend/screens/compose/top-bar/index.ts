// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {ReactSource} from '@cycle/react';
import {ReactElement} from 'react';
import {h} from '@cycle/react';
import {StateSource} from '@cycle/state';
import {View, StyleSheet, Platform} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {t} from '../../../drivers/localization';
import {Palette} from '../../../global-styles/palette';
import {Dimensions} from '../../../global-styles/dimens';
import Button from '../../../components/Button';
import HeaderButton from '../../../components/HeaderButton';

export interface State {
  enabled: boolean;
  previewing: boolean;
  isReply: boolean;
}

export interface Sources {
  screen: ReactSource;
  state: StateSource<State>;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  back: Stream<any>;
  done: Stream<any>;
}

export const styles = StyleSheet.create({
  container: {
    height: Dimensions.toolbarHeight,
    paddingTop: getStatusBarHeight(true),
    alignSelf: 'stretch',
    backgroundColor: Palette.brandMain,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  innerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    ...Platform.select({
      web: {
        maxWidth: Dimensions.desktopMiddleWidth.vw,
      },
    }),
  },

  buttonsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  previewButton: {
    minWidth: 80,
  },

  publishButton: {
    minWidth: 80,
  },

  replyButton: {
    minWidth: 68,
  },

  buttonEnabled: {
    backgroundColor: Palette.backgroundCTA,
    minWidth: 80,
    marginLeft: Dimensions.horizontalSpaceNormal,
  },

  buttonDisabled: {
    backgroundColor: Palette.brandWeak,
    minWidth: 80,
    marginLeft: Dimensions.horizontalSpaceNormal,
  },
});

function intent(reactSource: ReactSource) {
  return {
    back$: reactSource.select('composeCloseButton').events('press'),
    done$: reactSource.select('composeDoneButton').events('press'),
  };
}

function view(state$: Stream<State>) {
  return state$.map((state) =>
    h(View, {style: styles.container}, [
      h(View, {style: styles.innerContainer}, [
        h(HeaderButton, {
          sel: 'composeCloseButton',
          icon: state.previewing
            ? 'pencil'
            : state.isReply
            ? 'arrow-collapse'
            : Platform.OS === 'ios'
            ? 'chevron-left'
            : 'arrow-left',
          ...Platform.select({
            ios:
              !state.previewing && !state.isReply
                ? {iconSize: Dimensions.iconSizeLarge}
                : undefined,
          }),
          accessibilityLabel: t(
            'compose.call_to_action.close.accessibility_label',
          ),
        }),
        h(View, {style: styles.buttonsRight}, [
          h(Button, {
            sel: 'composeDoneButton',
            style: [
              state.enabled ? styles.buttonEnabled : styles.buttonDisabled,
              !state.previewing
                ? styles.previewButton
                : state.isReply
                ? styles.replyButton
                : styles.publishButton,
            ],
            text: !state.previewing
              ? t('compose.call_to_action.preview.label')
              : state.isReply
              ? t('compose.call_to_action.reply_to_thread.label')
              : t('compose.call_to_action.publish_new_thread.label'),
            strong: state.enabled,
            accessible: true,
            accessibilityLabel: !state.previewing
              ? t('compose.call_to_action.preview.accessibility_label')
              : state.isReply
              ? t('compose.call_to_action.reply_to_thread.accessibility_label')
              : t(
                  'compose.call_to_action.publish_new_thread.accessibility_label',
                ),
          }),
        ]),
      ]),
    ]),
  );
}

export function topBar(sources: Sources): Sinks {
  const actions = intent(sources.screen);
  const vdom$ = view(sources.state.stream);

  return {
    screen: vdom$,
    back: actions.back$,
    done: actions.done$,
  };
}
