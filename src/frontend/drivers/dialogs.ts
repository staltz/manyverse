// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import Implementation from './dialogs-impl';
import {
  AlertAction,
  OptionsAlert,
  OptionsPicker,
  OptionsPrompt,
  PickerAction,
  PromptAction,
} from './dialogs-types';
export * from './dialogs-types';

export type Command =
  | {type: 'dismiss'}
  | {type: 'alert'; title?: string; content?: string; options?: OptionsAlert};

export class DialogSource {
  constructor() {}

  public alert(
    title?: string,
    content?: string,
    options?: OptionsAlert,
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
