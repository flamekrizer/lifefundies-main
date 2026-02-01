export default function SessionStep({next}){

 const sessions=[
  "Free Guidance",
  "Peer Guidance",
  "Young Mentor",
  "Senior Advisor"
 ];

 return (
  <>
   <h2 className="text-3xl mb-8">Choose Session</h2>

   {sessions.map(s=>(
    <div
     key={s}
     onClick={()=>next({session:s})}
     className="p-6 mb-4 
     border border-white/20
     rounded-xl cursor-pointer
     hover:border-blue-500"
    >
     {s}
    </div>
   ))}
  </>
 )
}