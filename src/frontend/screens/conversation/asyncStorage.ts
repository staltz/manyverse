// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Command as StorageCommand} from 'cycle-native-asyncstorage';
import sampleCombine from 'xstream/extra/sampleCombine';
import sample from 'xstream-sample';
import dropRepeats from 'xstream/extra/dropRepeats';

export const asyncStorage = (
  compose$: Stream<string>,
  publish$: Stream<unknown>,
  storageKey$: Stream<string>,
): Stream<StorageCommand> => {
  const deleteDraft$: Stream<StorageCommand> = xs
    .merge(
      compose$.filter((message) => message.length === 0),
      publish$,
    )
    .compose(sample(storageKey$))
    .map((key) => ({type: 'removeItem', key}));

  const saveDraft$: Stream<StorageCommand> = xs
    .periodic(1000)
    .compose(sample(compose$))
    .filter((message) => message.length > 1)
    .compose(dropRepeats())
    .compose(sampleCombine(storageKey$))
    .map(([message, key]) => {
      return {type: 'setItem', key, value: message};
    });

  return xs.merge(saveDraft$, deleteDraft$);
};
