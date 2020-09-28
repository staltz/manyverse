/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {h} from '@cycle/react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {ReactElement} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {propifyMethods} from 'react-propify-methods';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import FullThread from '../../components/FullThread';
import Avatar from '../../components/Avatar';
import EmptySection from '../../components/EmptySection';
import TopBar from '../../components/TopBar';
import {State} from './model';
import {styles, avatarSize} from './styles';
const FocusableTextInput = propifyMethods(TextInput, 'focus' as any);

function ExpandReplyButton(isLastButton: boolean) {
  return h(
    TouchableOpacity,
    {
      sel: 'reply-expand',
      style: isLastButton ? styles.lastButtonInReply : styles.buttonInReply,
      activeOpacity: 0.2,
      accessible: true,
      accessibilityRole: 'button',
      accessibilityLabel: t(
        'thread.call_to_action.expand_reply.accessibility_label',
      ),
    },
    [
      h(Icon, {
        size: Dimensions.iconSizeNormal,
        color: Palette.foregroundNeutral,
        name: 'arrow-expand',
      }),
    ],
  );
}

function ReplySendButton() {
  return h(
    TouchableOpacity,
    {
      sel: 'reply-send',
      style: styles.lastButtonInReply,
      activeOpacity: 0.2,
      accessible: true,
      accessibilityRole: 'button',
      accessibilityLabel: t(
        'thread.call_to_action.publish_reply.accessibility_label',
      ),
    },
    [
      h(Icon, {
        size: Dimensions.iconSizeNormal,
        color: Palette.textCTA,
        name: 'send',
      }),
    ],
  );
}

function ReplyInput(state: State, focus$: Stream<undefined>) {
  return h(View, {style: styles.replyRow}, [
    h(Avatar, {
      size: avatarSize,
      url: state.selfAvatarUrl,
      style: styles.replyAvatar,
    }),
    h(View, {style: styles.replyInputContainer}, [
      h(FocusableTextInput, {
        accessible: true,
        accessibilityLabel: t('thread.fields.reply.accessibility_label'),
        sel: 'reply-input',
        multiline: true,
        autoFocus: state.startedAsReply,
        focus$,
        returnKeyType: 'done',
        value: state.replyText,
        editable: state.replyEditable,
        placeholder: t('thread.fields.reply.placeholder'),
        placeholderTextColor: Palette.textVeryWeak,
        selectionColor: Palette.backgroundTextSelection,
        underlineColorAndroid: Palette.textLine,
        style: styles.replyInput,
      }),
    ]),
    ExpandReplyButton(state.replyText.length === 0),
    state.replyText.length > 0 ? ReplySendButton() : null,
  ]);
}

type Actions = {
  willReply$: Stream<any>;
  focusTextInput$: Stream<undefined>;
};

export default function view(state$: Stream<State>, actions: Actions) {
  const scrollToEnd$ = actions.willReply$.mapTo({animated: false});

  return state$
    .compose(
      dropRepeatsByKeys([
        'loading',
        'loadingReplies',
        'replyText',
        'keyboardVisible',
        'replyEditable',
        'startedAsReply',
        'getSelfRepliesReadable',
        'rootMsgId',
        'selfFeedId',
        'selfAvatarUrl',
        'lastSessionTimestamp',
        (s) => s.thread.messages.length,
        (s) => s.thread.full,
        'subthreads',
        'expandRootCW',
      ]),
    )
    .map((state) => {
      const topBar = h(TopBar, {sel: 'topbar', title: t('thread.title')});

      if (!state.loading && state.thread.errorReason === 'missing') {
        return h(View, {style: styles.container}, [
          topBar,
          h(EmptySection, {
            style: styles.emptySection,
            title: t('thread.empty.missing.title'),
            description: [
              t('thread.empty.missing.description'),
              h(
                Text,
                {style: styles.missingMsgId},
                state.rootMsgId as string,
              ) as ReactElement<any>,
            ],
          }),
        ]);
      }
      if (!state.loading && state.thread.errorReason === 'blocked') {
        return h(View, {style: styles.container}, [
          topBar,
          h(EmptySection, {
            style: styles.emptySection,
            title: t('thread.empty.blocked.title'),
            description: t('thread.empty.blocked.description'),
          }),
        ]);
      }
      if (!state.loading && state.thread.errorReason === 'unknown') {
        return h(View, {style: styles.container}, [
          topBar,
          h(EmptySection, {
            style: styles.emptySection,
            title: t('thread.empty.incompatible.title'),
            description: t('thread.empty.incompatible.description'),
          }),
        ]);
      }

      return h(View, {style: styles.container}, [
        topBar,
        h(
          KeyboardAvoidingView,
          {
            enabled: state.keyboardVisible,
            style: styles.container,
            ...Platform.select({ios: {behavior: 'padding' as const}}),
          },
          [
            h(FullThread, {
              sel: 'thread',
              thread: state.thread,
              subthreads: state.subthreads,
              lastSessionTimestamp: state.lastSessionTimestamp,
              selfFeedId: state.selfFeedId,
              expandRootCW: state.expandRootCW,
              loadingReplies: state.loadingReplies,
              scrollToEnd$,
              publication$: actions.willReply$,
            }),
            ReplyInput(state, actions.focusTextInput$),
          ],
        ),
      ]);
    });
}
