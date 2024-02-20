import {StyleSheet} from 'react-native';
import COLOURS from '../../constants/colours';

const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  titleText: {
    fontSize: 20,
    fontFamily: 'Poppins-Regular',
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
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 15,
    paddingVertical: 5,
    marginVertical: 3,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    backgroundColor: 'white',
  },
  button: {
    color: COLOURS.green,
    backgroundColor: COLOURS.green,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
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
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins',
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
    backgroundColor: 'white',
  },
  text: {
    ...commonStyles.text,
    color: 'black',
  },
  titleText: {
    ...commonStyles.titleText,
    color: 'black',
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
  titleText: {
    ...commonStyles.titleText,
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
