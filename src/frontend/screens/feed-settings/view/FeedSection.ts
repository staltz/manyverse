// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {t} from 'i18n-js';
import {PureComponent} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import Pill from '~frontend/components/Pill';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
import {Typography} from '~frontend/global-styles/typography';

const styles = StyleSheet.create({
  feedSection: {
    backgroundColor: Palette.backgroundText,
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },
  headerContainer: {
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
  },
  titleContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Dimensions.verticalSpaceSmall,
  },
  activeText: {
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
    color: Palette.textBrand,
    fontWeight: 'bold',
  },
  descriptionText: {
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },
});

interface FeedTypeSectionProps {
  accessibilityLabel: string;
  active: boolean;
  description: string;
  name: string;
  onFeedTypePress?: () => void;
}

export default class FeedSection extends PureComponent<FeedTypeSectionProps> {
  private _onPress = () => {
    this.props.onFeedTypePress?.();
  };

  public render() {
    const {accessibilityLabel, active, description, name} = this.props;

    return h(View, {style: styles.feedSection}, [
      h(View, {style: styles.headerContainer}, [
        h(View, {style: styles.titleContainer}, [
          h(Pill, {
            accessibilityLabel,
            accessibilityRole: 'button',
            content: name,
            onPress: this._onPress,
            selected: active,
            textSize: 'small',
          }),
          active
            ? h(
                Text,
                {style: styles.activeText},
                t('feed_settings.active_label').toLocaleUpperCase(),
              )
            : null,
        ]),
        h(Text, {style: styles.descriptionText}, description),
      ]),
    ]);
  }
}
