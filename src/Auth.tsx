import React, {useState, useEffect, createContext, useContext, useRef} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth, {FirebaseAuthTypes, firebase} from '@react-native-firebase/auth';
import {Alert, useColorScheme} from 'react-native';
import firestore from '@react-native-firebase/firestore';
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
  deleteUser(): void;
  styles: any;
  dark: boolean;
  availability: React.MutableRefObject<any[]>;
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
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [firstTime, setFirstTime] = useState(false);
  const [authData, setAuthData] = useState<AuthData>();
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState(colorScheme);
  const dark = theme === 'dark' ? true : false;
  const styles = theme === 'dark' ? darkStyles : lightStyles;
  const availability = useRef(Array(8 * 8 * 4).fill(false));

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
      if (storageAuthData) {
        setAuthData(JSON.parse(storageAuthData));
      }
    } catch (e) {
      console.log(e);
    } finally {
      setInitializing(false);
    }
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

  const deleteUser = async () => {
    try {
      await auth()
        .currentUser?.delete()
        .then(async () => {
          await AsyncStorage.removeItem('@AuthData');
          setAuthData(undefined);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const addUser = async (
    userID: string,
    name: string,
    email: string,
  ): Promise<Boolean> => {
    const userDoc = {
      id: userID,
      name: name,
      email: email,
    };
    try {
      await firestore()
        .collection('Users')
        .doc(userID)
        .get()
        .then(async doc => {
          if (doc.exists) {
            console.log('User already existed');
          } else {
            await firestore()
              .collection('Users')
              .doc(userID)
              .set(userDoc)
              .then(() => {
                console.log('New user created');
              });
          }
        });
      return true;
    } catch (e: any) {
      console.log(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };
  return (
    //This component will be used to encapsulate the whole App,
    //so all components will have access to the Context
    <AuthContext.Provider
      value={{
        authData,
        loading,
        initializing,
        firstTime,
        setFirstTime,
        // isConnected,
        setLoading,
        signIn,
        createUser,
        signOut,
        deleteUser,
        styles,
        dark,
        availability,
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
