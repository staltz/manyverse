/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {h} from '@cycle/react';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';

export const styles = StyleSheet.create({
  metadataBox: {
    flex: 1,
    backgroundColor: Palette.backgroundTextHacker,
    padding: 5,
    borderRadius: 2,
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
