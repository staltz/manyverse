/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
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

import xs, {Stream, Listener} from 'xstream';
import {Keyboard} from 'react-native';

export type Command = 'dismiss';

export enum Event {
  WillShow = 'keyboardWillShow',
  DidShow = 'keyboardDidShow',
  WillHide = 'keyboardWillHide',
  DidHide = 'keyboardDidHide',
  WillChangeFrame = 'keyboardWillChangeFrame',
  DidChangeFrame = 'keyboardDidChangeFrame',
}

export function keyboardDriver(command$: Stream<Command>): Stream<Event> {
  command$.addListener({
    next: x => {
      Keyboard.dismiss();
    },
  });

  return xs.create<Event>({
    start(listener: Listener<Event>) {
      // tslint:disable-next-line:no-string-literal
      Object['values'](Event).forEach((eventType: Event) => {
        Keyboard.addListener(eventType, () => listener.next(eventType));
      });
    },
    stop() {
      // tslint:disable-next-line:no-string-literal
      Object['values'](Event).forEach((eventType: Event) => {
        Keyboard.removeAllListeners(eventType);
      });
    },
  });
}
