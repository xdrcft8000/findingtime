import React, {useState, useEffect, createContext, useContext} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import {Alert, useColorScheme} from 'react-native';
import {darkStyles, lightStyles} from './styles/styles';

type AuthContextData = {
  authData?: AuthData;
  initializing: boolean;
  loading: boolean;
  firstTime: boolean;
  setFirstTime: (value: boolean) => void;
  // isConnected: boolean;
  setLoading: (value: boolean) => void;
  signIn: (email: string, password: string) => Promise<any>;
  createUser: (email: string, password: string, name: string) => Promise<any>;
  signOut(): void;
  deleteUser(): Promise<void>;
  styles: any;
  dark: boolean;
  setDarkMode: (value: boolean) => void;
};

export type AuthData = {
  email: string;
  name: string;
  id: string;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);
type Props = {
  children?: React.ReactNode;
};
const AuthProvider: React.FC<Props> = ({children}) => {
  const DAY_LENGTH = 8;
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [firstTime, setFirstTime] = useState(false);
  const [authData, setAuthData] = useState<AuthData>();
  const colorScheme = useColorScheme();
  const [dark, setDark] = useState(colorScheme === 'dark' ? true : false);
  const styles = dark ? darkStyles : lightStyles;

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(newUser => {
      if (newUser) {
      } else {
      }
    });
    loadStorageData();
    return subscriber; // unsubscribe on unmount
  }, []);

  const loadStorageData = async () => {
    try {
      const storageAuthData = await AsyncStorage.getItem('@AuthData');
      const darkModeData = await AsyncStorage.getItem('@DarkMode');
      if (storageAuthData) {
        setAuthData(JSON.parse(storageAuthData));
      }
      if (darkModeData) {
        setDark(JSON.parse(darkModeData));
      }
    } catch (e) {
      console.log(e);
    } finally {
      setInitializing(false);
    }
  };

  const setDarkMode = async (value: boolean) => {
    setDark(value);
    await AsyncStorage.setItem('@DarkMode', JSON.stringify(value));
  };

  const createUser = async (
    email: string,
    password: string,
    name: string,
  ): Promise<any> => {
    setLoading(true);
    try {
      const newUserCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      await AsyncStorage.setItem(
        '@UserCredential',
        JSON.stringify(newUserCredential),
      );

      console.log('User account created & signed in!');

      await newUserCredential.user.updateProfile({
        displayName: name,
      });

      const userData = {
        email: email,
        name: name,
        id: newUserCredential.user.uid,
      };

      setFirstTime(true);
      setAuthData(userData);
      await AsyncStorage.setItem('@AuthData', JSON.stringify(userData));

      return userData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<any> => {
    setLoading(true);
    try {
      const newUser = await auth().signInWithEmailAndPassword(email, password);
      await AsyncStorage.setItem('@UserCredential', JSON.stringify(newUser));

      const userID = newUser.user.uid;
      const userName = newUser.user.displayName;
      const userEmail = newUser.user.email;

      if (userEmail && userName) {
        const userData = {
          email: userEmail,
          name: userName,
          id: userID,
        };

        setAuthData(userData);
        await AsyncStorage.setItem('@AuthData', JSON.stringify(userData));
        return true;
      } else {
        Alert.alert('Error', 'No email/name saved to this user');
      }
    } catch (error) {
      console.error('Error during sign in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await auth()
        .signOut()
        .then(async () => {
          await AsyncStorage.removeItem('@AuthData');
          setAuthData(undefined);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const deleteUser = async (): Promise<void> => {
    console.log(auth().currentUser?.email);

    try {
      await auth()
        .currentUser?.delete()
        .then(async () => {
          await AsyncStorage.removeItem('@AuthData');
          await AsyncStorage.removeItem('@DarkMode');
          setAuthData(undefined);
          return;
        });
    } catch (error) {
      console.log(error);
    }
  };

  // const addUser = async (
  //   userID: string,
  //   name: string,
  //   email: string,
  // ): Promise<Boolean> => {
  //   const userDoc = {
  //     id: userID,
  //     name: name,
  //     email: email,
  //   };
  //   try {
  //     await firestore()
  //       .collection('Users')
  //       .doc(userID)
  //       .get()
  //       .then(async doc => {
  //         if (doc.exists) {
  //           console.log('User already existed');
  //         } else {
  //           await firestore()
  //             .collection('Users')
  //             .doc(userID)
  //             .set(userDoc)
  //             .then(() => {
  //               console.log('New user created');
  //             });
  //         }
  //       });
  //     return true;
  //   } catch (e: any) {
  //     console.log(e.message);
  //     throw e;
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  return (
    <AuthContext.Provider
      value={{
        authData,
        loading,
        initializing,
        firstTime,
        setFirstTime,
        setLoading,
        signIn,
        createUser,
        signOut,
        deleteUser,
        styles,
        dark,
        setDarkMode,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export {AuthContext, AuthProvider, useAuth};
