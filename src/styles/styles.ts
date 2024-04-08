import {StyleSheet} from 'react-native';
import COLOURS from '../../constants/colours';
import {Dimensions} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

const {width, height} = Dimensions.get('window');
const SCREEN_WIDTH = 375;
const FONT_SCALE_FACTOR = width / SCREEN_WIDTH;

const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  findingText: {
    fontSize: 80,
    fontFamily: 'PlayfairDisplay-Regular',
    paddingLeft: '5%',
  },
  timeText: {
    fontSize: 80,
    fontFamily: 'PlayfairDisplay-Regular',
    alignSelf: 'flex-end',
    paddingRight: '5%',
  },
  introText: {
    fontSize: 34 * FONT_SCALE_FACTOR,
    fontFamily: 'PlayfairDisplay-Regular',
    color: COLOURS.white,
    paddingLeft: '5%',
  },
  introSubText: {
    fontFamily: 'GowunDodum-Regular',
    fontSize: 18,
    color: COLOURS.white,
    textAlign: 'right',
    width: '95%',
    paddingTop: '7%',
  },
  icon: {
    color: 'white',
    backgroundColor: 'black',
  },
  textBasic: {
    color: 'black',
  },
  smallText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  SetupErrorMessageText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  adjective: {
    padding: 10,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: 'black',
    color: 'black',
    textAlign: 'center',
    overflow: 'hidden',
    borderRadius: 15,
  },
  adjopacity: {
    paddingHorizontal: 2,
  },
  adjcontainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageSmall: {
    width: 150,
    height: 150,
    borderRadius: 100,
  },

  //PROFILE
  profileImageProfile: {
    width: 90,
    height: 90,
    borderRadius: 100,
  },

  profileName: {
    fontSize: 16,
    paddingTop: 10,
  },

  profileImageList: {
    width: 80,
    height: 80,
    borderRadius: 100,
  },
  textInput: {
    width: '80%',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    borderRadius: 15,
    marginVertical: 5,
    justifyContent: 'center',
    backgroundColor: 'white',
    color: 'black',
    fontSize: 16,
    fontFamily: 'GowunDodum-Regular',
    height: 40,
  },
  textInputTitle: {
    width: '80%',
    fontSize: 16,
    fontFamily: 'GowunDodum-Regular',
    paddingLeft: 5,
  },
  textInputError: {
    width: '80%',
    fontSize: 16,
    fontFamily: 'GowunDodum-Regular',
    textAlign: 'center',
    color: 'red',
  },
  button: {
    width: '80%',
    color: COLOURS.salmon,
    backgroundColor: COLOURS.salmon,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  inactiveButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOURS.darkgrey,
  },
  whiteButton: {
    width: '80%',
    color: 'white',
    backgroundColor: 'white',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },

  buttonText: {
    color: 'black',
    fontSize: 16,
    fontFamily: 'GowunDodum-Regular',
  },
  clearButton: {
    borderWidth: 1,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dropdownText: {
    color: 'black',
    fontSize: 16,
    fontFamily: 'Poppins',
    padding: 10,
    textAlign: 'center',
  },
});

const lightStyles = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: COLOURS.white,
  },
  text: {
    ...commonStyles.text,
    color: 'black',
  },
  findingText: {
    ...commonStyles.findingText,
    color: COLOURS.black,
  },
  timeText: {
    ...commonStyles.timeText,
    color: COLOURS.black,
  },
  icon: {
    color: 'black',
    backgroundColor: 'white',
  },
  textBasic: {
    color: 'black',
  },
  clearButton: {
    ...commonStyles.clearButton,
    borderColor: 'black',
  },
});

const darkStyles = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: COLOURS.black,
  },
  text: {
    ...commonStyles.text,
    color: 'white',
  },
  findingText: {
    ...commonStyles.findingText,
    color: COLOURS.white,
  },
  timeText: {
    ...commonStyles.timeText,
    color: COLOURS.white,
  },

  icon: {
    color: 'white',
    backgroundColor: 'black',
  },
  smallText: {
    ...commonStyles.smallText,
    color: 'white',
  },
  textBasic: {
    color: 'white',
  },
  clearButton: {
    ...commonStyles.clearButton,
    borderColor: 'white',
  },
});

export {lightStyles, darkStyles, commonStyles};
