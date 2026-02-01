import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useEffect, useState } from "react";


export const useAuth = () => {

  const [user,setUser] = useState(null);

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth,(u)=>{
      setUser(u);
    });

    return ()=>unsub();
  },[]);

  return user;
};