// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Platform} from 'react-native';
import {FeedId} from 'ssb-typescript';
import {t} from '~frontend/drivers/localization';
import {DialogSource, PickerItem} from '~frontend/drivers/dialogs';
import {Palette} from '~frontend/global-styles/palette';
import {SSBFriendsQueryDetails} from '~frontend/ssb/types';
import {SSBSource} from '~frontend/drivers/ssb';

export type ManageChoiceId =
  | 'block'
  | 'block-secretly'
  | 'unblock'
  | 'unblock-secretly';

export interface Sources {
  manageContact$: Stream<{feedId: FeedId; selfFeedId: FeedId}>;
  ssb: SSBSource;
  dialog: DialogSource;
}

export interface Sinks {
  blockContact$: Stream<FeedId>;
  blockSecretlyContact$: Stream<FeedId>;
  unblockContact$: Stream<FeedId>;
  unblockSecretlyContact$: Stream<FeedId>;
}

export interface State {
  youFollow: SSBFriendsQueryDetails | null;
  youBlock: SSBFriendsQueryDetails | null;
  feedId: FeedId;
  selfFeedId: FeedId;
}

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
    .map(({feedId, selfFeedId}) =>
      xs
        .combine(
          sources.ssb.isFollowing$(selfFeedId, feedId),
          sources.ssb.isBlocking$(selfFeedId, feedId),
        )
        .map(([youFollow, youBlock]) => ({
          youFollow,
          youBlock,
          feedId,
          selfFeedId,
        })),
    )
    .flatten()
    .map((state) => {
      const relationship = calculateRelationship(state);
      const items: Array<Omit<PickerItem, 'id'> & {id: ManageChoiceId}> = [];

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

      return sources.dialog
        .showPicker(
          Platform.OS === 'ios'
            ? t('profile.dialog_manage_contact.title')
            : undefined,
          undefined,
          {
            items,
            type: 'listPlain',
            ...Palette.listDialogColors,
            cancelable: true,
            positiveText: '',
            negativeText: '',
            neutralText: '',
          },
        )
        .filter((res) => res.action === 'actionSelect')
        .map((res: any) => ({
          id: res.selectedItem.id as ManageChoiceId,
          feedId: state.feedId,
        }));
    })
    .flatten();

  const blockContact$ = manageContactChoice$
    .filter((choice) => choice.id === 'block')
    .map((choice) => choice.feedId);

  const blockSecretlyContact$ = manageContactChoice$
    .filter((choice) => choice.id === 'block-secretly')
    .map((choice) => choice.feedId);

  const unblockContact$ = manageContactChoice$
    .filter((choice) => choice.id === 'unblock')
    .map((choice) => choice.feedId);

  const unblockSecretlyContact$ = manageContactChoice$
    .filter((choice) => choice.id === 'unblock-secretly')
    .map((choice) => choice.feedId);

  return {
    blockContact$,
    blockSecretlyContact$,
    unblockContact$,
    unblockSecretlyContact$,
  };
}
