// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {Command} from 'cycle-native-navigation';
import {Screens} from '~frontend/screens/enums';
import {navOptions as searchNavOpts} from '~frontend/screens/search/index';
import {navOptions as indexingScreenNavOpts} from '~frontend/screens/indexing/layout';
import {Props as SearchProps} from '~frontend/screens/search/props';
import {Props as IndexingProps} from '~frontend/screens/indexing/props';
import {navOptions as feedSettingsScreenNavOptions} from '~frontend/screens/feed-settings';
import {State} from './model';

export interface Actions {
  openDrawer$: Stream<null>;
  closeDrawer$: Stream<null>;
  goToSearch$: Stream<null>;
  goToIndexing$: Stream<IndexingProps>;
  goToFeedSettings$: Stream<null>;
}

export default function navigationCommands(
  state$: Stream<State>,
  actions: Actions,
  other$: Stream<Command>,
): Stream<Command> {
  const openDrawer$: Stream<Command> = actions.openDrawer$.map(
    () =>
      ({
        type: 'mergeOptions',
        opts: {
          sideMenu: {
            left: {
              visible: true,
            },
          },
        },
      } as Command),
  );

  const closeDrawer$: Stream<Command> = actions.closeDrawer$.map(
    () =>
      ({
        type: 'mergeOptions',
        opts: {
          sideMenu: {
            left: {
              visible: false,
            },
          },
        },
      } as Command),
  );

  const toSearch$ = actions.goToSearch$.compose(sample(state$)).map(
    (state) =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Search,
            options: searchNavOpts,
            passProps: {
              selfFeedId: state.selfFeedId,
              selfAvatarUrl: state.selfAvatarUrl,
              lastSessionTimestamp: state.lastSessionTimestamp,
            } as SearchProps,
          },
        },
      } as Command),
  );

  const toIndexing$ = actions.goToIndexing$.map(
    (props) =>
      ({
        type: 'push',
        id: 'mainstack',
        layout: {
          component: {
            name: Screens.Indexing,
            options: indexingScreenNavOpts,
            passProps: props,
          },
        },
      } as Command),
  );

  const toFeedSettings$ = actions.goToFeedSettings$.compose(sample(state$)).map(
    (state) =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.FeedSettings,
            options: feedSettingsScreenNavOptions,
            passProps: {selfFeedId: state.selfFeedId},
          },
        },
      } as Command),
  );

  return xs.merge(
    openDrawer$,
    closeDrawer$,
    toSearch$,
    toIndexing$,
    toFeedSettings$,
    other$,
  );
}
