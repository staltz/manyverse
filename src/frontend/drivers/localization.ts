// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream, Listener} from 'xstream';
import * as RNLocalize from 'react-native-localize';
const memoize = require('lodash.memoize');
import i18n = require('i18n-js');

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

export function makeLocalizationDriver() {
  return function localizationDriver(sink: Stream<Command>): Stream<void> {
    sink.subscribe({
      next: (cmd) => {
        i18n.fallbacks = true;
        i18n.defaultLocale = cmd.defaultLocale;
        i18n.locale = cmd.locale;
        i18n.translations = cmd.translations;
        (t as any).cache.clear();
      },
    });

    return xs.create<void>({
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
  };
}
