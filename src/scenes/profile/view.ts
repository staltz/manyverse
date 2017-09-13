/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import xs, {Stream} from 'xstream';
import {PureComponent, Component} from 'react';
import {View, FlatList, Text, TextInput, ToolbarAndroid} from 'react-native';
import {h} from '@cycle/native-screen';
import {Palette} from '../../global-styles/palette';
import Feed, {FeedData, emptyFeed} from '../../components/Feed';
import {Msg, isVoteMsg, About} from '../../ssb/types';
import {SSBSource} from '../../drivers/ssb';
import {styles} from './styles';

/**
 * Whether or not the message should be shown in the feed.
 *
 * TODO: This should be configurable in the app settings!
 */
function isShowableMsg(msg: Msg): boolean {
  return !isVoteMsg(msg);
}

function includeMsgIntoFeed(feed: FeedData, msg: Msg) {
  const index = feed.arr.findIndex(m => m.key === msg.key);
  if (index >= 0) {
    feed.arr[index] = msg;
    feed.updated += 1;
  } else if (isShowableMsg(msg)) {
    feed.arr.unshift(msg);
    feed.updated += 1;
  }
  return feed;
}

export default function view(feed$: Stream<Msg>, about$: Stream<About>) {
  const feedArray$ = feed$.fold(includeMsgIntoFeed, emptyFeed);

  const vdom$ = xs.combine(feedArray$, about$).map(([feed, about]) =>
    h(View, {style: styles.container}, [
      h(ToolbarAndroid, {
        selector: 'toolbar',
        title: about.name,
        titleColor: Palette.white,
        navIcon: {uri: 'ic_arrow_left_white_24dp'},
        style: styles.toolbar
      }),
      h(Feed, {selector: 'feed', feed, showPublishHeader: false})
    ])
  );

  return {
    vdom$: vdom$,
    statusBar$: xs.of(Palette.brand.backgroundDarker)
  };
}
