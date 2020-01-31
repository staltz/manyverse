/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {ReactSource} from '@cycle/react';
import {MsgId} from 'ssb-typescript';

export default function intent(
  reactSource: ReactSource,
  fabPress$: Stream<string>,
) {
  return {
    goToRecipientsInput$: fabPress$
      .filter(action => action === 'recipients-input')
      .mapTo(null),

    goToConversation$: reactSource
      .select('conversationList')
      .events('pressConversation') as Stream<MsgId>,
  };
}
