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
import DialogAndroid = require('react-native-dialogs');

export type Request = {
  title: string;
  content: string;
  category: string;
  positiveText?: string;
  negativeText?: string;
  neutralText?: string;
};

export type Response = {
  type: 'positive' | 'negative' | 'neutral';
  category: string;
};

export function dialogDriver(request$: Stream<Request>): Stream<Response> {
  const response$ = xs.create<Response>();

  request$.addListener({
    next: request => {
      const category = request.category;
      const dialog = new DialogAndroid();
      dialog.set({
        ...request,
        onPositive: () => {
          response$.shamefullySendNext({category, type: 'positive'});
        },
        onNegative: () => {
          response$.shamefullySendNext({category, type: 'negative'});
        },
        onNeutral: () => {
          response$.shamefullySendNext({category, type: 'neutral'});
        },
      });
      dialog.show();
    },
  });

  return response$;
}
