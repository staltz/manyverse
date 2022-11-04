// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {Command} from 'cycle-native-asyncstorage';
import {FeedFilter} from './model';

interface Actions {
  updatePublicTabFilters$: Stream<FeedFilter>;
}

export default function asyncStorage(actions: Actions) {
  const publicFilters$ = actions.updatePublicTabFilters$.map((feedFilter) => {
    const followingOnly = feedFilter === 'following';
    return {
      type: 'setItem',
      key: `followingOnly`,
      value: JSON.stringify(followingOnly),
    } as Command;
  });

  return publicFilters$;
}
