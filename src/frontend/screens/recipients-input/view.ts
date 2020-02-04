/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {ReactElement} from 'react';
import {h} from '@cycle/react';
import {View, TextInput, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Dimensions} from '../../global-styles/dimens';
import {Palette} from '../../global-styles/palette';
import EmptySection from '../../components/EmptySection';
import AccountsListCheckMany from '../../components/AccountsListCheckMany';
import {MAX_PRIVATE_MESSAGE_RECIPIENTS} from '../../ssb/utils/constants';
import {State} from './model';
import {styles} from './styles';

export default function view(
  state$: Stream<State>,
  topBar$: Stream<ReactElement<any>>,
) {
  return xs.combine(topBar$, state$).map(([topBarVDOM, state]) =>
    h(View, {style: styles.screen}, [
      topBarVDOM,
      h(View, {style: styles.mentionsOverlay}, [
        h(View, {style: styles.mentionsInputContainer}, [
          h(Icon, {
            size: Dimensions.iconSizeNormal,
            style: styles.mentionsIcon,
            color: Palette.textVeryWeak,
            name: 'account-search',
          }),
          h(TextInput, {
            style: styles.mentionsInput,
            sel: 'mentionInput',
            value: state.mentionQuery,
            accessible: true,
            accessibilityLabel: 'Mention Account Text Input',
            placeholder: 'Search for people to add',
            multiline: false,
            returnKeyType: 'done',
            selectionColor: Palette.backgroundTextSelection,
            underlineColorAndroid: Palette.textLine,
          }),
        ]),
        h(
          ScrollView,
          {style: styles.mentionsList, keyboardShouldPersistTaps: 'always'},
          [
            h(AccountsListCheckMany, {
              sel: 'recipients',
              accounts: state.mentionSuggestions as any,
              maximumCheckable: MAX_PRIVATE_MESSAGE_RECIPIENTS,
            }),
            state.mentionSuggestions.length
              ? null
              : h(EmptySection, {
                  style: styles.empty,
                  title: 'No one',
                  description: [
                    'There is nobody in your\ncommunity with that name',
                  ],
                }),
          ],
        ),
      ]),
    ]),
  );
}
