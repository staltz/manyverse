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

import {StyleSheet} from 'react-native';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
import {Palette} from '../../global-styles/palette';

export const styles = StyleSheet.create({
  writeMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },

  writeMessageAuthorImage: {
    height: 45,
    width: 45,
    borderRadius: 3,
    backgroundColor: Palette.blue3,
    marginRight: Dimensions.horizontalSpaceSmall,
    marginBottom: Dimensions.verticalSpaceSmall
  },

  writeInput: {
    flex: 1,
    fontSize: Typography.fontSizeBig,
    color: Palette.brand.text
  },

  container: {
    alignSelf: 'stretch',
    flex: 1
  }
});
