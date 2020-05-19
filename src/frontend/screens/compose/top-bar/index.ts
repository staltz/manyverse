/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {ReactSource} from '@cycle/react';
import {ReactElement} from 'react';
import {h} from '@cycle/react';
import {StateSource} from '@cycle/state';
import {View, StyleSheet} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {t} from '../../../drivers/localization';
import {Palette} from '../../../global-styles/palette';
import {Dimensions} from '../../../global-styles/dimens';
import Button from '../../../components/Button';
import HeaderButton from '../../../components/HeaderButton';

export type State = {
  enabled: boolean;
  previewing: boolean;
  isReply: boolean;
};

export type Sources = {
  screen: ReactSource;
  state: StateSource<State>;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  back: Stream<any>;
  previewToggle: Stream<any>;
  done: Stream<any>;
};

export const styles = StyleSheet.create({
  container: {
    height: Dimensions.toolbarHeight,
    paddingTop: getStatusBarHeight(true),
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundBrand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Dimensions.horizontalSpaceBig,
  },

  buttonsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
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
    backgroundColor: Palette.backgroundBrandWeak,
    minWidth: 80,
    marginLeft: Dimensions.horizontalSpaceNormal,
  },
});

function intent(reactSource: ReactSource) {
  return {
    back$: reactSource.select('composeCloseButton').events('press'),

    previewToggle$: reactSource.select('composePreviewButton').events('press'),

    done$: reactSource.select('composePublishButton').events('press'),
  };
}

function view(state$: Stream<State>) {
  return state$.map(state =>
    h(View, {style: styles.container}, [
      h(HeaderButton, {
        sel: 'composeCloseButton',
        icon: state.isReply ? 'arrow-collapse' : 'close',
        accessibilityLabel: t(
          'compose.call_to_action.close.accessibility_label',
        ),
      }),
      h(View, {style: styles.buttonsRight}, [
        state.enabled
          ? h(HeaderButton, {
              sel: 'composePreviewButton',
              side: 'neutral',
              icon: state.previewing ? 'pencil' : 'eye',
              accessibilityLabel: t(
                'compose.call_to_action.preview.accessibility_label',
              ),
            })
          : null,
        h(Button, {
          sel: 'composePublishButton',
          style: [
            state.enabled ? styles.buttonEnabled : styles.buttonDisabled,
            state.isReply ? styles.replyButton : styles.publishButton,
          ],
          text: state.isReply
            ? t('compose.call_to_action.reply_to_thread.label')
            : t('compose.call_to_action.publish_new_thread.label'),
          strong: state.enabled,
          accessible: true,
          accessibilityLabel: state.isReply
            ? t('compose.call_to_action.reply_to_thread.accessibility_label')
            : t(
                'compose.call_to_action.publish_new_thread.accessibility_label',
              ),
        }),
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
    previewToggle: actions.previewToggle$,
    done: actions.done$,
  };
}
