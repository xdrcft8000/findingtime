/* eslint-disable react-native/no-inline-styles */
/*
 * Copyright (c) 2024 Tayyeb Rafique
 * All rights reserved.
 */
import React, {useRef, useState} from 'react';
import {
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  useColorScheme,
  Keyboard,
  Platform,
  Alert,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {Button, Loading, TextInputTitle} from './components/Button';
import {validateEmail, validateName, validatePassword} from './Validation';
import COLOURS from '../constants/colours';
import {darkStyles, lightStyles} from './styles/styles';
import {useAuth} from './context/Auth';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const {height, width: screenWidth} = Dimensions.get('window');

const LoginSection = ({animatedStyles}: {animatedStyles: any}) => {
  const auth = useAuth();
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = () => {
    Keyboard.dismiss();
    validateLoginForm().then(valid => {
      if (valid) {
        auth
          .signIn(email, password)
          .then(() => {
            console.log('User signed in successfully');
          })
          .catch(err => {
            if (err.code === 'auth/invalid-email') {
              setErrors({...errors, email: 'Invalid email'});
            } else if (err.code === 'auth/invalid-password') {
              setErrors({...errors, password: 'Invalid password'});
            } else if (err.code === 'auth/user-not-found') {
              setErrors({
                ...errors,
                email: 'No account exists with this email',
              });
            } else if (err.code === 'auth/invalid-credential') {
              setErrors({
                email: 'No account exists with these login details',
                password: 'No account exists with these login details',
              });
            }
          });
      }
    });
  };

  const validateLoginForm = async () => {
    const newErrors = {
      email: '',
      password: '',
    };
    let valid = true;
    const em = await validateEmail(email.trim());
    const pw = await validatePassword(password);
    if (em !== 'valid') {
      newErrors.email = em;
      valid = false;
    }
    if (pw !== 'valid') {
      newErrors.password = pw;
      valid = false;
    }
    setErrors(newErrors);

    return valid;
  };

  const changeEmail = () => {
    if (errors.email !== '') {
      setErrors({...errors, email: ''});
    }
  };

  const changePassword = () => {
    if (errors.password !== '') {
      setErrors({...errors, password: ''});
    }
  };

  return (
    <Animated.View
      style={[
        animatedStyles,
        {
          width: '100%',
          height: '100%',
          alignItems: 'center',
          paddingTop: height * 0.02,
        },
      ]}>
      <TextInputTitle
        title={'Email'}
        dark={true}
        error={errors.email}
        containerStyle={{marginTop: 22}}
        value={email}
        onChangeText={setEmail}
        onFocus={changeEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="oneTimeCode"
      />
      <TextInputTitle
        title={'Password'}
        dark={true}
        error={errors.password}
        value={password}
        onChangeText={setPassword}
        onFocus={changePassword}
        textContentType="password"
        secureTextEntry={true}
        autoCapitalize="none"
        autoComplete="current-password"
        keyboardType="default"
      />
      {auth.loading ? (
        <Loading size={20} containerStyle={{marginTop: 18}} />
      ) : (
        <Button
          title={'Sign in'}
          containerStyle={{marginTop: 18}}
          onPress={handleLogin}
        />
      )}
    </Animated.View>
  );
};

const RegisterSection = ({animatedStyles}: {animatedStyles: any}) => {
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [firstname, setFirstname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();

  const changeFirstname = () => {
    if (errors.name !== '') {
      setErrors({...errors, name: ''});
    }
  };

  const changeEmail = () => {
    if (errors.email !== '') {
      setErrors({...errors, email: ''});
    }
  };

  const changePassword = () => {
    if (errors.password !== '') {
      setErrors({...errors, password: ''});
    }
  };

  const handleNewUser = () => {
    Keyboard.dismiss();
    validateRegistrationForm()
      .then(valid => {
        if (valid) {
          auth
            .createUser(email, password, firstname)
            .then(() => {
              // User created successfully
              console.log('User created successfully');
            })
            .catch(err => {
              // Handle specific error codes
              if (err.code === 'auth/email-already-in-use') {
                setErrors({...errors, email: 'Email already in use'});
              } else if (err.code === 'auth/invalid-email') {
                setErrors({...errors, email: 'Invalid email'});
              } else if (err.code === 'auth/weak-password') {
                setErrors({...errors, password: 'Password is too weak'});
              } else if (err.code === 'auth/invalid-password') {
                setErrors({...errors, password: 'Invalid password'});
              } else {
                Alert.alert(
                  'Error',
                  'Unexpected error occurred, please check your internet connection and that your app is updated and try again.',
                );
              }
            });
        }
      })
      .catch(error => {
        console.error('Error validating registration form:', error);
        // Handle validation error
      });
  };

  const validateRegistrationForm = async () => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
    };
    let valid = true;
    const fn = await validateName(firstname.trim());
    const em = await validateEmail(email.trim());
    const pw = await validatePassword(password);
    if (fn !== 'valid') {
      newErrors.name = fn;
      valid = false;
    }
    if (em !== 'valid') {
      newErrors.email = em;
      valid = false;
    }
    if (pw !== 'valid') {
      newErrors.password = pw;
      valid = false;
    }
    setErrors(newErrors);

    return valid;
  };
  return (
    <Animated.View
      style={[
        animatedStyles,
        {
          width: '100%',
          height: '100%',
          alignItems: 'center',
          paddingTop: height * 0.02,
        },
      ]}>
      <TextInputTitle
        title={'Display name'}
        dark={true}
        containerStyle={{marginTop: 22}}
        value={firstname}
        onChangeText={setFirstname}
        onFocus={changeFirstname}
        error={errors.name}
        autoCapitalize="words"
        autoComplete="name-given"
        keyboardType="default"
      />
      <TextInputTitle
        title={'Email (meeting links may be sent here)'}
        dark={true}
        error={errors.email}
        value={email}
        onChangeText={setEmail}
        onFocus={changeEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="oneTimeCode"
      />
      <TextInputTitle
        title={'Password'}
        dark={true}
        error={errors.password}
        value={password}
        onChangeText={setPassword}
        onFocus={changePassword}
        textContentType="password"
        secureTextEntry={true}
        autoCapitalize="none"
        autoComplete="new-password"
        keyboardType="default"
      />
      {auth.loading ? (
        <Loading size={20} containerStyle={{marginTop: 18}} />
      ) : (
        <Button
          title={'Sign up'}
          containerStyle={{marginTop: 22}}
          onPress={handleNewUser}
        />
      )}
    </Animated.View>
  );
};
const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

function SignInScreen(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const styles = isDarkMode ? darkStyles : lightStyles;

  const blackSize = height / 4;
  const blackRadius = height * 0.06;
  const whiteSize = height * 0.15;
  const buttonHeight = height * 0.08;
  const [windowState, setWindowState] = useState('initial');
  const blackProgress = useSharedValue(0);
  const loginProgress = useSharedValue(0);
  const registerProgress = useSharedValue(0);
  const touchStartY = useRef(0);

  const handleForward = (event: any) => {
    touchStartY.current = event.nativeEvent.pageY;
    blackProgress.value = withTiming(1, {
      duration: 400,
      easing: Easing.inOut(Easing.quad),
    });
  };
  const handleBackward = () => {
    if (Keyboard.isVisible()) {
      Keyboard.dismiss();
    } else if (windowState === 'initial') {
      blackProgress.value = withTiming(0, {
        duration: 600,
        easing: Easing.inOut(Easing.quad),
      });
    } else if (windowState === 'login') {
      loginProgress.value = withTiming(0, {
        duration: 600,
        easing: Easing.inOut(Easing.quad),
      });
      setWindowState('initial');
    } else if (windowState === 'register') {
      registerProgress.value = withTiming(0, {
        duration: 600,
        easing: Easing.inOut(Easing.quad),
      });
      setWindowState('initial');
    }
  };

  const handleRegister = () => {
    if (blackProgress.value === 1) {
      registerProgress.value = withTiming(1, {
        duration: 400,
        easing: Easing.inOut(Easing.quad),
      });
      setWindowState('register');
    }
  };

  const handleLogin = () => {
    if (blackProgress.value === 1) {
      loginProgress.value = withTiming(1, {
        duration: 400,
        easing: Easing.inOut(Easing.quad),
      });
      setWindowState('login');
    }
  };

  const animatedBlackStyles = useAnimatedStyle(() => ({
    width: blackSize + blackProgress.value * (screenWidth - blackSize),
    height: blackSize + blackProgress.value * height * 0.5,
    marginBottom: `${height * 0.03 - blackProgress.value * height * 0.125}%`,
    borderRadius: blackRadius - blackProgress.value * 30,
  }));

  const animatedWhiteStyles = useAnimatedStyle(() => ({
    width:
      whiteSize +
      10 +
      blackProgress.value * (screenWidth * 0.8 - whiteSize - 10),
    height:
      whiteSize +
      blackProgress.value * buttonHeight -
      whiteSize * blackProgress.value,
    marginBottom: blackProgress.value * height * 0.5,
    borderRadius: 90 - blackProgress.value * 70,
    // transition out
    opacity: 1 - registerProgress.value - loginProgress.value,
  }));

  const animatedWhite2Styles = useAnimatedStyle(() => ({
    height:
      whiteSize +
      blackProgress.value * buttonHeight -
      whiteSize * blackProgress.value,

    width: whiteSize + blackProgress.value * (screenWidth * 0.8 - whiteSize),
    marginBottom: blackProgress.value * height * 0.4,
    top: blackSize / 2 - whiteSize / 2 + blackProgress.value * height * 0.15,
    borderRadius: 90 - blackProgress.value * 70,
    // transition out
    opacity: 1 - registerProgress.value - loginProgress.value,
  }));

  const animatedTealStyles = useAnimatedStyle(() => ({
    height:
      whiteSize +
      blackProgress.value * buttonHeight -
      whiteSize * blackProgress.value,

    width: whiteSize + blackProgress.value * (screenWidth * 0.8 - whiteSize),
    marginBottom: blackProgress.value * height * 0.4,
    top: blackSize / 2 - whiteSize / 2 + blackProgress.value * height * 0.15,
    borderRadius: 90 - blackProgress.value * 70,
    // transition out
    opacity: 1 - registerProgress.value - loginProgress.value,
    transform: [{translateX: 5 - blackProgress.value * 5}],
  }));

  const animatedTextStyles = useAnimatedStyle(() => ({
    opacity: blackProgress.value * 5 - 4,
  }));

  const animatedTranstionInStyles = useAnimatedStyle(() => ({
    height:
      height -
      (blackSize + height * 0.2) +
      height * 0.06 -
      loginProgress.value * 70 -
      registerProgress.value * 180,
  }));

  const registerInStyles = useAnimatedStyle(() => ({
    opacity: registerProgress.value + loginProgress.value,
  }));

  const animatedContainerStyles = useAnimatedStyle(() => ({
    height:
      blackSize +
      height * 0.2 -
      height * 0.06 +
      loginProgress.value * 70 +
      registerProgress.value * 180,
    padding: `${8 * loginProgress.value + 20 * registerProgress.value}%`,
  }));

  return (
    <KeyboardAwareScrollView
      scrollEnabled={false}
      contentContainerStyle={Platform.OS === 'ios' ? {flex: 1} : null}
      extraHeight={190}
      enableOnAndroid={false}
      enableAutomaticScroll
      // behavior={Platform.OS === 'ios' ? 'position' : 'height'}
      // keyboardVerticalOffset={-30}
      // extraHeight={180}
      // ref={scrollRef}
      // scrollEnabled={false}
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? COLOURS.black : COLOURS.white,
      }}>
      <AnimatedSafeAreaView
        style={[
          animatedTranstionInStyles,
          {
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
        onTouchStart={handleBackward}>
        <Text style={[styles.findingText]}>Finding</Text>
        <Text style={[styles.timeText, {paddingBottom: '5%'}]}>Time</Text>
      </AnimatedSafeAreaView>
      <Animated.View
        style={[
          animatedContainerStyles,
          {
            width: '100%',
            justifyContent: 'flex-end',
            alignItems: 'center',
          },
        ]}>
        <Animated.View
          onTouchMove={event => {
            if (
              touchStartY.current &&
              event.nativeEvent.pageY - touchStartY.current > 20
            ) {
              Keyboard.dismiss();
            }
          }}
          onTouchStart={handleForward}
          style={[
            animatedBlackStyles,
            {
              overflow: 'visible',
              backgroundColor: 'black',
              borderRadius: blackRadius,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}>
          {windowState === 'initial' ? (
            <>
              <Animated.View
                style={[
                  animatedWhiteStyles,
                  {
                    backgroundColor: COLOURS.salmon,
                    borderRadius: 90,
                  },
                ]}>
                <TouchableOpacity
                  onPress={handleLogin}
                  style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Animated.Text
                    style={[
                      styles.buttonText,
                      animatedTextStyles,
                      {fontSize: buttonHeight / 3.3},
                    ]}>
                    Sign in
                  </Animated.Text>
                </TouchableOpacity>
              </Animated.View>
              <Animated.View
                style={[
                  animatedTealStyles,
                  {
                    backgroundColor: COLOURS.teal,
                    borderRadius: 90,
                    position: 'absolute',
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
              />
              <Animated.View
                style={[
                  animatedWhite2Styles,
                  {
                    backgroundColor: 'white',
                    borderRadius: 90,
                    position: 'absolute',
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}>
                <TouchableOpacity
                  onPress={handleRegister}
                  style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Animated.Text
                    style={[
                      styles.buttonText,
                      animatedTextStyles,
                      {fontSize: buttonHeight / 3.3},
                    ]}>
                    Register
                  </Animated.Text>
                </TouchableOpacity>
              </Animated.View>
            </>
          ) : windowState === 'login' ? (
            <LoginSection animatedStyles={registerInStyles} />
          ) : (
            <RegisterSection animatedStyles={registerInStyles} />
          )}
        </Animated.View>
      </Animated.View>
    </KeyboardAwareScrollView>
  );
}

export default SignInScreen;
