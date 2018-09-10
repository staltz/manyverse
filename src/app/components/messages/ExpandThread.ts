/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
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

import {PureComponent} from 'react';
import {Text, View, StyleSheet, TouchableNativeFeedback} from 'react-native';
import {h} from '@cycle/react';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
import {MsgId} from 'ssb-typescript';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.brand.textBackground,
    marginBottom: 1,
    flexDirection: 'column',
  },

  hr1: {
    backgroundColor: Palette.brand.voidBackground,
    height: 1,
    marginTop: Dimensions.verticalSpaceBig,
    marginBottom: Dimensions.verticalSpaceBig,
  },

  hr2: {
    backgroundColor: Palette.brand.voidBackground,
    height: 1,
    marginTop: 0,
    marginBottom: Dimensions.verticalSpaceBig,
  },

  labelBox: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 135,
    right: 135,
    top: Dimensions.verticalSpaceBig * 0.6,
    bottom: Dimensions.verticalSpaceBig * 0.6,
    borderRadius: 3,
    borderColor: Palette.brand.voidBackground,
    borderWidth: 1,
    backgroundColor: Palette.brand.textBackground,
  },

  labelText: {
    fontSize: Typography.fontSizeNormal,
    textAlign: 'center',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.background,
  },
});

export type Props = {
  rootMsgId: MsgId;
  onPress: (ev: {rootMsgId: MsgId}) => void;
};

export default class ExpandThread extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this._onPress = this.onPressHandler.bind(this);
  }

  private _onPress: () => void;

  private onPressHandler() {
    const {onPress, rootMsgId} = this.props;
    onPress({rootMsgId});
  }

  public render() {
    const touchableProps = {
      background: TouchableNativeFeedback.SelectableBackground(),
      onPress: this._onPress,
    };

    return h(TouchableNativeFeedback, touchableProps, [
      h(View, {style: styles.container}, [
        h(View, {style: styles.hr1}),
        h(View, {style: styles.hr2}),
        h(View, {style: styles.labelBox}, [
          h(Text, {style: styles.labelText}, 'Read more'),
        ]),
      ]),
    ]);
  }
}
