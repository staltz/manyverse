/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {Platform} from 'react-native';
import {FeedId} from 'ssb-typescript';
import {t} from '../../drivers/localization';
import {DialogSource, PickerItem} from '../../drivers/dialogs';
import {Palette} from '../../global-styles/palette';
import {State} from './model';

export type ManageChoiceId =
  | 'private-chat'
  | 'block'
  | 'block-secretly'
  | 'unblock'
  | 'unblock-secretly';

export type Sources = {
  feedId$: Stream<FeedId>;
  manageContact$: Stream<State>;
  dialog: DialogSource;
};

export type Sinks = {
  goToPrivateChat$: Stream<string>;
  blockContact$: Stream<null>;
  blockSecretlyContact$: Stream<null>;
  unblockContact$: Stream<null>;
  unblockSecretlyContact$: Stream<null>;
};

type Relationship =
  | 'following'
  | 'neutral'
  | 'blocking-secretly'
  | 'blocking-publicly';

function calculateRelationship(state: State): Relationship {
  if (state.youFollow?.response) {
    return 'following';
  } else if (state.youBlock?.response) {
    if (state.youBlock.private) {
      return 'blocking-secretly';
    } else {
      return 'blocking-publicly';
    }
  } else {
    return 'neutral';
  }
}

export default function manageContact$(sources: Sources): Sinks {
  const manageContactChoice$ = sources.manageContact$
    .map((state) => {
      const isSelfProfile = state.displayFeedId === state.selfFeedId;
      const relationship = calculateRelationship(state);
      const items: Array<Omit<PickerItem, 'id'> & {id: ManageChoiceId}> = [];

      if (!isSelfProfile) {
        items.push({
          id: 'private-chat',
          label: t('profile.call_to_action.private_chat'),
        });
        if (relationship === 'neutral') {
          items.push({
            id: 'block',
            label: t('profile.call_to_action.block'),
            iosStyle: 'destructive',
          });
          items.push({
            id: 'block-secretly',
            label: t('profile.call_to_action.block_secretly'),
          });
        } else if (relationship === 'following') {
          items.push({
            id: 'block',
            label: t('profile.call_to_action.block'),
            iosStyle: 'destructive',
          });
        } else if (relationship === 'blocking-secretly') {
          items.push({
            id: 'unblock-secretly',
            label: t('profile.call_to_action.unblock_secretly'),
          });
        } else if (relationship === 'blocking-publicly') {
          items.push({
            id: 'unblock',
            label: t('profile.call_to_action.unblock'),
          });
        }
      }

      return sources.dialog
        .showPicker(
          Platform.OS === 'ios'
            ? t('profile.dialog_manage_contact.title')
            : undefined,
          undefined,
          {
            items,
            type: 'listPlain',
            contentColor: Palette.colors.comet8,
            cancelable: true,
            positiveText: '',
            negativeText: '',
            neutralText: '',
          },
        )
        .filter((res) => res.action === 'actionSelect')
        .map((res: any) => ({id: res.selectedItem.id as ManageChoiceId}));
    })
    .flatten();

  const privateChat$ = manageContactChoice$
    .filter((choice) => choice.id === 'private-chat')
    .map(() => sources.feedId$.take(1))
    .flatten();

  const blockContact$ = manageContactChoice$
    .filter((choice) => choice.id === 'block')
    .mapTo(null);

  const blockSecretlyContact$ = manageContactChoice$
    .filter((choice) => choice.id === 'block-secretly')
    .mapTo(null);

  const unblockContact$ = manageContactChoice$
    .filter((choice) => choice.id === 'unblock')
    .mapTo(null);

  const unblockSecretlyContact$ = manageContactChoice$
    .filter((choice) => choice.id === 'unblock-secretly')
    .mapTo(null);

  return {
    goToPrivateChat$: privateChat$,
    blockContact$,
    blockSecretlyContact$,
    unblockContact$,
    unblockSecretlyContact$,
  };
}
