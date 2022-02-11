// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import delay from 'xstream/extra/delay';
import pairwise from 'xstream/extra/pairwise';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {h} from '@cycle/react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {ReactElement} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import FullThread from '~frontend/components/FullThread';
import Avatar from '~frontend/components/Avatar';
import EmptySection from '~frontend/components/EmptySection';
import {
  Payload as SettablePayload,
  default as SettableTextInput,
} from '~frontend/components/SettableTextInput';
import TopBar from '~frontend/components/TopBar';
import {State} from './model';
import {styles, avatarSize} from './styles';

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
        color: Palette.textVeryWeak,
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

function ReplyInput(state: State, nativePropsAndFocus$: Stream<any>) {
  return h(View, {style: styles.replyRow}, [
    h(Avatar, {
      size: avatarSize,
      url: state.selfAvatarUrl,
      style: styles.replyAvatar,
    }),
    h(View, {style: styles.replyInputContainer}, [
      h(SettableTextInput, {
        accessible: true,
        accessibilityLabel: t('thread.fields.reply.accessibility_label'),
        sel: 'reply-input',
        multiline: true,
        nativePropsAndFocus$,
        returnKeyType: 'done',
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

interface Actions {
  willReply$: Stream<any>;
  focusTextInput$: Stream<undefined>;
  threadViewabilityChanged$: Stream<any>;
}

function initialScrollToReply$(state$: Stream<State>, actions: Actions) {
  return actions.threadViewabilityChanged$
    .take(1)
    .map(() =>
      state$
        .filter((state) => {
          const {initialScrollTo, thread} = state;
          const {messages} = thread;
          return (
            !!initialScrollTo &&
            thread.full &&
            messages.length > 0 &&
            messages[messages.length - 1].key === initialScrollTo
          );
        })
        .take(1)
        .mapTo({animated: true}),
    )
    .flatten();
}

export default function view(state$: Stream<State>, actions: Actions) {
  const didReply$ = state$
    .compose(pairwise)
    .filter(([prevState, nextState]) => {
      const prevMsgs = prevState.thread.messages;
      const nextMsgs = nextState.thread.messages;
      return (
        nextMsgs.length === prevMsgs.length + 1 &&
        nextMsgs[nextMsgs.length - 1].value.author === nextState.selfFeedId
      );
    });

  const scrollToEnd$ = xs.merge(
    initialScrollToReply$(state$, actions),
    actions.willReply$.mapTo({animated: true}).compose(delay(50)),
    didReply$.mapTo({animated: true}),
  );

  const setMarkdownInputNativeProps$ = xs.merge(
    actions.focusTextInput$.mapTo({focus: true}),

    state$
      .compose(
        dropRepeatsByKeys([
          'replyTextOverride',
          'replyTextOverrideTimestamp',
          'focusTimestamp',
        ]),
      )
      .map((s) => {
        const now = Date.now();
        const TIME_BUDGET = 500; // milliseconds
        const payload: SettablePayload = {};
        if (now < s.focusTimestamp + TIME_BUDGET) {
          payload.focus = true;
        }
        if (now < s.replyTextOverrideTimestamp + TIME_BUDGET) {
          payload.text = s.replyTextOverride;
        }
        return payload;
      }),
  );

  return state$
    .compose(
      dropRepeatsByKeys([
        'loading',
        'loadingReplies',
        'replyText',
        'keyboardVisible',
        'replyEditable',
        'getSelfRepliesReadable',
        'rootMsgId',
        'selfFeedId',
        'selfAvatarUrl',
        'lastSessionTimestamp',
        'preferredReactions',
        (s) => s.thread.messages.length,
        (s) => s.thread.full,
        'subthreads',
        'expandRootCW',
      ]),
    )
    .map((state) => {
      const topBar = h(TopBar, {sel: 'topbar', title: t('thread.title')});

      if (!state.loading && state.thread.errorReason === 'missing') {
        return h(View, {style: styles.screen}, [
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
        return h(View, {style: styles.screen}, [
          topBar,
          h(EmptySection, {
            style: styles.emptySection,
            title: t('thread.empty.blocked.title'),
            description: t('thread.empty.blocked.description'),
          }),
        ]);
      }
      if (!state.loading && state.thread.errorReason === 'unknown') {
        return h(View, {style: styles.screen}, [
          topBar,
          h(EmptySection, {
            style: styles.emptySection,
            title: t('thread.empty.incompatible.title'),
            description: t('thread.empty.incompatible.description'),
          }),
        ]);
      }

      return h(View, {style: styles.screen}, [
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
              style: styles.fullThread,
              thread: state.thread,
              subthreads: state.subthreads,
              lastSessionTimestamp: state.lastSessionTimestamp,
              preferredReactions: state.preferredReactions,
              selfFeedId: state.selfFeedId,
              expandRootCW: state.expandRootCW,
              loadingReplies: state.loadingReplies,
              scrollToEnd$,
              willPublish$: actions.willReply$,
            }),
            ReplyInput(state, setMarkdownInputNativeProps$),
          ],
        ),
      ]);
    });
}
