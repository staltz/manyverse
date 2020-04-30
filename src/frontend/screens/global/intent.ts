/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {
  GlobalEvent,
  TriggerFeedCypherlink,
  TriggerMsgCypherlink,
} from '../../drivers/eventbus';

export default function intent(globalEventBus: Stream<GlobalEvent>) {
  return {
    goToProfile$: globalEventBus
      .filter(ev => ev.type === 'triggerFeedCypherlink')
      .map(ev => ({authorFeedId: (ev as TriggerFeedCypherlink).feedId})),

    goToThread$: globalEventBus
      .filter(ev => ev.type === 'triggerMsgCypherlink')
      .map(ev => ({rootMsgId: (ev as TriggerMsgCypherlink).msgId})),
  };
}
