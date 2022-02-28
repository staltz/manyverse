// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {ReactSource} from '@cycle/react';
import {Stream} from 'xstream';
import delay from 'xstream/extra/delay';
import {State} from './model';

export default function intent(
  state$: Stream<State>,
  reactSource: ReactSource,
) {
  const goToPasteInvite$ = reactSource.select('paste-invite').events('press');

  const connectViaWifi$ = reactSource
    .select('connect-via-wifi')
    .events('press')
    .mapTo(null);

  const willGoToCentral$ = state$
    .filter((state) => state.progressToSkip > 0.98)
    .take(1)
    .mapTo(null);

  const goToCentral$ = willGoToCentral$.compose(delay(150));

  return {
    connectViaWifi$,
    goToPasteInvite$,
    willGoToCentral$,
    goToCentral$,
  };
}
