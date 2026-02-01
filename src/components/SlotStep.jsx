export default function SlotStep({next,back}){

 const slots=["10:00 AM","12:00 PM","4:00 PM"];

 return(
  <>
   <h2 className="text-3xl mb-8">
    Pick Time Slot
   </h2>

   {slots.map(t=>(
    <button
     key={t}
     onClick={()=>next({slot:t})}
     className="block w-full p-4 
     mb-4 border rounded-lg"
    >
     {t}
    </button>
   ))}

   <button onClick={back}
    className="mt-6 text-gray-400">
    ← Back
   </button>
  </>
 )
}