// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {setItem} from '~frontend/drivers/asyncstorage';
import {FeedFilter} from '../model';

interface Actions {
  updatePublicTabFilters$: Stream<FeedFilter>;
}

export default function asyncStorage(actions: Actions) {
  const publicFilters$ = actions.updatePublicTabFilters$.map((feedFilter) => {
    return setItem('publicFeedType', JSON.stringify(feedFilter));
  });

  return publicFilters$;
}
