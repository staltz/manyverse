/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {Stream} from 'xstream';
import {h} from '@cycle/native-screen';
import * as Progress from 'react-native-progress';
import {View, TextInput, ScrollView, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {propifyMethods} from 'react-propify-methods';
import {isReplyPostMsg} from 'ssb-typescript/utils';
import {Screens} from '../..';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {SSBSource} from '../../drivers/ssb';
import FullThread from '../../components/FullThread';
import {State} from './model';
import {styles} from './styles';

const Loading = h(Progress.CircleSnail, {
  style: styles.loading,
  indeterminate: true,
  size: 40,
  color: Palette.brand.backgroundLighterContrast,
});

const ReplySpacer = h(View, {style: styles.spacer});

function ReplySendButton() {
  return h(TouchableOpacity, {selector: 'replyButton', style: styles.send}, [
    h(Icon, {
      size: Dimensions.iconSizeNormal,
      color: Palette.brand.callToActionForeground,
      name: 'send',
    }),
  ]);
}

function ReplyInput(state: State) {
  return h(View, {style: styles.writeMessageRow}, [
    h(View, {style: styles.writeMessageAuthorImage}),
    h(View, {style: styles.writeInputContainer}, [
      h(TextInput, {
        accessible: true,
        accessibilityLabel: 'Reply Text Input',
        selector: 'replyInput',
        multiline: true,
        autoFocus: state.startedAsReply,
        returnKeyType: 'done',
        value: state.replyText,
        editable: state.replyEditable,
        placeholder: 'Comment',
        placeholderTextColor: Palette.brand.textVeryWeak,
        selectionColor: Palette.indigo3,
        underlineColorAndroid: Palette.brand.voidBackground,
        style: styles.writeInput,
      }),
    ]),
    state.replyText.length > 0 ? ReplySendButton() : ReplySpacer,
  ]);
}

const ReactiveScrollView = propifyMethods(ScrollView, 'scrollToEnd' as any);

type Actions = {
  publishMsg$: Stream<any>;
};

export default function view(
  state$: Stream<State>,
  ssbSource: SSBSource,
  actions: Actions,
) {
  return state$.map((state: State) => {
    return {
      screen: Screens.Thread,
      vdom: h(View, {style: styles.container}, [
        h(
          ReactiveScrollView,
          {
            style: styles.scrollView,
            scrollToEnd$: actions.publishMsg$.mapTo({animated: false}),
          },
          [
            state.thread.messages.length === 0
              ? Loading
              : h(FullThread, {
                  selector: 'thread',
                  thread: state.thread,
                  selfFeedId: state.selfFeedId,
                  publication$: ssbSource.publishHook$.filter(isReplyPostMsg),
                  getPublicationsReadable: state.getSelfRepliesReadable,
                }),
          ],
        ),
        ReplyInput(state),
      ]),
    };
  });
}
