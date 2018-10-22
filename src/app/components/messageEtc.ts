/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {Stream} from 'xstream';
import {Msg} from 'ssb-typescript';
import {DialogSource} from '../drivers/dialogs';
import {Palette} from '../global-styles/palette';
import {Toast, Duration} from '../drivers/toast';

export type EtcChoiceId = 'copy-id' | 'raw-msg';

export type Sources = {
  appear$: Stream<Msg>;
  dialog: DialogSource;
};

export type Sinks = {
  clipboard: Stream<string>;
  toast: Stream<Toast>;
  goToRawMsg$: Stream<Msg>;
};

export default function messageEtc(sources: Sources): Sinks {
  const messageEtcChoice$ = sources.appear$
    .map(msg =>
      sources.dialog
        .showPicker(undefined, undefined, {
          items: [
            {label: 'Copy cypherlink', id: 'copy-id'},
            {label: 'View raw message', id: 'raw-msg'},
          ],
          type: 'listPlain',
          contentColor: Palette.brand.text,
          cancelable: true,
          positiveText: '',
          negativeText: '',
          neutralText: '',
        })
        .filter(res => res.action === 'actionSelect')
        .map((res: any) => ({id: res.selectedItem.id as EtcChoiceId, msg})),
    )
    .flatten();

  const goToRawMsg$ = messageEtcChoice$
    .filter(choice => choice.id === 'raw-msg')
    .map(choice => choice.msg);

  const copyCypherlink$ = messageEtcChoice$
    .filter(choice => choice.id === 'copy-id')
    .map(choice => choice.msg.key);

  const toast$ = copyCypherlink$.mapTo(
    {
      type: 'show',
      message: 'Copied to clipboard',
      duration: Duration.SHORT,
    } as Toast,
  );

  return {
    clipboard: copyCypherlink$,
    toast: toast$,
    goToRawMsg$,
  };
}
