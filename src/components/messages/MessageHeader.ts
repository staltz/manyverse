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

import {Component} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableNativeFeedback,
} from 'react-native';
import {h} from '@cycle/native-screen';
import {FeedId, Msg} from '../../ssb/types';
import {humanTime, authorName} from '../../ssb/utils';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
import {MutantAttachable, attachMutant, detachMutant} from 'mutant-attachable';
import {Mutant} from '../../typings/mutant';
import {
  PeriodicRendering,
  attachPeriodicRendering,
  detachPeriodicRendering,
} from '../lifecycle/PeriodicRendering';

export const styles = StyleSheet.create({
  messageHeaderRow: {
    flexDirection: 'row',
    flex: 1,
  },

  messageAuthorImageContainer: {
    height: 45,
    width: 45,
    borderRadius: 3,
    backgroundColor: Palette.indigo1,
    marginRight: Dimensions.horizontalSpaceSmall,
    marginBottom: Dimensions.verticalSpaceSmall,
  },

  messageAuthorImage: {
    borderRadius: 3,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  messageHeaderAuthorColumn: {
    flexDirection: 'column',
    flex: 1,
  },

  flexRow: {
    flexDirection: 'row',
    flex: 1,
  },

  messageHeaderAuthorName: {
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.text,
  },

  messageHeaderTimestamp: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.textWeak,
  },
});

export type Props = {
  msg: Msg;
  name: Mutant<string>;
  imageUrl: Mutant<string>;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
};

export type State = {
  name: string | null;
  imageUrl: string | null;
};

export default class MessageHeader extends Component<Props, State>
  implements MutantAttachable<'name' | 'imageUrl'>, PeriodicRendering {
  public watcherRemovers = {name: null, imageUrl: null};
  public periodicRenderingInterval: any;

  constructor(props: Props) {
    super(props);
    this.state = {imageUrl: null, name: null};
  }

  public componentDidMount() {
    attachMutant(this, 'name');
    attachMutant(this, 'imageUrl');
    attachPeriodicRendering(this); // because of humanTime
  }

  public componentWillUnmount() {
    detachMutant(this, 'name');
    detachMutant(this, 'imageUrl');
    detachPeriodicRendering(this);
  }

  private _onPressAuthor() {
    const onPressAuthor = this.props.onPressAuthor;
    if (onPressAuthor) {
      onPressAuthor({authorFeedId: this.props.msg.value.author});
    }
  }

  public shouldComponentUpdate(nextProps: Props, nextState: State) {
    const prevProps = this.props;
    const prevState = this.state;
    return (
      nextProps.msg.key !== prevProps.msg.key ||
      nextState.name !== prevState.name ||
      nextState.imageUrl !== prevState.imageUrl
    );
  }

  public render() {
    const {msg} = this.props;
    const {imageUrl, name} = this.state;
    const avatarUrl = {uri: imageUrl || undefined};
    const touchableProps = {
      background: TouchableNativeFeedback.SelectableBackground(),
      onPress: () => this._onPressAuthor(),
    };

    const messageHeaderAuthorName = h(TouchableNativeFeedback, touchableProps, [
      h(View, {style: styles.flexRow}, [
        h(
          Text,
          {
            numberOfLines: 1,
            ellipsizeMode: 'middle',
            style: styles.messageHeaderAuthorName,
          },
          authorName(name, msg),
        ),
      ]),
    ]);

    const messageHeaderTimestamp = h(View, {style: styles.flexRow}, [
      h(
        Text,
        {style: styles.messageHeaderTimestamp},
        humanTime(msg.value.timestamp),
      ),
    ]);

    return h(View, {style: styles.messageHeaderRow}, [
      h(TouchableNativeFeedback, touchableProps, [
        h(View, {style: styles.messageAuthorImageContainer}, [
          h(Image, {
            style: styles.messageAuthorImage,
            source: avatarUrl,
          }),
        ]),
      ]),
      h(View, {style: styles.messageHeaderAuthorColumn}, [
        messageHeaderAuthorName,
        messageHeaderTimestamp,
      ]),
    ]);
  }
}
