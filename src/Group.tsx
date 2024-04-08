import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
} from 'react';
import auth from '@react-native-firebase/auth';
import {addWeeks, differenceInWeeks, format, startOfWeek} from 'date-fns';
import firestore from '@react-native-firebase/firestore';
import 'react-native-get-random-values';
import {customAlphabet} from 'nanoid/non-secure';

type GroupContextData = {
  loading: boolean;
  setLoading: (value: boolean) => void;
  createGroup: (
    name: string,
    duration: number,
    selectionID: string,
    startHour: number,
    endHour: number,
  ) => Promise<string>;
  groups: GroupData;
  getGroup: (code: string) => Promise<string[]>;
  group: Group | null;
  setGroup: (group: Group) => void;
  joinGroup: (selection: string, userID: string) => Promise<boolean>;
  changeAvailability: (
    selectionID: string,
    userSelections: string[],
  ) => Promise<void>;
  leaveGroup: (selectionIDs: string[], userID: string) => Promise<boolean>;
  deleteGroup: (groupID: string) => Promise<boolean>;
  getGroupSelections: () => Promise<void>;
  groupSelections: React.MutableRefObject<SelectionData>;
  getClosestDate: (dateKey: string, selection: {}) => string;
  getDate: (date: Date) => string;
  compactedAvailability: CompactedAvailability;
  setCompactedAvailability: (
    compactedAvailability: CompactedAvailability,
  ) => void;
  durationTemp: number;
  setDurationTemp: (value: number) => void;
};

interface GroupData {
  [id: string]: {
    [key: string]: any; // Allow additional dynamic properties
  };
}

export interface Group {
  adminIDs: string[];
  id: string;
  name: string;
  startDate: any;
  endDate: any;
  selections: string[];
  userIDs: string[];
  duration: number;
  startHour: number;
  endHour: number;
  code: string;
  compactedAvailability: CompactedAvailability;
}

interface SelectionData {
  [id: string]: {
    [key: string]: any; // Allow additional dynamic properties
  };
}

interface CompactedAvailability {
  [key: string]: number[];
}

const GroupContext = createContext<GroupContextData>({} as GroupContextData);
type Props = {
  children?: React.ReactNode;
};
const GroupProvider: React.FC<Props> = ({children}) => {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<GroupData>({});
  const [group, setGroup] = useState<Group | null>(null);
  const groupSelections = useRef<SelectionData>({});
  const [compactedAvailability, setCompactedAvailability] =
    useState<CompactedAvailability>({});
  const [durationTemp, setDurationTemp] = useState<number>(0);

  useEffect(() => {
    //firebase snapshot query
    const subscriber = firestore()
      .collection('Groups')
      .where('userIDs', 'array-contains', auth().currentUser?.uid)
      .onSnapshot(querySnapshot => {
        const data: GroupData = querySnapshot.docs.reduce(
          (acc: GroupData, doc) => {
            acc[doc.id] = {
              ...doc.data(),
            };
            return acc;
          },
          {},
        );
        setGroups(data);
        setLoading(false);
        // setSelectionTitles(titles);
      });
    return () => subscriber();
  }, []);

  const createGroup = async (
    name: string,
    duration: number,
    selectionID: string,
    startHour: number,
    endHour: number,
  ) => {
    const startDate = startOfWeek(new Date(), {weekStartsOn: 1});
    const endDate = addWeeks(startDate, duration);
    const code = await generateReferralCode();
    return new Promise<string>((resolve, reject) => {
      firestore()
        .collection('Groups')
        .add({
          name: name,
          startDate: startDate,
          endDate: endDate,
          startHour: startHour,
          endHour: endHour,
          duration: duration,
          selections: [selectionID],
          userIDs: [auth().currentUser?.uid],
          adminIDs: [auth().currentUser?.uid],
          code: code,
        })
        .then(() => {
          resolve(code); // Resolve with the document ID
        })
        .catch(error => {
          console.error('Error adding group: ', error);
          reject(error); // Reject with the error
        });
    });
  };

  const getGroup = async (code: string): Promise<string[]> => {
    try {
      const snapshot = await firestore()
        .collection('Groups')
        .where('code', '==', code)
        .get();

      if (snapshot.size === 0) {
        // Return null if no group found with the given code
        throw 'No group found with the given code';
      } else {
        // Return the first group found with the given code
        const groupData = snapshot.docs[0].data();
        const grp: Group = {
          adminIDs: groupData.adminIDs,
          id: snapshot.docs[0].id,
          name: groupData.name,
          startDate: groupData.startDate, // Assuming startDate and endDate are Firestore Timestamps
          endDate: groupData.endDate,
          selections: groupData.selections,
          userIDs: groupData.userIDs,
          duration: groupData.duration,
          startHour: groupData.startHour,
          endHour: groupData.endHour,
          code: groupData.code,
          compactedAvailability: groupData.compactedAvailability,
        };
        setGroup(grp);
        return groupData.userIDs;
      }
    } catch (error) {
      console.error('Error fetching group:', error);
      throw 'Error fetching group' + error;
    }
  };

  const joinGroup = async (
    selectionID: string,
    userID: string,
  ): Promise<boolean> => {
    const selectionIDs = [selectionID];
    let startDate = new Date();
    let endDate = new Date();
    try {
      const snapshot = await firestore()
        .collection('Groups')
        .doc(group?.id)
        .get();
      if (!snapshot.exists) {
        throw "Group doesn't exist";
      }
      const groupData = snapshot.data()!;
      selectionIDs.push(...groupData.selections);
      startDate = groupData.startDate;
      endDate = groupData.endDate;
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
    const [compactAvailability, newStartHour, newEndHour] = await getCompactedA(
      selectionIDs,
      startDate,
      endDate,
    );

    try {
      await firestore()
        .collection('Groups')
        .doc(group?.id)
        .update({
          userIDs: firestore.FieldValue.arrayUnion(userID),
          selections: firestore.FieldValue.arrayUnion(selectionID),
          startHour: newStartHour,
          endHour: newEndHour,
          compactedAvailability: compactAvailability,
        });
      return true; // Return true if update is successful
    } catch (error) {
      console.error('Error joining group:', error);
      return false; // Return false if update fails
    }
  };

  const getCompactedA = async (
    selectionIDs: string[],
    startDate: any,
    endDate: any,
  ) => {
    let newStartHour = 24;
    let newEndHour = 0;
    const selections = [];
    for (let i = 0; i < selectionIDs.length; i++) {
      const selection = await firestore()
        .collection('Selections')
        .doc(selectionIDs[i])
        .get()
        .then(doc => {
          return doc.data()!;
        });
      selections.push(selection);
      newStartHour = Math.min(newStartHour, selection.startHour);
      newEndHour = Math.max(newEndHour, selection.endHour);
    }
    const dayLength = newEndHour - newStartHour;
    const duration = differenceInWeeks(endDate.toDate(), startDate.toDate());
    const arrayOfZeros = new Array(dayLength * 32).fill(0);
    const compactedA: CompactedAvailability = {};
    const fieldsToRemove = [
      'userID',
      'startHour',
      'endHour',
      'title',
      'userName',
    ];
    for (let i = 0; i < selections.length; i++) {
      const selection = selections[i];
      const currentName = selection.userName;
      const startIndex = (selection.startHour - newStartHour) * 32;
      fieldsToRemove.forEach(field => {
        delete selection[field];
      });
      compactedA[currentName] = [...arrayOfZeros];
      for (let j = 0; j < duration; j++) {
        const closestDateKey = getClosestDate(
          getDate(addWeeks(group!.startDate.toDate(), j)),
          selection,
        );
        const numberArray = selection[closestDateKey].map((value: boolean) =>
          value ? 1 : 0,
        );
        const addedArray = [...compactedA[currentName]];
        for (let k = 0; k < numberArray.length; k++) {
          addedArray[k + startIndex] =
            addedArray[k + startIndex] + numberArray[k];
        }
        compactedA[currentName] = addedArray;
      }
    }
    return [compactedA, newStartHour, newEndHour];
  };

  const getGroupSelections = async (): Promise<void> => {
    const selections: SelectionData = {};
    for (const selectionID of group?.selections || []) {
      try {
        const snapshot = await firestore()
          .collection('Selections')
          .doc(selectionID)
          .get();
        selections[selectionID] = snapshot.data() || {};
      } catch (error) {
        console.error('Error fetching selection:', error);
      }
    }
    groupSelections.current = selections;
  };

  const changeAvailability = async (
    newSelectionID: string,
    userSelections: string[],
  ): Promise<void> => {
    const selectionID = userSelections.find(id =>
      group!.selections!.includes(id),
    );
    const newSelectionIDs = group!.selections.filter(
      item => item !== selectionID,
    );
    newSelectionIDs.push(newSelectionID);
    const [compactAvailability, newStartHour, newEndHour] = await getCompactedA(
      newSelectionIDs,
      group!.startDate,
      group!.endDate,
    );
    try {
      await firestore().collection('Groups').doc(group!.id).update({
        selections: newSelectionIDs,
        startHour: newStartHour,
        endHour: newEndHour,
        compactedAvailability: compactAvailability,
      });
      return;
    } catch (error) {
      console.error('Error leaving group:', error);
      throw 'Error leaving group:' + error;
    }
  };

  const leaveGroup = async (
    userSelections: string[],
    userID: string,
  ): Promise<boolean> => {
    if (group!.selections.length === 1) {
      deleteGroup(group!.id);
      return true;
    }
    const selectionID = userSelections.find(id =>
      group!.selections!.includes(id),
    );
    const newSelectionIDs = group!.selections.filter(
      item => item !== selectionID,
    );
    const [compactAvailability, newStartHour, newEndHour] = await getCompactedA(
      newSelectionIDs,
      group!.startDate,
      group!.endDate,
    );
    try {
      await firestore()
        .collection('Groups')
        .doc(group!.id)
        .update({
          userIDs: firestore.FieldValue.arrayRemove(userID),
          selections: firestore.FieldValue.arrayRemove(selectionID),
          startHour: newStartHour,
          endHour: newEndHour,
          compactedAvailability: compactAvailability,
        });
      return true;
    } catch (error) {
      console.error('Error leaving group:', error);
      return false;
    }
  };

  const deleteGroup = async (groupID: string): Promise<boolean> => {
    try {
      await firestore().collection('Groups').doc(groupID).delete();
      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      return false;
    }
  };

  const generateReferralCode = async () => {
    const nan = customAlphabet('ABCDEFGHJKLMNPQRSTUVXYZ23456789', 5);
    let code = nan();
    while (!(await checkCodeFresh(code))) {
      code = nan();
    }
    return code;
  };

  const checkCodeFresh = async (code: string): Promise<boolean> => {
    let res = false;
    await firestore()
      .collection('Groups')
      .where('code', '==', code)
      .get()
      .then(snapshot => {
        if (snapshot.size == 0) {
          res = true;
        } else {
          res = false;
        }
      });
    return res;
  };

  const getClosestDate: (dateKey: string, selection: {}) => string = (
    dateKey: string,
    selection: {},
  ) => {
    if (dateKey in selection) {
      return dateKey;
    }
    const selectionDates = Object.keys(selection).sort();
    let closestDate: string = '';
    for (let i = selectionDates.length - 1; i >= 0; i--) {
      if (selectionDates[i] < dateKey) {
        closestDate = selectionDates[i];
        return closestDate;
      }
    }
    return selectionDates[0];
  };

  const getDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  return (
    //This component will be used to encapsulate the whole App,
    //so all components will have access to the Context
    <GroupContext.Provider
      value={{
        loading,
        setLoading,
        createGroup,
        groups,
        getGroup,
        group,
        joinGroup,
        getGroupSelections,
        groupSelections,
        leaveGroup,
        changeAvailability,
        deleteGroup,
        setGroup,
        getClosestDate,
        getDate,
        compactedAvailability,
        setCompactedAvailability,
        durationTemp,
        setDurationTemp,
      }}>
      {children}
    </GroupContext.Provider>
  );
};

function useGroup(): GroupContextData {
  const context = useContext(GroupContext);

  if (!context) {
    throw new Error('useGroup must be used within an GroupProvider');
  }

  return context;
}

export {GroupContext, GroupProvider, useGroup};
