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
import {Dimensions as Dimens} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
import {Palette} from '../../global-styles/palette';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Palette.brand.darkVoidBackground,
    alignSelf: 'stretch',
    flex: 1,
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerText: {
    color: Palette.brand.darkTextWeak,
    fontSize: Typography.fontSizeNormal,
    marginLeft: Dimens.horizontalSpaceBig,
    marginTop: Dimens.verticalSpaceBig,
    marginBottom: Dimens.verticalSpaceBig,
  },

  infoIcon: {
    marginLeft: Dimens.horizontalSpaceSmall,
  },
});

export const iconProps = {
  info: {
    size: Dimens.iconSizeSmall,
    color: Palette.brand.darkTextWeak,
  },
};
