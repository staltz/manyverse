// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {Command} from 'cycle-native-navigation';
import {Screens} from '~frontend/screens/enums';
import {navOptions as searchScreenNavOpts} from '~frontend/screens/search';
import {Props as SearchScreenProps} from '~frontend/screens/search';
import {State} from './model';

export interface Actions {
  goBack$: Stream<any>;
  goToHashtagSearch$: Stream<string>;
}

export default function navigationCommands(
  actions: Actions,
  state$: Stream<State>,
): Stream<Command> {
  const back$ = actions.goBack$.mapTo({type: 'pop'} as Command);

  const toHashtagSearch$ = actions.goToHashtagSearch$
    .compose(sampleCombine(state$))
    .map(
      ([hashtag, state]) =>
        ({
          type: 'push',
          layout: {
            component: {
              name: Screens.Search,
              passProps: {
                selfFeedId: state.selfFeedId,
                lastSessionTimestamp: state.lastSessionTimestamp,
                query: `#${hashtag}`,
              } as SearchScreenProps,
              options: searchScreenNavOpts,
            },
          },
        } as Command),
    );

  return xs.merge(back$, toHashtagSearch$);
}
