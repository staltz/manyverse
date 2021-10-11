// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';
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
import {Msg, PostContent} from 'ssb-typescript';
import PullFlatList from 'pull-flat-list';
const stripMarkdownOneline = require('strip-markdown-oneline');
import {t} from '../../drivers/localization';
import {GetReadable} from '../../drivers/ssb';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import TopBar from '../../components/TopBar';
import Avatar from '../../components/Avatar';
import EmptySection from '../../components/EmptySection';
import SettableTextInput from '../../components/SettableTextInput';
import LocalizedHumanTime from '../../components/LocalizedHumanTime';
import HeaderButton from '../../components/HeaderButton';
import Feed from '../../components/Feed';
import {MsgAndExtras} from '../../ssb/types';
import {displayName} from '../../ssb/utils/from-ssb';
import {State} from './model';
import {styles} from './styles';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

const ELLIPSIS = String.fromCodePoint(parseInt('2026', 16));
const MIN_INDEX = 50;
const MAX_LENGTH = 150;

function regExpWithBoundary(query: string) {
  // Word boundary `\b` often doensn't work with Unicode, so we do this:
  return new RegExp(query + '($|[ ,.;:!?\\-])', 'i');
}

/** Determine result content and queryMatchIdx
 *
 * We don't render the markdown, but instead extract just plain text, and with
 * MIN_INDEX and MAX_LENGTH we determine the correct "window" to slice the plain
 * text. The window serves as a summary of the matched message.
 */
function getContentAndQueryMatchIdx(
  msg: MsgAndExtras<PostContent>,
  query: string,
): [string, number] {
  let content: string = stripMarkdownOneline(msg.value.content.text);
  let queryMatchIdx = regExpWithBoundary(query).exec(content)?.index ?? -1;
  if (queryMatchIdx < 0) return ['', -1];
  if (queryMatchIdx > MIN_INDEX) {
    content = ELLIPSIS + content.slice(queryMatchIdx - MIN_INDEX);
    queryMatchIdx = regExpWithBoundary(query).exec(content)?.index ?? -1;
  }
  if (content.length > MAX_LENGTH) {
    content = content.slice(0, MAX_LENGTH) + ELLIPSIS;
  }
  return [content, queryMatchIdx];
}

class PlaceholderResult extends PureComponent<{}> {
  public render() {
    return h(View, {style: styles.placeholderContainer}, [
      h(View, {key: 'a', style: styles.placeholderAvatar}),
      h(View, {key: 'b', style: styles.placeholderAuthor}, [
        h(View, {style: styles.placeholderAuthorInner}),
      ]),
      h(View, {key: 'c', style: styles.placeHolderTimestamp}),
    ]);
  }
}

class Result extends PureComponent<{
  query: string;
  msg: MsgAndExtras<PostContent>;
  onPress: () => void;
}> {
  public render() {
    const {query, msg, onPress} = this.props;
    const author = displayName(
      msg.value._$manyverse$metadata.about.name,
      msg.value.author,
    );

    const touchableProps: any = {onPress};
    if (Platform.OS === 'android') {
      touchableProps.background = TouchableNativeFeedback.SelectableBackground();
    }

    const [content, queryMatchIdx] = getContentAndQueryMatchIdx(msg, query);
    if (queryMatchIdx < 0) return null; // dont render potential bad `msg`
    const preContent = content.slice(0, queryMatchIdx);
    const match = content.slice(queryMatchIdx, queryMatchIdx + query.length);
    const postContent = content.slice(queryMatchIdx + query.length);

    return h(View, [
      h(Touchable, touchableProps, [
        h(View, {style: styles.result, pointerEvents: 'box-only'}, [
          h(Avatar, {
            url: msg.value._$manyverse$metadata.about.imageUrl,
            size: Dimensions.avatarSizeNormal,
            style: styles.avatar,
          }),

          h(View, {style: styles.resultBody}, [
            h(View, {key: 'a', style: styles.resultHeader}, [
              h(
                Text,
                {
                  key: 'x',
                  numberOfLines: 1,
                  ellipsizeMode: 'middle',
                  style: styles.resultAuthor,
                },
                author,
              ),
              h(Text, {key: 'y', style: styles.resultTimestamp}, [
                h(LocalizedHumanTime, {time: msg.value.timestamp}),
              ]),
            ]),

            h(Text, {key: 'b', style: styles.resultContent}, [
              preContent,
              h(Text, {style: styles.bold}, match),
              postContent,
            ]),
          ]),
        ]),
      ]),
    ]);
  }
}

class Results extends PureComponent<{
  query: string;
  getScrollStream: GetReadable<MsgAndExtras<PostContent>> | null;
  onPressResult?: (ev: Msg) => void;
}> {
  public render() {
    const {query, onPressResult, getScrollStream} = this.props;
    return h(PullFlatList, {
      getScrollStream,
      initialNumToRender: 7,
      pullAmount: 1,
      numColumns: 1,
      onEndReachedThreshold: 3,
      ListFooterComponent: PlaceholderResult,
      ListEmptyComponent:
        query.length > 0
          ? h(EmptySection, {
              style: styles.emptySection,
              title: t('search.empty.zero_results.title'),
              description: t('search.empty.zero_results.description', {query}),
            })
          : null,
      keyExtractor: (msg: MsgAndExtras<PostContent>) => msg.key,
      renderItem: ({item}: any) => {
        const msg = item as MsgAndExtras<PostContent>;
        return h(Result, {
          query,
          msg,
          onPress: () => {
            onPressResult?.(msg);
          },
        });
      },
    });
  }
}

export default function view(state$: Stream<State>) {
  const setInputNativeProps$ = state$
    .compose(
      dropRepeats((s1, s2) => s1.queryOverrideFlag === s2.queryOverrideFlag),
    )
    .map((state) => ({
      focus: state.queryOverride.length === 0,
      text: state.queryOverride,
    }));

  return state$
    .compose(
      dropRepeatsByKeys([
        'queryInProgress',
        'query',
        'getResultsReadable',
        'getFeedReadable',
      ]),
    )
    .map((state) => {
      return h(View, {style: styles.screen}, [
        h(TopBar, {sel: 'topbar'}, [
          h(SettableTextInput, {
            style: styles.queryInput,
            sel: 'queryInput',
            nativeID: 'FocusViewOnResume',
            nativePropsAndFocus$: setInputNativeProps$,
            accessible: true,
            accessibilityLabel: t('search.query_input.accessibility_label'),
            autoFocus: state.queryOverride.length === 0,
            multiline: false,
            returnKeyType: 'search',
            placeholder: t('search.query_input.placeholder'),
            placeholderTextColor: Palette.textWeakForBackgroundBrand,
            selectionColor: Palette.backgroundTextSelection,
            underlineColorAndroid: 'transparent',
          }),
          state.queryInProgress
            ? h(HeaderButton, {
                sel: 'clear',
                icon: Platform.select({default: 'close', ios: 'close-circle'}),
                side: 'right',
                accessibilityLabel: t('search.clear_query.accessibility_label'),
              })
            : null,
        ]),

        h(View, {style: styles.bodySection}, [
          state.queryInProgress && state.getFeedReadable
            ? h(Feed, {
                sel: 'feed',
                getReadable: state.getFeedReadable,
                prePublication$: null,
                postPublication$: null,
                selfFeedId: state.selfFeedId,
                lastSessionTimestamp: state.lastSessionTimestamp,
                style: styles.feed,
                EmptyComponent:
                  state.query.length > 0
                    ? h(EmptySection, {
                        style: styles.emptySection,
                        title: t('search.empty.zero_results.title'),
                        description: t(
                          'search.empty.zero_results.description',
                          {query: state.query},
                        ),
                      })
                    : (null as any),
              })
            : state.queryInProgress && state.getResultsReadable
            ? h(Results, {
                sel: 'results',
                query: state.query,
                getScrollStream: state.getResultsReadable,
              })
            : state.queryInProgress
            ? h(PlaceholderResult)
            : null,
        ]),
      ]);
    });
}
