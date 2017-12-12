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

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {State} from './model';
import {Content, AboutContent} from '../../../ssb/types';

export type SSBActions = {
  save$: Stream<null>;
};

/**
 * Define streams of new content to be flushed onto SSB.
 */
export default function ssb(
  state$: Stream<State>,
  actions: SSBActions,
): Stream<Content> {
  const dataToSave$ = actions.save$
    .compose(sampleCombine(state$))
    .map(([_, state]) => state)
    .filter(
      state =>
        (!!state.newName && state.newName !== state.about.name) ||
        (!!state.newDescription && state.newDescription !== state.about.name),
    );

  const newAboutContent$ = dataToSave$.map(state => {
    const content: AboutContent = {
      type: 'about',
      about: state.about.id as string,
    };
    if (state.newName) {
      content.name = state.newName;
    }
    if (state.newDescription) {
      content.description = state.newDescription;
    }
    return content;
  });

  return newAboutContent$;
}
