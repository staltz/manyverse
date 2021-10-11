// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import sample from 'xstream-sample';
import {toAboutContent} from '../../ssb/utils/to-ssb';
import {Req, PublishAboutReq} from '../../drivers/ssb';
import {State} from './model';

export interface SSBActions {
  save$: Stream<null>;
}

/**
 * Define streams of new content to be flushed onto SSB.
 */
export default function ssb(
  state$: Stream<State>,
  actions: SSBActions,
): Stream<Req> {
  const newAboutContent$ = actions.save$
    .compose(sample(state$))
    .filter(
      (state) =>
        (!!state.newName && state.newName !== state.about.name) ||
        !!state.newAvatar ||
        (!!state.newDescription &&
          state.newDescription !== state.about.description),
    )
    .map(
      (state) =>
        ({
          type: 'publishAbout',
          content: toAboutContent(
            state.about.id,
            state.newName,
            state.newDescription,
            state.newAvatar,
          ),
        } as PublishAboutReq),
    );

  return newAboutContent$;
}
