// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream, Listener, MemoryStream} from 'xstream';
import * as RNLocalize from 'react-native-localize';
const memoize = require('lodash.memoize');
import i18n = require('i18n-js');

import updateBackendLocale from './impl';

interface UpdateCommand {
  defaultLocale: string;
  locale: string;
  translations: Record<string, any>;
}

export type Command = UpdateCommand;

export const t: typeof i18n.t = memoize(
  (key: any, config: any) => i18n.t(key, config),
  (key: any, config: any) => (config ? key + JSON.stringify(config) : key),
);

export class LocalizationSource {
  public readonly loaded$: MemoryStream<boolean>;
  public readonly change$: Stream<void>;

  constructor(loaded$: MemoryStream<boolean>, change$: Stream<void>) {
    this.loaded$ = loaded$;
    this.change$ = change$;
  }
}

export function makeLocalizationDriver() {
  return function localizationDriver(sink: Stream<Command>) {
    const loaded$ = xs.createWithMemory<boolean>();
    loaded$._n(false);

    sink.subscribe({
      next: (cmd) => {
        i18n.fallbacks = true;
        i18n.defaultLocale = cmd.defaultLocale;
        i18n.locale = cmd.locale;
        i18n.translations = cmd.translations;

        (t as any).cache.clear();

        updateBackendLocale({
          cut: t('context_menu.cut'),
          copy: t('context_menu.copy'),
          copyLink: t('context_menu.copy_link'),
          inspect: t('context_menu.inspect'),
          lookUpSelection: t('context_menu.look_up_selection'),
          saveImage: t('context_menu.save_image'),
          saveImageAs: t('context_menu.save_image_as'),
        });
        loaded$._n(true);
      },
    });

    const change$ = xs.create<void>({
      start(listener: Listener<void>) {
        this.fn = () => {
          listener.next();
        };
        RNLocalize.addEventListener('change', this.fn);
      },
      stop() {
        RNLocalize.removeEventListener('change', this.fn);
      },
    });

    return new LocalizationSource(loaded$, change$);
  };
}
