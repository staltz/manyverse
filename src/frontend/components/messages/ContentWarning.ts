/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
import Button from '../Button';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Palette.backgroundTextWeak,
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },

  containerOpened: {
    paddingVertical: Dimensions.verticalSpaceTiny,
    paddingHorizontal: Dimensions.horizontalSpaceSmall,
    borderRadius: 3,
    flexDirection: 'row',
  },

  containerClosed: {
    flex: 1,
    height: 200,
    marginVertical: Dimensions.verticalSpaceNormal,
    paddingVertical: Dimensions.verticalSpaceBig,
    paddingHorizontal: Dimensions.horizontalSpaceNormal,
    borderRadius: 10,
    flexDirection: 'column',
  },

  iconOpened: {
    marginRight: Dimensions.horizontalSpaceSmall,
  },

  iconClosed: {
    position: 'absolute',
    top: Dimensions.verticalSpaceLarge,
    left: Dimensions.horizontalSpaceLarge,
    opacity: 0.06,
  },

  title: {
    color: Palette.text,
    fontSize: Typography.fontSizeLarge,
    lineHeight: Typography.lineHeightLarge,
    fontFamily: Typography.fontFamilyReadableText,
    marginBottom: Dimensions.verticalSpaceSmall,
    ...Platform.select({
      default: {
        textAlign: 'left',
      },
      ios: {
        textAlign: 'center',
      },
    }),
  },

  descriptionOpened: {
    color: Palette.textWeak,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    flex: 1,
    textAlign: 'left',
  },

  descriptionClosed: {
    color: Palette.textWeak,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    textAlign: 'left',
  },

  toggleOpened: {
    marginLeft: Dimensions.horizontalSpaceNormal,
    color: Palette.text,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
  },

  toggleClosed: {
    color: Palette.textForBackgroundBrand,
    backgroundColor: Palette.textWeak,
    width: 'auto',
    alignSelf: 'center',
  },
});

export type Props = {
  description: string;
  opened: boolean;
  onPressToggle: () => void;
  style?: StyleProp<ViewStyle>;
};

export default class ContentWarning extends PureComponent<Props> {
  public render() {
    const {description, opened, style} = this.props;

    return h(
      View,
      {
        style: [
          styles.container,
          opened ? styles.containerOpened : styles.containerClosed,
          style ?? null,
        ],
      },
      [
        h(
          View,
          {key: 'x', style: opened ? styles.iconOpened : styles.iconClosed},
          [
            h(Icon, {
              size: opened ? Dimensions.iconSizeNormal : 144,
              color: Palette.textWeak,
              name: 'alert',
            }),
          ],
        ),
        h(View, {key: 'y', style: {flex: 1}}, [
          opened
            ? null
            : h(
                Text,
                {key: 'a', style: styles.title, selectable: true},
                t('message.content_warning.title'),
              ),
          h(
            Text,
            {
              key: 'b',
              numberOfLines: opened ? 1 : 4,
              ellipsizeMode: 'tail',
              style: opened
                ? styles.descriptionOpened
                : styles.descriptionClosed,
            },
            description,
          ),
        ]),
        opened
          ? h(
              TouchableOpacity,
              {
                key: 'z1',
                onPress: this.props.onPressToggle,
                activeOpacity: 0.4,
              },
              [
                h(
                  Text,
                  {style: styles.toggleOpened},
                  t('message.content_warning.call_to_action.hide'),
                ),
              ],
            )
          : h(Button, {
              key: 'z2',
              text: t('message.content_warning.call_to_action.show'),
              onPress: this.props.onPressToggle,
              strong: true,
              style: styles.toggleClosed,
              accessible: true,
            }),
      ],
    );
  }
}
