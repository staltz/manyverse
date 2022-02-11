// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Platform} from 'react-native';
import {FeedId} from 'ssb-typescript';
import {fromFeedSigil} from 'ssb-uri2';
import {Duration, Toast} from '~frontend/drivers/toast';
import {t} from '~frontend/drivers/localization';
import {DialogSource} from '~frontend/drivers/dialogs';
import {Palette} from '~frontend/global-styles/palette';

export type DialogChoiceId = 'copy-uri' | 'copy-id';

export interface Sources {
  feedId$: Stream<FeedId>;
  appear$: Stream<any>;
  dialog: DialogSource;
}

export interface Sinks {
  clipboard: Stream<string>;
  toast: Stream<Toast>;
}

export default function feedIdDialog(sources: Sources): Sinks {
  const dialogChoice$ = sources.appear$
    .map(() => {
      const items = [
        {
          id: 'copy-uri',
          label: t('profile.call_to_action.copy_uri'),
        },
        {
          id: 'copy-id',
          label: t('profile.call_to_action.copy_cypherlink'),
        },
      ];

      return sources.dialog
        .showPicker(
          Platform.OS === 'ios' ? t('profile.dialog_ssb_id.title') : undefined,
          undefined,
          {
            items,
            type: 'listPlain',
            ...Palette.listDialogColors,
            cancelable: true,
            positiveText: '',
            negativeText: '',
            neutralText: '',
          },
        )
        .filter((res) => res.action === 'actionSelect')
        .map((res: any) => ({id: res.selectedItem.id as DialogChoiceId}));
    })
    .flatten();

  const copyUri$ = dialogChoice$
    .filter((choice) => choice.id === 'copy-uri')
    .map(() => sources.feedId$.take(1))
    .flatten()
    .map((feedId) => fromFeedSigil(feedId));

  const copyCypherlink$ = dialogChoice$
    .filter((choice) => choice.id === 'copy-id')
    .map(() => sources.feedId$.take(1))
    .flatten();

  const copyToClipboard$ = xs.merge(copyCypherlink$, copyUri$);

  const toast$ = copyToClipboard$.mapTo({
    type: 'show',
    message: t('profile.toast.copied_to_clipboard'),
    duration: Duration.SHORT,
  } as Toast);

  return {
    clipboard: copyToClipboard$,
    toast: toast$,
  };
}
