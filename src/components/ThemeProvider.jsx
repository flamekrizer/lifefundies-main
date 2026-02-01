"use client"
import {createContext,useState} from "react"

export const ThemeCtx=createContext()

export default function ThemeProvider({children}){
 const [dark,setDark]=useState(true)

 return(
  <ThemeCtx.Provider value={{dark,setDark}}>
   <div className={dark?"bg-black text-white":"bg-white text-black"}>
    {children}
   </div>
  </ThemeCtx.Provider>
 )
}