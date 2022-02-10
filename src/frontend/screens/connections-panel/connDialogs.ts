// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {Platform} from 'react-native';
import {DialogSource, PickerItem} from '~frontend/drivers/dialogs';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';
import {State} from './model';

export type MenuChoice =
  | 'open-profile'
  | 'connect'
  | 'disconnect'
  | 'disconnect-forget'
  | 'forget'
  | 'manage-aliases'
  | 'room-sign-in'
  | 'room-share-invite'
  | 'invite-info'
  | 'invite-note'
  | 'invite-share'
  | 'invite-delete';

function createConnMenuOptions(targetPeer: any): Array<PickerItem> {
  const options = [
    {
      id: 'open-profile',
      label: t('connections.menu.open_profile.label'),
    },
    {
      id: 'disconnect',
      label: t('connections.menu.disconnect.label'),
    },
  ];

  if (targetPeer?.[1]?.isInDB) {
    options.push({
      id: 'disconnect-forget',
      label: t('connections.menu.disconnect_forget.label'),
    });
  }

  return options;
}

function createRoomMenuOptions(targetPeer: any): Array<PickerItem> {
  const options: Array<PickerItem> = [];
  const data = targetPeer?.[1];

  if (data?.openInvites) {
    options.push({
      id: 'room-share-invite',
      label: t('connections.menu.room_share_invite.label'),
    });
  }

  if (data?.supportsHttpAuth) {
    options.push({
      id: 'room-sign-in',
      label: t('connections.menu.room_sign_in.label'),
    });
  }

  if (data?.membership && data?.name && data?.supportsAliases) {
    options.push({
      id: 'manage-aliases',
      label: t('connections.menu.manage_aliases.label'),
    });
  }

  options.push({
    id: 'disconnect',
    label: t('connections.menu.disconnect.label'),
  });

  options.push({
    id: 'disconnect-forget',
    label: t('connections.menu.disconnect_forget.label'),
  });

  return options;
}

function createInviteMenuOptions(): Array<PickerItem> {
  return [
    {
      id: 'invite-info',
      label: t('connections.menu.invite_info.label'),
    },
    {
      id: 'invite-note',
      label: t('connections.menu.invite_note.label'),
    },
    {
      id: 'invite-share',
      label: t('connections.menu.invite_share.label'),
    },
    {
      id: 'invite-delete',
      label: t('connections.menu.invite_delete.label'),
    },
  ];
}

function createStagingMenuOptions(): Array<PickerItem> {
  return [
    {
      id: 'open-profile',
      label: t('connections.menu.open_profile.label'),
    },
    {
      id: 'connect',
      label: t('connections.menu.connect.label'),
    },
  ];
}

function createStagedRoomMenuOptions(): Array<PickerItem> {
  return [
    {
      id: 'room-share-invite',
      label: t('connections.menu.room_share_invite.label'),
    },
    {
      id: 'connect',
      label: t('connections.menu.connect.label'),
    },
    {
      id: 'forget',
      label: t('connections.menu.forget.label'),
    },
  ];
}

let stagingMenuOptions: Array<PickerItem> | undefined;
let stagedRoomMenuOptions: Array<PickerItem> | undefined;
let inviteMenuOptions: Array<PickerItem> | undefined;

export default function connDialogs(
  dialogSource: DialogSource,
  state$: Stream<State>,
) {
  const connDialog$ = state$
    .map((x) => {
      // These options could have been created at module `require` time,
      // but that would be a problem to fetch the localization strings t()
      // BEFORE localization has had time to load up. So we're fetching the
      // localization strings once, at the first time this menu renders.
      // Subsequent menu renders don't refetch the strings nor recreate options.
      if (!inviteMenuOptions) {
        inviteMenuOptions = createInviteMenuOptions();
      }
      if (!stagingMenuOptions) {
        stagingMenuOptions = createStagingMenuOptions();
      }
      if (!stagedRoomMenuOptions) {
        stagedRoomMenuOptions = createStagedRoomMenuOptions();
      }

      return x;
    })
    .compose(dropRepeatsByKeys(['itemMenu']))
    .map((props) => props.itemMenu)
    .filter((menu) => menu.opened)
    .map(({type, target}) => {
      const items =
        type === 'conn'
          ? createConnMenuOptions(target)
          : type === 'room'
          ? createRoomMenuOptions(target)
          : type === 'staging'
          ? stagingMenuOptions
          : type === 'staged-room'
          ? stagedRoomMenuOptions
          : type === 'invite'
          ? inviteMenuOptions
          : [];

      return dialogSource
        .showPicker(
          Platform.OS === 'ios'
            ? t('connections.menu.dialog_title')
            : undefined,
          undefined,
          {
            items: items ?? [],
            type: 'listPlain',
            ...Palette.listDialogColors,
            cancelable: true,
            positiveText: '',
            negativeText: '',
            neutralText: '',
          },
        )
        .filter((res) => res.action === 'actionSelect')
        .map((res: any) => res.selectedItem.id as MenuChoice);
    })
    .flatten();

  return {
    connDialog$,
  };
}
