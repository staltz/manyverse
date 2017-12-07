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

import {Component, createElement} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {h} from '@cycle/native-screen';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
import MessageContainer from './MessageContainer';
import {ContactContent as Contact} from '../../ssb/types';
import {authorName, shortFeedId, humanTime} from '../../ssb/utils';
import {MsgAndExtras} from '../../drivers/ssb';
import {
  MutantAttachable,
  attachMutant,
  detachMutant,
} from '../lifecycle/MutantAttachable';
import {
  PeriodicRendering,
  attachPeriodicRendering,
  detachPeriodicRendering,
} from '../lifecycle/PeriodicRendering';
import {MutantWatch} from '../../typings/mutant';
const {watch}: {watch: MutantWatch} = require('mutant');

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flex: 1,
  },

  account: {
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    maxWidth: 120,
    color: Palette.brand.textWeak,
  },

  followed: {
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.textWeak,
  },

  timestamp: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.textWeak,
  },
});

export type Props = {
  msg: MsgAndExtras<Contact>;
};

export type State = {
  name: string | null;
};

export default class ContactMessage extends Component<Props, State>
  implements MutantAttachable<'name'>, PeriodicRendering {
  public watcherRemovers = {name: null};
  public periodicRenderingInterval: any;

  constructor(props: Props) {
    super(props);
    this.state = {name: null};
  }

  public componentDidMount() {
    attachMutant(this, 'name');
    attachPeriodicRendering(this); // because of humanTime
  }

  public componentWillUnmount() {
    detachMutant(this, 'name');
    detachPeriodicRendering(this);
  }

  public shouldComponentUpdate(nextProps: Props, nextState: State) {
    const prevProps = this.props;
    const prevState = this.state;
    return (
      nextProps.msg.key !== prevProps.msg.key ||
      nextState.name !== prevState.name
    );
  }

  public render() {
    const {msg} = this.props;
    const {name} = this.state;
    const accountTextProps = {
      numberOfLines: 1,
      ellipsizeMode: 'middle' as 'middle',
      style: styles.account,
    };

    return h(MessageContainer, [
      h(View, {style: styles.row}, [
        h(Text, accountTextProps, authorName(name, msg)),
        h(
          Text,
          {style: styles.followed},
          msg.value.content.following
            ? ' started following '
            : ' stopped following ',
        ),
        h(
          Text,
          accountTextProps,
          shortFeedId(msg.value.content.contact || '?'),
        ),
      ]),
      h(View, {style: styles.row}, [
        h(Text, {style: styles.timestamp}, humanTime(msg.value.timestamp)),
      ]),
    ]);
  }
}
