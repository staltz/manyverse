// SPDX-FileCopyrightText: 2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import sample from 'xstream-sample';
import dropRepeats from 'xstream/extra/dropRepeats';
import {removeItem, setItem} from '~frontend/drivers/asyncstorage';

export function asyncStorage(
  compose$: Stream<string>,
  publish$: Stream<unknown>,
  storageKey$: Stream<`privateDraft:${string}`>,
) {
  const deleteDraft$ = xs
    .merge(
      compose$.filter((message) => message.length === 0),
      publish$,
    )
    .compose(sample(storageKey$))
    .map((key) => removeItem(key));

  const resetSaveDraftTimer$: Stream<null> = deleteDraft$
    .mapTo(null)
    .startWith(null);

  const saveDraft$ = resetSaveDraftTimer$
    .map(() => xs.periodic(1000))
    .flatten()
    .compose(sample(compose$))
    .compose(dropRepeats())
    .filter((message) => message.length > 1)
    .compose(sampleCombine(storageKey$))
    .map(([message, key]) => setItem(key, message));

  return xs.merge(saveDraft$, deleteDraft$);
}
