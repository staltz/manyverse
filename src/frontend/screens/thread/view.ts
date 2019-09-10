/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';
import {h} from '@cycle/react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {ReactElement} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {propifyMethods} from 'react-propify-methods';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import FullThread from '../../components/FullThread';
import Avatar from '../../components/Avatar';
import EmptySection from '../../components/EmptySection';
import {State} from './model';
import {styles, avatarSize} from './styles';

const ReplySpacer = h(View, {style: styles.spacerInReply});

function ReplySendButton() {
  return h(
    TouchableOpacity,
    {
      sel: 'replyButton',
      style: styles.replySend,
      activeOpacity: 0.2,
      accessible: true,
      accessibilityLabel: 'Reply Publish Button',
    },
    [
      h(Icon, {
        size: Dimensions.iconSizeNormal,
        color: Palette.foregroundCTA,
        name: 'send',
      }),
    ],
  );
}

function ReplyInput(state: State) {
  return h(View, {style: styles.replyRow}, [
    h(Avatar, {
      size: avatarSize,
      url: state.avatarUrl,
      style: styles.replyAvatar,
    }),
    h(View, {style: styles.replyInputContainer}, [
      h(TextInput, {
        accessible: true,
        accessibilityLabel: 'Reply Text Input',
        sel: 'replyInput',
        multiline: true,
        autoFocus: state.startedAsReply,
        returnKeyType: 'done',
        value: state.replyText,
        editable: state.replyEditable,
        placeholder: 'Comment',
        placeholderTextColor: Palette.textVeryWeak,
        selectionColor: Palette.backgroundTextSelection,
        underlineColorAndroid: Palette.backgroundVoid,
        style: styles.replyInput,
      }),
    ]),
    state.replyText.length > 0 ? ReplySendButton() : ReplySpacer,
  ]);
}

const ReactiveScrollView = propifyMethods(ScrollView, 'scrollToEnd' as any);

type Actions = {
  publishMsg$: Stream<any>;
  willReply$: Stream<any>;
};

function statesAreEqual(s1: State, s2: State): boolean {
  if (s1.loading !== s2.loading) return false;
  if (s1.replyText !== s2.replyText) return false;
  if (s1.keyboardVisible !== s2.keyboardVisible) return false;
  if (s1.replyEditable !== s2.replyEditable) return false;
  if (s1.startedAsReply !== s2.startedAsReply) return false;
  if (s1.avatarUrl !== s2.avatarUrl) return false;
  if (s1.thread.messages.length !== s2.thread.messages.length) return false;
  if (s1.thread.full !== s2.thread.full) return false;
  if (s1.getSelfRepliesReadable !== s2.getSelfRepliesReadable) return false;
  if (s1.rootMsgId !== s2.rootMsgId) return false;
  if (s1.selfFeedId !== s2.selfFeedId) return false;
  return true;
}

export default function view(state$: Stream<State>, actions: Actions) {
  const scrollToEnd$ = actions.publishMsg$.mapTo({animated: false});
  return state$.compose(dropRepeats(statesAreEqual)).map((state: State) => {
    if (!state.loading && state.thread.errorReason === 'missing') {
      return h(View, {style: styles.container}, [
        h(EmptySection, {
          style: styles.emptySection,
          title: 'Missing data',
          description: [
            "You don't yet have data \n for the message known by the ID\n",
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
        h(EmptySection, {
          style: styles.emptySection,
          title: 'Blocked thread',
          description: 'You have chosen to block\nthe author of this thread',
        }),
      ]);
    }
    if (!state.loading && state.thread.errorReason === 'unknown') {
      return h(View, {style: styles.container}, [
        h(EmptySection, {
          style: styles.emptySection,
          title: 'Sorry',
          description:
            "This app doesn't know how to process\nand display this thread correctly",
        }),
      ]);
    }

    return h(
      KeyboardAvoidingView,
      {enabled: state.keyboardVisible, style: styles.container},
      [
        h(
          ReactiveScrollView,
          {
            style: styles.scrollView,
            scrollToEnd$,
            refreshControl: h(RefreshControl, {
              refreshing: state.thread.messages.length === 0,
              colors: [Palette.backgroundBrand],
            }),
          },
          [
            h(FullThread, {
              sel: 'thread',
              thread: state.thread,
              selfFeedId: state.selfFeedId,
              publication$: actions.willReply$,
            }),
          ],
        ),
        ReplyInput(state),
      ],
    );
  });
}
