// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {t} from 'i18n-js';
import {PureComponent} from 'react';
import {StyleSheet, View} from 'react-native';
import {Dimensions} from '~frontend/global-styles/dimens';
import {GlobalEventBus} from '~frontend/drivers/eventbus';
import {FeedFilter} from '~frontend/screens/central/model';
import FeedSection from './FeedSection';

const styles = StyleSheet.create({
  separator: {height: Dimensions.verticalSpaceBig},
});

export default class Header extends PureComponent<{
  activePublicFeedType: FeedFilter | null;
  onChangePublicFeedType?: (feedType: FeedFilter) => void;
  hasHashtagSubscriptions?: boolean;
}> {
  private _onChangePublicFeedType = (feedType: FeedFilter) => () => {
    this.props.onChangePublicFeedType?.(feedType);
    GlobalEventBus.dispatch({
      type: 'changePublicFeedType',
      feedType,
    });
  };

  public render() {
    const {activePublicFeedType, hasHashtagSubscriptions} = this.props;

    return h(View, [
      h(FeedSection, {
        sel: 'feedSection',
        accessibilityLabel: t('feed_settings.all.accessibility_label'),
        active: activePublicFeedType === 'all',
        description: t('feed_settings.all.description'),
        name: t('feed_settings.all.title'),
        onFeedTypePress: this._onChangePublicFeedType('all'),
      }),
      h(View, {style: styles.separator}),
      h(FeedSection, {
        sel: 'feedSection',
        accessibilityLabel: t('feed_settings.following.accessibility_label'),
        active: activePublicFeedType === 'following',
        description: t('feed_settings.following.description'),
        name: t('feed_settings.following.title'),
        onFeedTypePress: this._onChangePublicFeedType('following'),
      }),
      h(View, {style: styles.separator}),
      h(FeedSection, {
        sel: 'feedSection',
        accessibilityLabel: t('feed_settings.hashtags.accessibility_label'),
        active: activePublicFeedType === 'hashtags',
        description:
          t('feed_settings.hashtags.description_1') +
          (hasHashtagSubscriptions
            ? ` ${t('feed_settings.hashtags.description_2')}`
            : ''),
        name: t('feed_settings.hashtags.title'),
        onFeedTypePress: this._onChangePublicFeedType('hashtags'),
      }),
    ]);
  }
}
