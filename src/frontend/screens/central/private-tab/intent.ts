// SPDX-FileCopyrightText: 2020 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {ReactSource} from '@cycle/react';
import {MsgId} from 'ssb-typescript';

export default function intent(
  reactSource: ReactSource,
  fabPress$: Stream<string>,
) {
  return {
    goToRecipientsInput$: fabPress$
      .filter((action) => action === 'recipients-input')
      .mapTo(null),

    goToConversation$: reactSource
      .select('conversationList')
      .events('pressConversation') as Stream<MsgId>,
  };
}
