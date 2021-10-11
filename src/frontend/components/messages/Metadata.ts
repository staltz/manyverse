// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {h} from '@cycle/react';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';
import {Dimensions} from '../../global-styles/dimens';

export const styles = StyleSheet.create({
  metadataBox: {
    flex: 1,
    backgroundColor: Palette.backgroundTextHacker,
    padding: 5,
    borderRadius: Dimensions.borderRadiusSmall,
  },

  metadataText: {
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
    color: Palette.textHacker,
    fontFamily: Typography.fontFamilyMonospace,
  },
});

export default class Metadata extends Component<{msg: any}> {
  public render() {
    const {msg} = this.props;
    return h(View, {style: styles.metadataBox}, [
      h(
        Text,
        {style: styles.metadataText},
        JSON.stringify(
          msg,
          (key, value) => (key === '_$manyverse$metadata' ? undefined : value),
          2,
        ),
      ),
    ]);
  }
}
