// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {setItem} from '~frontend/drivers/asyncstorage';
import {FeedFilter} from '~frontend/screens/central/model';

interface Actions {
  updatePublicFeedType$: Stream<FeedFilter>;
}

export default function asyncStorage(actions: Actions) {
  const publicFeedType$ = actions.updatePublicFeedType$.map((feedFilter) => {
    return setItem('publicFeedType', JSON.stringify(feedFilter));
  });

  return publicFeedType$;
}
