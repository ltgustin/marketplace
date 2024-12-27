// utils/getUserTokens.js
import { db } from '../components/Firebase';
import { doc, getDoc } from "firebase/firestore/lite";

const getUserTokens = async (address, dbName) => {
  try {
    const docRef = doc(db, dbName, address);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const tokens = docSnap.data().tokens;
      localStorage.setItem('totalTokens', tokens);
      return tokens;
    } else {
      console.error(`User with wallet address ${address} not found`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user tokens:", error);
    return null;
  }
};

export default getUserTokens;