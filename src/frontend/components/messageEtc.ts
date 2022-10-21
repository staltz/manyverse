// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {Msg} from 'ssb-typescript';
import {Platform} from 'react-native';
import {t} from '~frontend/drivers/localization';
import {DialogSource} from '~frontend/drivers/dialogs';
import {Palette} from '~frontend/global-styles/palette';

export type EtcChoiceId = 'raw-msg';

export interface Sources {
  appear$: Stream<Msg>;
  dialog: DialogSource;
}

export interface Sinks {
  goToRawMsg$: Stream<Msg>;
}

export default function messageEtc(sources: Sources): Sinks {
  const messageEtcChoice$ = sources.appear$
    .map((msg) =>
      sources.dialog
        .showPicker(
          Platform.OS === 'ios'
            ? t('message.call_to_action.etc.dialog_title')
            : undefined,
          undefined,
          {
            items: [
              {label: t('message.call_to_action.view_raw'), id: 'raw-msg'},
            ],
            type: 'listPlain',
            ...Palette.listDialogColors,
            cancelable: true,
            positiveText: '',
            negativeText: '',
            neutralText: '',
          },
        )
        .filter((res) => res.action === 'actionSelect')
        .map((res: any) => ({id: res.selectedItem.id as EtcChoiceId, msg})),
    )
    .flatten();

  const goToRawMsg$ = messageEtcChoice$
    .filter((choice) => choice.id === 'raw-msg')
    .map((choice) => choice.msg);

  return {
    goToRawMsg$,
  };
}
