import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
} from 'react';
import auth from '@react-native-firebase/auth';
import {addWeeks, startOfWeek} from 'date-fns';
import firestore from '@react-native-firebase/firestore';
import 'react-native-get-random-values';
import {customAlphabet} from 'nanoid/non-secure';
import {
  GroupData,
  Group,
  SelectionData,
  CompactedAvailability,
  SelectionObject,
} from '../Models';
import {
  getCompactedA,
  timezoneCompactedAvailability,
  timezoneSelection,
  trimSchedule,
} from '../HelperFunctions';
import {useUser} from './User';

type GroupContextData = {
  loading: boolean;
  setLoading: (value: boolean) => void;
  createGroup: (
    name: string,
    duration: number,
    selectionID: string,
  ) => Promise<string>;
  groups: GroupData;
  loadGroup: (selectedGroup: Group) => Promise<void>;
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
  groupSelections: React.MutableRefObject<SelectionData>;
  compactedAvailability: CompactedAvailability;
  setCompactedAvailability: (
    compactedAvailability: CompactedAvailability,
  ) => void;
  durationTemp: number;
  setDurationTemp: (value: number) => void;
  startHour: number;
  endHour: number;
};

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
  const [startHour, setStartHour] = useState<number>(0);
  const [endHour, setEndHour] = useState<number>(0);
  const {defaultTimezone} = useUser();

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
        if (Object.keys(data).length === 0) {
          setLoading(false);
          setGroups({});
          console.log('No groups found');
          return;
        }
        for (const [key, value] of Object.entries(data)) {
          if (value.selections.length < 2) {
            continue;
          }
          const names = Object.keys(value.compactedAvailability);
          //update the compacted availability if it has not been updated this week
          //This could be made better if it was done on each day
          if (
            value.compactedAvailability[names[0]].length !== 768 ||
            value.lastUpdated < startOfWeek(new Date(), {weekStartsOn: 1})
          ) {
            updateGroupCA(
              value.selections,
              value.startDate,
              value.endDate,
              key,
            ).then(newCompactedA => {
              value.compactedAvailability = newCompactedA;
            });
          }
          value.compactedAvailability = timezoneCompactedAvailability(
            value.compactedAvailability,
            defaultTimezone,
          );
        }
        setGroups(data);
        setLoading(false);
      });
    return () => subscriber();
  }, [defaultTimezone]);

  const updateGroupCA = async (
    selectionIDs: string[],
    startDate: any,
    endDate: any,
    groupID: string,
  ) => {
    const newCompactedA = await getCompactedA(selectionIDs, startDate, endDate);
    firestore().collection('Groups').doc(groupID).update({
      compactedAvailability: newCompactedA,
      startHour: firestore.FieldValue.delete(),
      endHour: firestore.FieldValue.delete(),
    });
    return newCompactedA;
  };

  const loadGroup = async (selectedGroup: Group) => {
    const {trimmedSchedule, newStartHour, newEndHour} = trimSchedule(
      selectedGroup.compactedAvailability,
    );
    setStartHour(newStartHour);
    setEndHour(newEndHour);
    setCompactedAvailability(trimmedSchedule);
    setGroup(selectedGroup);
    await getGroupSelections(selectedGroup.selections);
    console.log('Group loaded');
  };

  //FIX
  const createGroup = async (
    name: string,
    duration: number,
    selectionID: string,
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
          duration: duration,
          selections: [selectionID],
          userIDs: [auth().currentUser?.uid],
          adminIDs: [auth().currentUser?.uid],
          code: code,
          lastUpdated: startDate,
        })
        .then(() => {
          console.log('Group added');
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
        const groupData = snapshot.docs[0].data() as Omit<Group, 'id'>;
        const grp: Group = {
          id: snapshot.docs[0].id,
          ...groupData,
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
    let oldGroup: Group;
    try {
      const snapshot = await firestore()
        .collection('Groups')
        .doc(group?.id)
        .get();
      if (!snapshot.exists) {
        throw "Group doesn't exist";
      }
      const groupData = snapshot.data() as Omit<Group, 'id'>;
      oldGroup = {
        id: snapshot.id,
        ...groupData,
      };
      selectionIDs.push(...groupData.selections);
      startDate = groupData.startDate;
      endDate = groupData.endDate;
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }

    const [compactAvailability] = await getCompactedA(
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
          compactedAvailability: compactAvailability,
        });
      const updatedGroup = {
        ...oldGroup,
        userIDs: [...oldGroup.userIDs, userID],
        selections: [...oldGroup.selections, selectionID],
        compactedAvailability: compactAvailability,
      };
      await loadGroup(updatedGroup);
      return true; // Return true if update is successful
    } catch (error) {
      console.error('Error joining group:', error);
      return false; // Return false if update fails
    }
  };

  const getGroupSelections = async (
    groupSelectionIDs: string[],
  ): Promise<void> => {
    const selections: SelectionData = {};
    for (const selectionID of groupSelectionIDs || []) {
      try {
        const snapshot = await firestore()
          .collection('Selections')
          .doc(selectionID)
          .get();
        selections[selectionID] =
          timezoneSelection(
            snapshot.data() as SelectionObject,
            defaultTimezone,
          ) || {};
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
    const [compactAvailability] = await getCompactedA(
      newSelectionIDs,
      group!.startDate,
      group!.endDate,
    );
    try {
      await firestore().collection('Groups').doc(group!.id).update({
        selections: newSelectionIDs,
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
    const [compactAvailability] = await getCompactedA(
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
        if (snapshot.size === 0) {
          res = true;
        } else {
          res = false;
        }
      });
    return res;
  };

  return (
    <GroupContext.Provider
      value={{
        loading,
        setLoading,
        createGroup,
        groups,
        loadGroup,
        getGroup,
        group,
        joinGroup,
        groupSelections,
        leaveGroup,
        changeAvailability,
        deleteGroup,
        setGroup,
        compactedAvailability,
        setCompactedAvailability,
        durationTemp,
        setDurationTemp,
        startHour,
        endHour,
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
