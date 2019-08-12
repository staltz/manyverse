/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {h} from '@cycle/react';
import * as React from 'react';
import {
  Menu,
  MenuOptions,
  MenuOption as _MenuOption,
  MenuOptionProps,
  MenuTrigger,
  renderers,
} from 'react-native-popup-menu';
import {styles} from './styles';
import {State} from '../model';
import {View, Text} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Dimensions} from '../../../../global-styles/dimens';
import {Palette} from '../../../../global-styles/palette';

export type MenuChoice =
  | 'open-profile'
  | 'connect'
  | 'follow-connect'
  | 'disconnect'
  | 'disconnect-forget'
  | 'invite-info'
  | 'invite-note'
  | 'invite-share'
  | 'invite-delete';

const MenuOption: React.ComponentClass<
  MenuOptionProps & {value: MenuChoice}
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
        style: styles.menuOptionContent,
      },
      [
        h(Icon, {
          size: Dimensions.iconSizeNormal,
          color: Palette.textWeak,
          name: icon,
        }),
        h(Text, {style: styles.menuOptionContentText}, text),
      ],
    );
  }
}

function menuChoice(m: MenuChoice): MenuChoice {
  return m;
}

function connMenuOptions(targetPeer: any) {
  const options = [
    h(MenuOption, {
      value: menuChoice('open-profile'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'account-circle',
        text: 'Open profile',
        accessibilityLabel: 'Open profile screen for this connected peer',
      }),
    }),
    h(MenuOption, {
      value: menuChoice('disconnect'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'pipe-disconnected',
        text: 'Disconnect',
        accessibilityLabel: 'Disconnect from this peer',
      }),
    }),
  ];

  if (targetPeer && targetPeer[1] && targetPeer[1].isInDB) {
    options.push(
      h(MenuOption, {
        value: menuChoice('disconnect-forget'),
        ['children' as any]: h(MenuOptionContent, {
          icon: 'delete',
          text: 'Disconnect and forget',
          accessibilityLabel:
            'Disconnect from this peer and remove it from our database',
        }),
      }),
    );
  }

  return options;
}

function stagingMenuOptions() {
  return [
    h(MenuOption, {
      value: menuChoice('open-profile'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'account-circle',
        text: 'Open profile',
        accessibilityLabel: 'Open profile screen for this suggested connection',
      }),
    }),
    h(MenuOption, {
      value: menuChoice('connect'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'pipe',
        text: 'Connect',
        accessibilityLabel: 'Connect to this suggested peer',
      }),
    }),
    h(MenuOption, {
      value: menuChoice('follow-connect'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'account-plus',
        text: 'Connect and follow',
        accessibilityLabel: 'Connect to this suggested peer then follow them',
      }),
    }),
  ];
}

function inviteMenuOptions() {
  return [
    h(MenuOption, {
      value: menuChoice('invite-info'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'information',
        text: 'About',
        accessibilityLabel: 'About this Invite Code',
      }),
    }),
    h(MenuOption, {
      value: menuChoice('invite-note'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'pencil',
        text: 'Add note',
        accessibilityLabel: 'Add Note',
      }),
    }),
    h(MenuOption, {
      value: menuChoice('invite-share'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'share',
        text: 'Share',
        accessibilityLabel: 'Share Invite Code',
      }),
    }),
    h(MenuOption, {
      value: menuChoice('invite-delete'),
      ['children' as any]: h(MenuOptionContent, {
        icon: 'delete',
        text: 'Delete',
        accessibilityLabel: 'Delete Invite Code',
      }),
    }),
  ];
}

export default function SlideInMenu(state: State) {
  const {itemMenu} = state;
  const {type, target, opened} = itemMenu;
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
          ? connMenuOptions(target)
          : type === 'staging'
          ? stagingMenuOptions()
          : type === 'invite'
          ? inviteMenuOptions()
          : [],
      ),
    ],
  );
}
