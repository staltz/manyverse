/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import concat from 'xstream/extra/concat';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {h} from '@cycle/react';
import {PureComponent} from 'react';
import {
  View,
  Text,
  Platform,
  TouchableNativeFeedback,
  TouchableOpacity,
  NativeScrollEvent,
} from 'react-native';
import {propifyMethods} from 'react-propify-methods';
import PullFlatList from 'pull-flat-list';
import {Content, FeedId, Msg} from 'ssb-typescript';
import {MsgAndExtras} from '../../../ssb/types';
import {GetReadable} from '../../../drivers/ssb';
import {t} from '../../../drivers/localization';
import EmptySection from '../../../components/EmptySection';
import AnimatedLoading from '../../../components/AnimatedLoading';
import Avatar from '../../../components/Avatar';
import {Dimensions} from '../../../global-styles/dimens';
import {displayName} from '../../../ssb/utils/from-ssb';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Palette} from '../../../global-styles/palette';
import LocalizedHumanTime from '../../../components/LocalizedHumanTime';
import {State} from './model';
import {styles} from './styles';

const PullFlatList2 = propifyMethods(
  PullFlatList,
  'forceRefresh' as any,
  'scrollToOffset' as any,
);

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

const Y_OFFSET_IS_AT_TOP = 10;

interface ActivityProps {
  msg: MsgAndExtras;
  onPress?: () => void;
}

type MsgType =
  | Msg<NonNullable<Content>>['value']['content']['type']
  | undefined;

class Activity extends PureComponent<ActivityProps> {
  private renderActivityText(author: string, type: MsgType) {
    return h(
      Text,
      {
        key: 'a',
        numberOfLines: 1,
        ellipsizeMode: 'middle',
        style: styles.activityText,
      },

      type === 'post'
        ? [
            h(Text, {key: 'a1'}, t('activity.mention.label.1_normal')),
            h(
              Text,
              {key: 'a2', style: styles.account},
              t('activity.mention.label.2_bold', {author}),
            ),
            h(Text, {key: 'a3'}, t('activity.mention.label.3_normal')),
          ]
        : type === 'contact'
        ? [
            h(Text, {key: 'a1'}, t('activity.follow.label.1_normal')),
            h(
              Text,
              {key: 'a2', style: styles.account},
              t('activity.follow.label.2_bold', {author}),
            ),
            h(Text, {key: 'a3'}, t('activity.follow.label.3_normal')),
          ]
        : [],
    );
  }

  private renderActivityIcon(type: MsgType) {
    if (type === 'post') {
      return h(Icon, {
        key: 'icon',
        size: Dimensions.iconSizeSmall,
        color: Palette.brandMain,
        name: 'at',
      });
    }

    if (type === 'contact') {
      return h(Icon, {
        key: 'icon',
        size: Dimensions.iconSizeSmall,
        color: Palette.textPositive,
        name: 'account-plus',
      });
    }

    return null;
  }

  public render() {
    const {msg, onPress} = this.props;
    const type = msg.value.content?.type;
    const author = displayName(
      msg.value._$manyverse$metadata.about.name,
      msg.value.author,
    );

    const touchableProps: any = Platform.select({
      android: {
        onPress,
        background: TouchableNativeFeedback.SelectableBackground(),
      },
      default: {
        onPress,
      },
    });

    return h(View, [
      h(Touchable, touchableProps, [
        h(View, {style: styles.activityRow, pointerEvents: 'box-only'}, [
          h(Avatar, {
            url: msg.value._$manyverse$metadata.about.imageUrl,
            size: Dimensions.avatarSizeNormal,
            style: styles.avatar,
          }),

          h(View, {style: styles.activityBody}, [
            this.renderActivityText(author, type),
            h(View, {key: 'b', style: styles.activityMetatext}, [
              this.renderActivityIcon(type),
              h(Text, {key: 't', style: styles.timestamp}, [
                h(LocalizedHumanTime, {time: msg.value.timestamp}),
              ]),
            ]),
          ]),
        ]),
      ]),
    ]);
  }
}

interface MLProps {
  getScrollStream: GetReadable<MsgAndExtras> | null;
  // forceRefresh$: Stream<boolean>;
  scrollToTop$: Stream<any>;
  onRefresh?: () => void;
  onPressMention?: (ev: Msg) => void;
  onPressFollow?: (ev: FeedId) => void;
}
interface MLState {
  initialLoading: boolean;
}

class ActivityList extends PureComponent<MLProps, MLState> {
  private yOffset: number;

  constructor(props: MLProps) {
    super(props);
    this.yOffset = 0;
    this.state = {initialLoading: true};
  }

  private _onScroll = (ev: {nativeEvent: NativeScrollEvent}) => {
    if (ev?.nativeEvent?.contentOffset) {
      this.yOffset = ev.nativeEvent.contentOffset.y ?? 0;
    }
  };

  private _onFeedInitialPullDone = () => {
    this.setState({initialLoading: false});
  };

  public render() {
    const {
      onPressMention,
      onPressFollow,
      getScrollStream,
      onRefresh,
      scrollToTop$,
    } = this.props;
    const {initialLoading} = this.state;

    return h(PullFlatList2, {
      getScrollStream,
      style: styles.activityList,
      contentContainerStyle: styles.activityListInner,
      initialNumToRender: 7,
      pullAmount: 1,
      numColumns: 1,
      onEndReachedThreshold: 3,
      refreshable: true,
      onRefresh,
      onScroll: this._onScroll,
      scrollToOffset$: (scrollToTop$ ?? xs.never())
        .filter(() => this.yOffset > Y_OFFSET_IS_AT_TOP)
        .mapTo({offset: 0, animated: true}),
      forceRefresh$: (scrollToTop$ ?? xs.never())
        .filter(() => this.yOffset <= Y_OFFSET_IS_AT_TOP)
        .mapTo(void 0),
      onInitialPullDone: this._onFeedInitialPullDone,
      ListFooterComponent: initialLoading
        ? h(AnimatedLoading, {text: t('central.loading')})
        : null,
      ListEmptyComponent: h(EmptySection, {
        style: styles.emptySection,
        image: require('../../../../../images/noun-sun.png'),
        title: t('activity.empty.title'),
        description: t('activity.empty.description'),
      }),
      keyExtractor: (msg: MsgAndExtras, i: number) => msg.key ?? String(i),
      renderItem: ({item}: any) => {
        const msg = item as MsgAndExtras;
        return h(Activity, {
          msg,
          onPress: () => {
            const type = msg.value.content?.type;
            if (type === 'post') onPressMention?.(msg);
            else if (type === 'contact') onPressFollow?.(msg.value.author);
          },
        });
      },
    });
  }
}

export default function view(state$: Stream<State>, scrollToTop$: Stream<any>) {
  // The first state passes regardless if the screen is visible (the purpose is
  // to populate the mentions list with data ASAP), but the subsequent state
  // emissions are guarded by the visibility check.
  const viewState$ = concat(
    state$.filter((state) => !!state.getActivityFeedReadable).take(1),
    state$.filter((state) => state.isVisible),
  ).compose(dropRepeatsByKeys(['getActivityFeedReadable']));

  const vdom$ = viewState$.map((state) => {
    return h(ActivityList, {
      sel: 'activityList',
      scrollToTop$,
      getScrollStream: state.getActivityFeedReadable,
    });
  });

  return vdom$;
}
