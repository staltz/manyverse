/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
