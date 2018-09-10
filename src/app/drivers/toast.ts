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
import {ToastAndroid, Platform} from 'react-native';

export type Toast = {
  type: 'show';
  message: string;
  duration: number;
};

export type GravityToast = {
  type: 'showWithGravity';
  message: string;
  duration: number;
  gravity: number;
};

export const Duration = {
  SHORT: ToastAndroid.SHORT,
  LONG: ToastAndroid.LONG,
};

export const Gravity = {
  TOP: ToastAndroid.TOP,
  CENTER: ToastAndroid.CENTER,
  BOTTOM: ToastAndroid.BOTTOM,
};

export function makeToastDriver() {
  return function toastDriver(sink: Stream<Toast | GravityToast>): void {
    if (Platform.OS === 'android') {
      sink.addListener({
        next: t => {
          const args = [
            t.message,
            t.duration,
            (t as GravityToast).gravity,
          ].filter(x => typeof x !== 'undefined');
          (ToastAndroid[t.type] as any)(...args);
        },
      });
    }
  };
}
