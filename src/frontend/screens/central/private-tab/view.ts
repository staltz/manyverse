// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
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
} from 'react-native';
import {propifyMethods} from 'react-propify-methods';
import PullFlatList from 'pull-flat-list';
import {FeedId, MsgId} from 'ssb-typescript';
import {PrivateThreadAndExtras} from '../../../ssb/types';
import {GetReadable} from '../../../drivers/ssb';
import {t} from '../../../drivers/localization';
import {Dimensions} from '../../../global-styles/dimens';
import {getImg} from '../../../global-styles/utils';
import {displayName} from '../../../ssb/utils/from-ssb';
import EmptySection from '../../../components/EmptySection';
import AnimatedLoading from '../../../components/AnimatedLoading';
import Avatar from '../../../components/Avatar';
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

type CIProps = {
  recps: Array<{
    name?: string;
    imageUrl?: string | null;
    id: string;
  }>;
  isUnread: boolean;
  onPress?: () => void;
};

const GROUP_SIZE = Dimensions.avatarSizeNormal;
const CX = GROUP_SIZE * 0.5; // x coord of center of the group
const CY = CX; // y coord of center of the group
const ANG = Math.PI / 6; // initial angle 330 degrees (= 360 - 30)
const SIZE = GROUP_SIZE * 0.55; // size of one avatar
const HALFSIZE = SIZE * 0.5;
const DIST = (GROUP_SIZE - SIZE) * 0.5; // distance from (CX,CY)

class ConversationItem extends PureComponent<CIProps> {
  public render() {
    const {recps, isUnread, onPress} = this.props;
    const amount = recps.length;

    const touchableProps: any = {onPress};
    if (Platform.OS === 'android') {
      touchableProps.background =
        TouchableNativeFeedback.SelectableBackground();
    }

    const D_ANG = (2 * Math.PI) / amount;

    return h(
      View,
      {accessibilityLabel: t('private.conversation.accessibility_label')},
      [
        h(Touchable, touchableProps, [
          h(View, {style: styles.conversationRow, pointerEvents: 'box-only'}, [
            amount === 1
              ? h(View, {key: 'a', style: styles.singleAvatar}, [
                  h(Avatar, {url: recps[0].imageUrl, size: GROUP_SIZE}),
                ])
              : h(
                  View,
                  {key: 'b', style: styles.avatarGroup},
                  recps
                    .slice()
                    .reverse()
                    .map(({imageUrl}, i) =>
                      h(Avatar, {
                        url: imageUrl,
                        size: SIZE,
                        style: [
                          styles.avatar,
                          {
                            left:
                              CX - HALFSIZE + DIST * Math.cos(ANG - D_ANG * i),
                            top:
                              CY - HALFSIZE + DIST * Math.sin(ANG - D_ANG * i),
                          },
                        ],
                      }),
                    ),
                ),
            isUnread ? h(View, {key: 'c', style: styles.unreadDot}) : null,
            h(
              Text,
              {
                key: 'd',
                numberOfLines: 3,
                ellipsizeMode: 'tail',
                style: isUnread
                  ? styles.conversationAuthorsUnread
                  : styles.conversationAuthors,
              },
              recps.map((x) => displayName(x.name, x.id)).join(', '),
            ),
          ]),
        ]),
      ],
    );
  }
}

interface CLProps {
  selfFeedId: FeedId;
  getScrollStream: GetReadable<PrivateThreadAndExtras> | null;
  unreadSet: Set<MsgId>;
  forceRefresh$: Stream<boolean>;
  scrollToTop$: Stream<any>;
  onPressConversation?: (ev: MsgId) => void;
}

interface CLState {
  initialLoading: boolean;
}

type Unarray<T> = T extends Array<infer U> ? U : T;

class ConversationsList extends PureComponent<CLProps, CLState> {
  private registryOfOnPress: Map<string, () => void>;

  constructor(props: CLProps) {
    super(props);
    this.state = {initialLoading: true};
    this.registryOfOnPress = new Map();
  }

  private _onFeedInitialPullDone = () => {
    this.setState({initialLoading: false});

    // Hack because FlatList on react-native-web is broken
    // https://github.com/necolas/react-native-web/issues/1608
    // Here we fiddle with the app's height to force FlatList to understand
    // that it should load more items
    if (Platform.OS === 'web') {
      window.document.body.style.height = '99.99%';
      setTimeout(() => {
        window.document.body.style.height = '100%';
      });
    }
  };

  private isNotMe = (recp: Unarray<PrivateThreadAndExtras['recps']>) => {
    return recp.id !== this.props.selfFeedId;
  };

  public render() {
    const {getScrollStream, forceRefresh$, scrollToTop$, unreadSet} =
      this.props;
    const {initialLoading} = this.state;

    return h(PullFlatList2, {
      getScrollStream,
      style: styles.conversationList,
      contentContainerStyle: styles.conversationListInner,
      initialNumToRender: 7,
      pullAmount: 1,
      numColumns: 1,
      forceRefresh$,
      scrollToOffset$: scrollToTop$.mapTo({offset: 0, animated: true}),
      onInitialPullDone: this._onFeedInitialPullDone,
      ListFooterComponent: initialLoading
        ? h(AnimatedLoading, {text: t('central.loading')})
        : null,
      ListEmptyComponent: h(EmptySection, {
        style: styles.emptySection,
        image: getImg(require('../../../../../images/noun-plant.png')),
        title: t('private.empty.title'),
        description: t('private.empty.description'),
      }),
      keyExtractor: (thread: PrivateThreadAndExtras, index: number) =>
        thread.messages[0].key ?? String(index),
      renderItem: ({item}: any) => {
        const thread = item as PrivateThreadAndExtras;
        const rootId = thread.messages[0].key;
        const onPress = this.registryOfOnPress.has(rootId)
          ? this.registryOfOnPress.get(rootId)!
          : () => this.props.onPressConversation?.(rootId);
        this.registryOfOnPress.set(rootId, onPress);
        return h(ConversationItem, {
          recps: thread.recps.filter(this.isNotMe),
          isUnread: unreadSet.has(rootId),
          onPress,
        });
      },
    });
  }
}

export default function view(
  state$: Stream<State>,
  forceRefreshList$: Stream<any>,
  scrollToTop$: Stream<any>,
) {
  const forceRefresh$ = forceRefreshList$.mapTo(/* retain! */ true);

  // The first state passes regardless if the screen is visible (the purpose is
  // to populate the ConversationList with data ASAP), but the subsequent state
  // emissions are guarded by the tab visibility check.
  const viewState$ = concat(
    state$.filter((state) => !!state.getPrivateFeedReadable).take(1),
    state$.filter((state) => state.isVisible),
  ).compose(dropRepeatsByKeys(['updatesFlag', 'getPrivateFeedReadable']));

  const vdom$ = viewState$.map((state) => {
    return h(ConversationsList, {
      sel: 'conversationList',
      selfFeedId: state.selfFeedId,
      unreadSet: state.updates,
      forceRefresh$,
      scrollToTop$,
      getScrollStream: state.getPrivateFeedReadable,
    });
  });

  return vdom$;
}
