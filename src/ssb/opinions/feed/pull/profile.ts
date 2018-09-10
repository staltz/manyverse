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

const nest = require('depnest');
const pull = require('pull-stream');

const feedProfileOpinion = {
  gives: nest('feed.pull.profile'),
  needs: nest('sbot.pull.userFeed', 'first'),
  create(api: any) {
    return nest('feed.pull.profile', (id: string) => {
      // handle last item passed in as lt
      return (opts: any) => {
        const moreOpts = {
          ...opts,
          id,
          lt: opts.lt && opts.lt.value ? opts.lt.value.sequence : opts.lt,
        };
        return pull(
          api.sbot.pull.userFeed(moreOpts),
          // pull.filter(msg => {
          //   return typeof msg.value.content !== 'string';
          // })
        );
      };
    });
  },
};

export default feedProfileOpinion;
