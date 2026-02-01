"use client";
import { useState } from "react";
import SessionStep from "./SessionStep";
import SlotStep from "./SlotStep";
import DetailsStep from "./DetailsStep";
import ConfirmStep from "./ConfirmStep";

export default function BookingFlow() {

  const [step,setStep] = useState(1);
  const [data,setData] = useState({});

  const next = (values)=>{
    setData({...data,...values});
    setStep(step+1);
  };

  return (
    <section className="max-w-3xl mx-auto py-24 px-6">

      {/* PROGRESS */}
      <div className="flex justify-between mb-14">
        {[1,2,3,4].map(n=>(
          <div key={n}
            className={`w-10 h-10 rounded-full 
            flex items-center justify-center
            ${step>=n ? "bg-blue-500" : "bg-white/20"}`}>
            {n}
          </div>
        ))}
      </div>

      {step===1 && <SessionStep next={next}/>}
      {step===2 && <SlotStep next={next} back={()=>setStep(1)}/>}
      {step===3 && <DetailsStep next={next} back={()=>setStep(2)}/>}
      {step===4 && <ConfirmStep data={data}/>}

    </section>
  );
}