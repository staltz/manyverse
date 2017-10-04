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

import {Msg, FeedId, isVoteMsg} from './types';
const human = require('human-time');

export type FeedData = {
  updated: number;
  arr: Array<Msg>;
};

/**
 * Whether or not the message should be shown in the feed.
 *
 * TODO: This should be configurable in the app settings!
 */
function isShowableMsg(msg: Msg): boolean {
  return !isVoteMsg(msg);
}

export function includeMsgIntoFeed(feed: FeedData, msg: Msg) {
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

export function authorName(msg: Msg): string {
  return (
    (msg.value._derived &&
      msg.value._derived.about &&
      msg.value._derived.about.name) ||
    msg.value.author.slice(1, 10)
  );
}

export function shortFeedId(feedId: FeedId): string {
  return feedId.slice(0, 11) + '\u2026';
}

export function humanTime(timestamp: number): string {
  return human(new Date(timestamp))
    .replace(/minute/, 'min')
    .replace(/^.*second.*$/, 'now');
}
