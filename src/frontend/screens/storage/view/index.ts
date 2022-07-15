// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream, Subscription} from 'xstream';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {h} from '@cycle/react';
import {PureComponent, ReactElement} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableNativeFeedback,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import PullFlatList from 'pull-flat-list';
const byteSize = require('byte-size').default;
import {propifyMethods} from 'react-propify-methods';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {FeedId, Msg} from 'ssb-typescript';
import {isContactMsg} from 'ssb-typescript/utils';
import {Palette} from '~frontend/global-styles/palette';
import {globalStyles} from '~frontend/global-styles/styles';
import {Typography} from '~frontend/global-styles/typography';
import {Dimensions} from '~frontend/global-styles/dimens';
import {displayName, inferContactEvent} from '~frontend/ssb/utils/from-ssb';
import {SSBSource} from '~frontend/drivers/ssb';
import TopBar from '~frontend/components/TopBar';
import {t} from '~frontend/drivers/localization';
import AnimatedLoading from '~frontend/components/AnimatedLoading';
import {StorageUsedByFeed} from '~frontend/ssb/types';
import Avatar from '~frontend/components/Avatar';
import {blobsStorageOptions, State} from '../model';
import StorageHeader from './StorageHeader';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

const PullFlatList2 = propifyMethods(
  PullFlatList,
  'scrollToOffset' as any,
  'forceRefresh',
);

const styleMain: ViewStyle = {
  flex: 1,
  paddingHorizontal: Dimensions.horizontalSpaceBig,
  paddingVertical: Dimensions.verticalSpaceBig,
  flexDirection: 'row',
  alignItems: 'center',
};

const styleMore: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  width: Dimensions.verticalSpaceBig * 2 + Dimensions.avatarSizeNormal,
};

const styles = StyleSheet.create({
  screen: globalStyles.screen,

  header: {
    backgroundColor: Palette.backgroundText,
    paddingVertical: Dimensions.verticalSpaceBig,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    color: Palette.textWeak,
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
        fontFamily: Typography.fontFamilyReadableText,
      },
    }),
  },

  row: {
    backgroundColor: Palette.backgroundText,
    marginBottom: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: Dimensions.verticalSpaceBig * 2 + Dimensions.avatarSizeNormal,
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },

  touchableMain: {
    ...Platform.select({
      web: styleMain,
      default: null,
    }),
  },

  rowMain: {
    ...Platform.select({
      web: {
        flexDirection: 'row',
      },
      default: styleMain,
    }),
  },

  touchableMore: {
    ...Platform.select({
      web: styleMore,
      default: null,
    }),
  },

  rowMore: {
    ...Platform.select({
      web: {
        flexDirection: 'row',
      },
      default: styleMore,
    }),
  },

  avatar: {
    marginRight: Dimensions.horizontalSpaceSmall,
  },

  authorName: {
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    color: Palette.text,
    minWidth: 120,
  },

  authorColumn: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'space-around',
  },

  authorDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  relationship: {
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
    marginLeft: Dimensions.horizontalSpaceTiny,
  },

  thisIsYou: {
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },

  storageUsed: {
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'normal',
    color: Palette.textWeak,
  },
});

interface ListItemState {
  youFollow: boolean | null;
  youBlock: boolean | null;
}

interface ListItemProps extends StorageUsedByFeed {
  selfFeedId: FeedId;
  publishHook$: Stream<Msg>;
  onPress?: (ev: FeedId) => void;
  onPressMore?: (ev: FeedId) => void;
}

class ListItem extends PureComponent<ListItemProps, ListItemState> {
  public state = {youFollow: null, youBlock: null};

  private publishHookSub?: Subscription;

  public componentDidMount() {
    if (this.props.publishHook$) {
      this.publishHookSub = this.props.publishHook$.subscribe({
        next: (msg) => {
          if (
            isContactMsg(msg) &&
            msg.value.content.contact === this.props.id
          ) {
            const contactEvent = inferContactEvent(msg);
            if (!contactEvent) return;
            switch (contactEvent) {
              case 'followed':
                this.setState({youFollow: true, youBlock: false});
                break;
              case 'blocked':
                this.setState({youFollow: false, youBlock: true});
                break;
              case 'unfollowed':
                this.setState({youFollow: false});
                break;
              case 'unblocked':
                this.setState({youBlock: false});
            }
          }
        },
      });
    }
  }

  public componentWillUnmount() {
    if (this.publishHookSub) {
      this.publishHookSub.unsubscribe();
    }
  }

  private onPress = () => {
    this.props.onPress?.(this.props.id);
  };

  private onPressMore = () => {
    this.props.onPressMore?.(this.props.id);
  };

  public render() {
    const {id, name, imageUrl, storageUsed, selfFeedId} = this.props;

    const youFollow = this.state.youFollow ?? this.props.youFollow;
    const youBlock = this.state.youBlock ?? this.props.youBlock;

    const touchableMainProps: any = {
      onPress: this.onPress,
      style: styles.touchableMain,
      accessible: true,
      accessibilityRole: 'button',
      accessibilityLabel: 'something', // FIXME: localize
    };
    if (Platform.OS === 'android') {
      touchableMainProps.background =
        TouchableNativeFeedback.SelectableBackground();
    }

    const touchableMoreProps: any = {
      onPress: this.onPressMore,
      style: styles.touchableMore,
      accessible: true,
      accessibilityRole: 'button',
      accessibilityLabel: 'something', // FIXME: localize
    };
    if (Platform.OS === 'android') {
      touchableMoreProps.background =
        TouchableNativeFeedback.SelectableBackground();
    }

    const authorNameText = h(
      Text,
      {
        numberOfLines: 1,
        ellipsizeMode: 'middle',
        style: styles.authorName,
      },
      displayName(name, id),
    );

    let moreDetails: Array<ReactElement> = [];
    if (youFollow) {
      moreDetails = [
        h(Icon, {
          key: 'icon',
          size: Dimensions.iconSizeSmall,
          color: Palette.textPositive,
          name: 'account-plus',
        }),
        // FIXME: localize
        h(Text, {numberOfLines: 1, style: styles.relationship}, 'Following'),
      ];
    } else if (youBlock) {
      moreDetails = [
        h(Icon, {
          key: 'icon',
          size: Dimensions.iconSizeSmall,
          color: Palette.textNegative,
          name: 'account-remove',
        }),
        // FIXME: localize
        h(Text, {numberOfLines: 1, style: styles.relationship}, 'Blocked'),
      ];
    } else if (id === selfFeedId) {
      moreDetails = [
        // FIXME: localize
        h(Text, {numberOfLines: 1, style: styles.thisIsYou}, 'This is you'),
      ];
    }

    return h(View, {style: styles.row}, [
      h(Touchable, touchableMainProps, [
        h(View, {style: styles.rowMain, pointerEvents: 'box-only'}, [
          h(Avatar, {
            url: imageUrl,
            size: Dimensions.avatarSizeNormal,
            style: styles.avatar,
          }),
          h(View, {style: styles.authorColumn}, [
            authorNameText,
            h(View, {style: styles.authorDetails}, [
              h(
                Text,
                {style: styles.storageUsed},
                byteSize(storageUsed).toString(),
              ),
              moreDetails.length > 0
                ? h(Icon, {
                    key: 'dot',
                    size: Dimensions.iconSizeSmall,
                    color: Palette.textWeak,
                    name: 'circle-small',
                  })
                : null,
              ...moreDetails,
            ]),
          ]),
        ]),
      ]),

      id !== selfFeedId
        ? h(Touchable, touchableMoreProps, [
            h(View, {style: styles.rowMore, pointerEvents: 'box-only'}, [
              h(Icon, {
                size: Dimensions.iconSizeNormal,
                color: Palette.textWeak,
                name: 'dots-horizontal',
              }),
            ]),
          ])
        : null,
    ]);
  }
}

interface ListProps
  extends Pick<
    State,
    | 'trashBytes'
    | 'contentBytes'
    | 'indexesBytes'
    | 'blobsBytes'
    | 'initialBlobsStorage'
  > {
  selfFeedId: FeedId;
  getScrollStream: State['getStorageUsedReadable'];
  forceRefresh$: Stream<boolean>;
  scrollToTop$: Stream<any>;
  publishHook$: Stream<Msg>;
  localizedBlobsStorageOptions: Array<string>;
  onPressAccount?: (ev: FeedId) => void;
  onPressAccountMore?: (ev: FeedId) => void;
}

class List extends PureComponent<ListProps, {initialLoading: boolean}> {
  constructor(props: ListProps) {
    super(props);
    this.state = {initialLoading: true};
  }

  private _onInitialPullDone = () => {
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

  private _onFinalPullDone = () => {
    this.setState({initialLoading: false});
  };

  private keyExtractor = (item: StorageUsedByFeed) => item.id;
  private renderItem = ({item}: {item: StorageUsedByFeed}) =>
    h(ListItem, {
      ...item,
      publishHook$: this.props.publishHook$,
      selfFeedId: this.props.selfFeedId,
      onPress: this.props.onPressAccount,
      onPressMore: this.props.onPressAccountMore,
    });

  public render() {
    const {getScrollStream, forceRefresh$, scrollToTop$} = this.props;
    const {initialLoading} = this.state;

    return h(PullFlatList2, {
      getScrollStream,
      initialNumToRender: 6,
      pullAmount: 4,
      numColumns: 1,
      forceRefresh$,
      scrollToOffset$: scrollToTop$.mapTo({offset: 0, animated: true}),
      onInitialPullDone: this._onInitialPullDone,
      onPullingComplete: this._onFinalPullDone,
      ListHeaderComponent: h(StorageHeader, this.props),
      ListFooterComponent: initialLoading
        ? h(AnimatedLoading, {text: t('central.loading')})
        : null,
      // FIXME: empty state
      // ListEmptyComponent: h(EmptySection, {
      //   style: styles.emptySection,
      //   image: getImg(require('~images/noun-plant.png')),
      //   title: t('private.empty.title'),
      //   description: t('private.empty.description'),
      // }),
      keyExtractor: this.keyExtractor,
      renderItem: this.renderItem,
    });
  }
}

export default function view(state$: Stream<State>, ssbSource: SSBSource) {
  const localizedBlobsStorageOptions = blobsStorageOptions.map((opt) => {
    if (opt === 'unlimited') {
      return t('settings.data_and_storage.blobs_storage.unlimited') as string;
    } else {
      return opt as string;
    }
  });

  return state$
    .compose(
      dropRepeatsByKeys([
        'selfFeedId',
        'getStorageUsedReadable',
        'trashBytes',
        'contentBytes',
        'indexesBytes',
        'blobsBytes',
        'initialBlobsStorage',
      ]),
    )
    .map((state) => {
      return h(View, {style: styles.screen}, [
        h(TopBar, {sel: 'topbar', title: t('storage.title')}),
        h(List, {
          sel: 'list',
          selfFeedId: state.selfFeedId,
          getScrollStream: state.getStorageUsedReadable,
          forceRefresh$: xs.never(),
          scrollToTop$: xs.never(),
          publishHook$: ssbSource.publishHook$,
          localizedBlobsStorageOptions,
          trashBytes: state.trashBytes,
          blobsBytes: state.blobsBytes,
          contentBytes: state.contentBytes,
          indexesBytes: state.indexesBytes,
          initialBlobsStorage: state.initialBlobsStorage,
        }),
      ]);
    });
}
