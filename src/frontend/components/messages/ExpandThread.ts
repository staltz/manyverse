/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
    backgroundColor: Palette.backgroundText,
    marginBottom: 1,
    flexDirection: 'column',
  },

  hr1: {
    backgroundColor: Palette.backgroundVoid,
    height: 1,
    marginTop: Dimensions.verticalSpaceBig,
    marginBottom: Dimensions.verticalSpaceBig,
  },

  hr2: {
    backgroundColor: Palette.backgroundVoid,
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
    borderColor: Palette.backgroundVoid,
    borderWidth: 1,
    backgroundColor: Palette.backgroundText,
  },

  labelText: {
    fontSize: Typography.fontSizeNormal,
    textAlign: 'center',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.backgroundBrand,
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
