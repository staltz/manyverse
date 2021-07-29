/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import Implementation from './dialogs-impl';
import {
  AlertAction,
  OptionsCommon,
  OptionsPicker,
  OptionsPrompt,
  PickerAction,
  PromptAction,
} from './dialogs-types';
export * from './dialogs-types';

export type Command =
  | {type: 'dismiss'}
  | {type: 'alert'; title?: string; content?: string; options?: OptionsCommon};

export class DialogSource {
  constructor() {}

  public alert(
    title?: string,
    content?: string,
    options?: OptionsCommon,
  ): Stream<AlertAction> {
    return xs.fromPromise(Implementation.alert(title, content, options));
  }

  public showPicker(
    title?: string,
    content?: string,
    options?: OptionsPicker,
  ): Stream<PickerAction> {
    return xs.fromPromise(Implementation.showPicker(title, content, options));
  }

  public prompt(
    title?: string,
    content?: string,
    options?: OptionsPrompt,
  ): Stream<PromptAction> {
    return xs.fromPromise(Implementation.prompt(title, content, options));
  }
}

export function dialogDriver(command$: Stream<Command>): DialogSource {
  command$.subscribe({
    next: (cmd) => {
      if (cmd.type === 'dismiss') {
        Implementation.dismiss();
      } else if (cmd.type === 'alert') {
        Implementation.alert(cmd.title, cmd.content, cmd.options);
      }
    },
  });

  return new DialogSource();
}
