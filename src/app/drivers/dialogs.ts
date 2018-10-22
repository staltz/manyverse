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

import xs, {Stream} from 'xstream';
import DialogAndroid from 'react-native-dialogs';

export type Command =
  | {type: 'dismiss'}
  | {type: 'alert'; title?: string; content?: string; options?: OptionsCommon};

export type OptionsCommon = {
  cancelable?: boolean;
  forceStacking?: boolean;

  title?: string;
  titleColor?: string;

  content?: string;
  contentColor?: string;
  contentIsHtml?: boolean;
  linkColor?: string;

  negativeColor?: string;
  negativeText?: string;

  neutralColor?: string;
  neutralText?: string;

  positiveColor?: string;
  positiveText?: string; // default "OK"
};

export type OptionsPicker = OptionsCommon & {
  items: Array<{label?: string; id?: any}>;
  idKey?: string;
  labelKey?: string;
  neutralIsClear?: boolean;
  selectedId?: any;
  selectedIds?: any[];
  type?: 'listCheckbox' | 'listPlain' | 'listRadio';
  widgetColor?: string;
};

export type AlertAction = {
  action:
    | 'actionDismiss'
    | 'actionNegative'
    | 'actionNeutral'
    | 'actionPositive';
};

export type PickerAction =
  | {action: 'actionNegative' | 'actionNeutral' | 'actionDismiss'}
  | {
      action: 'actionSelect';
      selectedItem: any;
    };

export class DialogSource {
  constructor() {}

  public alert(
    title?: string,
    content?: string,
    options?: OptionsCommon,
  ): Stream<AlertAction> {
    return xs.fromPromise(DialogAndroid.alert(title, content, options));
  }

  public showPicker(
    title?: string,
    content?: string,
    options?: OptionsPicker,
  ): Stream<PickerAction> {
    return xs.fromPromise(DialogAndroid.showPicker(title, content, options));
  }
}

export function dialogDriver(command$: Stream<Command>): DialogSource {
  command$.subscribe({
    next: cmd => {
      if (cmd.type === 'dismiss') {
        DialogAndroid.dismiss();
      }
      if (cmd.type === 'alert') {
        DialogAndroid.alert(cmd.title, cmd.content, cmd.options);
      }
    },
  });

  return new DialogSource();
}
