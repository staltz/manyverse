// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {Platform} from 'react-native';
import {FeedId} from 'ssb-typescript';
import {Duration, Toast} from '../../drivers/toast';
import {t} from '../../drivers/localization';
import {DialogSource} from '../../drivers/dialogs';
import {Palette} from '../../global-styles/palette';

export type DialogChoiceId = 'copy-id';

export type Sources = {
  feedId$: Stream<FeedId>;
  appear$: Stream<any>;
  dialog: DialogSource;
};

export type Sinks = {
  clipboard: Stream<string>;
  toast: Stream<Toast>;
};

export default function manageContact$(sources: Sources): Sinks {
  const dialogChoice$ = sources.appear$
    .map(() => {
      const items = [
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

  const copyCypherlink$ = dialogChoice$
    .map(() => sources.feedId$.take(1))
    .flatten();

  const toast$ = copyCypherlink$.mapTo({
    type: 'show',
    message: t('profile.toast.copied_to_clipboard'),
    duration: Duration.SHORT,
  } as Toast);

  return {
    clipboard: copyCypherlink$,
    toast: toast$,
  };
}
