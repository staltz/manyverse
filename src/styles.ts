import {StyleSheet} from 'react-native';
import {Dimensions as Dimens} from './global-styles/dimens';
import {Palette} from './global-styles/palette';

const _tabItem = {
  backgroundColor: Palette.brand.background,
  paddingTop: Dimens.verticalSpaceNormal,
  paddingBottom: Dimens.verticalSpaceNormal
};

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.brand.background
  },

  header: {
    flexDirection: 'row',
    minHeight: 55
  },

  headerIcon: {
    marginLeft: Dimens.horizontalSpaceNormal,
    marginRight: Dimens.horizontalSpaceNormal,
    marginTop: Dimens.verticalSpaceNormal,
    width: Dimens.iconSize,
    height: Dimens.iconSize
  },

  indicatorViewPager: {
    flex: 1,
    flexDirection: 'column-reverse',
    backgroundColor: Palette.brand.backgroundDarker
  },

  searchInput: {
    flex: 1,
    color: 'white'
  },

  tabItem: _tabItem,

  tabItemSelected: {
    ..._tabItem,
    borderBottomWidth: 4,
    borderBottomColor: Palette.brand.backgroundLighterContrast
  },

  pageContainer: {
    backgroundColor: Palette.white,
    justifyContent: 'center',
    alignItems: 'center'
  },

  pagePlaceholder: {
    fontSize: 20,
    textAlign: 'center'
  }
});

export const iconProps = {
  headerIcon: {
    size: Dimens.iconSize,
    color: Palette.white
  },

  tab: {
    size: Dimens.iconSize,
    color: Palette.brand.backgroundDarkerContrast
  },

  tabSelected: {
    size: Dimens.iconSize,
    color: Palette.white
  }
};
