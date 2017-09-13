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

function xsFromPullStream<T>(pullStream: any): Stream<T> {
  return xs.create({
    start(listener: Listener<T>): void {
      const drain = function drain(read: Function) {
        read(null, function more(end: any | boolean, data: T) {
          if (end === true) {
            listener.complete();
            return;
          }
          if (end) {
            listener.error(end);
            return;
          }
          listener.next(data);
          read(null, more);
        });
      };
      try {
        drain(pullStream);
      } catch (e) {
        listener.error(e);
      }
    },
    stop(): void {}
  });
}

export default xsFromPullStream;
