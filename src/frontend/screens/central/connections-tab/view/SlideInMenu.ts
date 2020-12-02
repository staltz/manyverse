/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {h} from '@cycle/react';
import * as React from 'react';
import {View, Text} from 'react-native';
import {
  Menu,
  MenuOptions,
  MenuOption as _MenuOption,
  MenuOptionProps,
  MenuTrigger,
  renderers,
} from 'react-native-popup-menu';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Dimensions} from '../../../../global-styles/dimens';
import {Palette} from '../../../../global-styles/palette';
import {t} from '../../../../drivers/localization';
import {State} from '../model';
import {styles} from './styles';

export type MenuChoice =
  | 'open-profile'
  | 'connect'
  | 'follow-connect'
  | 'disconnect'
  | 'disconnect-forget'
  | 'forget'
  | 'room-share-invite'
  | 'invite-info'
  | 'invite-note'
  | 'invite-share'
  | 'invite-delete';

const MenuOption: React.ComponentClass<
  MenuOptionProps & {
    value: MenuChoice;
  }
> = _MenuOption as any;

type MenuOptionContentProps = {
  icon: string;
  text: string;
  accessibilityLabel?: string;
};

class MenuOptionContent extends React.PureComponent<MenuOptionContentProps> {
  public render() {
    const {icon, text, accessibilityLabel} = this.props;

    return h(
      View,
      {
        accessible: true,
        accessibilityLabel,
        accessibilityRole: 'menuitem',
        style: styles.menuOptionContent,
      },
      [
        h(Icon, {
          size: Dimensions.iconSizeNormal,
          color: Palette.text,
          name: icon,
        }),
        h(Text, {style: styles.menuOptionContentText}, text),
      ],
    );
  }
}

/**
 * This does nothing in runtime, but exists just to make sure that TypeScript
 * will check for the specific values of `MenuChoice` as opposed to allowing any
 * string.
 * TODO remove this once TypeScript gets smarter
 */
function menuChoice(m: MenuChoice): MenuChoice {
  return m;
}

function createConnMenuOptions(targetPeer: any) {
  const options = [
    h(MenuOption, {
      value: menuChoice('open-profile'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'account-circle',
        text: t('connections.menu.open_profile.label'),
        accessibilityLabel: t(
          'connections.menu.open_profile.accessibility_label.connected',
        ),
      }),
    }),
    h(MenuOption, {
      value: menuChoice('disconnect'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'pipe-disconnected',
        text: t('connections.menu.disconnect.label'),
        accessibilityLabel: t(
          'connections.menu.disconnect.accessibility_label.peer',
        ),
      }),
    }),
  ];

  if (targetPeer?.[1]?.isInDB) {
    options.push(
      h(MenuOption, {
        value: menuChoice('disconnect-forget'),
        ['children' as any]: h(MenuOptionContent, {
          icon: 'delete',
          text: t('connections.menu.disconnect_forget.label'),
          accessibilityLabel: t(
            'connections.menu.disconnect_forget.accessibility_label.peer',
          ),
        }),
      }),
    );
  }

  return options;
}

function createStagedRoomMenuOptions() {
  return [
    h(MenuOption, {
      value: menuChoice('room-share-invite'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'content-copy',
        text: t('connections.menu.room_share_invite.label'),
        accessibilityLabel: t(
          'connections.menu.room_share_invite.accessibility_label',
        ),
      }),
    }),
    h(MenuOption, {
      value: menuChoice('connect'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'pipe',
        text: t('connections.menu.connect.label'),
        accessibilityLabel: t(
          'connections.menu.connect.accessibility_label.staged_room',
        ),
      }),
    }),
    h(MenuOption, {
      value: menuChoice('forget'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'delete',
        text: t('connections.menu.forget.label'),
        accessibilityLabel: t(
          'connections.menu.forget.accessibility_label.room',
        ),
      }),
    }),
  ];
}

function createRoomMenuOptions() {
  return [
    h(MenuOption, {
      value: menuChoice('room-share-invite'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'content-copy',
        text: t('connections.menu.room_share_invite.label'),
        accessibilityLabel: t(
          'connections.menu.room_share_invite.accessibility_label',
        ),
      }),
    }),
    h(MenuOption, {
      value: menuChoice('disconnect'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'pipe-disconnected',
        text: t('connections.menu.disconnect.label'),
        accessibilityLabel: t(
          'connections.menu.disconnect.accessibility_label.room',
        ),
      }),
    }),
    h(MenuOption, {
      value: menuChoice('disconnect-forget'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'delete',
        text: t('connections.menu.disconnect_forget.label'),
        accessibilityLabel: t(
          'connections.menu.disconnect_forget.accessibility_label.room',
        ),
      }),
    }),
  ];
}

function createStagingMenuOptions() {
  return [
    h(MenuOption, {
      value: menuChoice('open-profile'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'account-circle',
        text: t('connections.menu.open_profile.label'),
        accessibilityLabel: t(
          'connections.menu.open_profile.accessibility_label.staged',
        ),
      }),
    }),
    h(MenuOption, {
      value: menuChoice('connect'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'pipe',
        text: t('connections.menu.connect.label'),
        accessibilityLabel: t(
          'connections.menu.connect.accessibility_label.staged_peer',
        ),
      }),
    }),
    h(MenuOption, {
      value: menuChoice('follow-connect'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'account-plus',
        text: t('connections.menu.follow_connect.label'),
        accessibilityLabel: t(
          'connections.menu.follow_connect.accessibility_label',
        ),
      }),
    }),
  ];
}

function createInviteMenuOptions() {
  return [
    h(MenuOption, {
      value: menuChoice('invite-info'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'information',
        text: t('connections.menu.invite_info.label'),
        accessibilityLabel: t(
          'connections.menu.invite_info.accessibility_label',
        ),
      }),
    }),
    h(MenuOption, {
      value: menuChoice('invite-note'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'pencil',
        text: t('connections.menu.invite_note.label'),
        accessibilityLabel: t(
          'connections.menu.invite_note.accessibility_label',
        ),
      }),
    }),
    h(MenuOption, {
      value: menuChoice('invite-share'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'share',
        text: t('connections.menu.invite_share.label'),
        accessibilityLabel: t(
          'connections.menu.invite_share.accessibility_label',
        ),
      }),
    }),
    h(MenuOption, {
      value: menuChoice('invite-delete'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'delete',
        text: t('connections.menu.invite_delete.label'),
        accessibilityLabel: t(
          'connections.menu.invite_delete.accessibility_label',
        ),
      }),
    }),
  ];
}

let roomMenuOptions: Array<React.ReactElement<any>> | undefined;
let stagingMenuOptions: Array<React.ReactElement<any>> | undefined;
let stagedRoomMenuOptions: Array<React.ReactElement<any>> | undefined;
let inviteMenuOptions: Array<React.ReactElement<any>> | undefined;

export default class SlideInMenu extends React.Component<
  Pick<State, 'itemMenu'>
> {
  public shouldComponentUpdate(nextProps: SlideInMenu['props']) {
    const prevItemMenu = this.props.itemMenu;
    const nextItemMenu = nextProps.itemMenu;

    // Don't update while it's remaining closed
    if (nextItemMenu.opened === false && prevItemMenu.opened === false) {
      return false;
    }

    if (nextItemMenu.opened !== prevItemMenu.opened) return true;
    if (nextItemMenu.type !== prevItemMenu.type) return true;
    if (!!nextItemMenu.target !== !!prevItemMenu.target) return true;
    if (nextItemMenu.target?.[0] !== prevItemMenu.target?.[0]) return true;
    return false;
  }

  public render() {
    const {itemMenu} = this.props;
    const {type, target, opened} = itemMenu;

    // These options could have been created at module `require` time,
    // but that would be a problem to fetch the localization strings t()
    // BEFORE localization has had time to load up. So we're fetching the
    // localization strings once, at the first time this menu renders.
    // Subsequent menu renders don't refetch the strings nor recreate options.
    if (!inviteMenuOptions) {
      inviteMenuOptions = createInviteMenuOptions();
    }
    if (!roomMenuOptions) {
      roomMenuOptions = createRoomMenuOptions();
    }
    if (!stagingMenuOptions) {
      stagingMenuOptions = createStagingMenuOptions();
    }
    if (!stagedRoomMenuOptions) {
      stagedRoomMenuOptions = createStagedRoomMenuOptions();
    }

    return h(
      Menu,
      {
        sel: 'slide-in-menu',
        renderer: renderers.SlideInMenu,
        opened,
      },
      [
        h(MenuTrigger, {disabled: true}),
        h(
          MenuOptions,
          type === 'conn'
            ? createConnMenuOptions(target)
            : type === 'room'
            ? roomMenuOptions
            : type === 'staging'
            ? stagingMenuOptions
            : type === 'staged-room'
            ? stagedRoomMenuOptions
            : type === 'invite'
            ? inviteMenuOptions
            : [],
        ),
      ],
    );
  }
}
