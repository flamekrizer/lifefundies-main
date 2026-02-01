export default function ConfirmStep({data}){

 return(
  <>
   <h2 className="text-3xl mb-8">
    Confirm Booking
   </h2>

   <div className="space-y-3 text-gray-300">
    <p>Session: {data.session}</p>
    <p>Time: {data.slot}</p>
    <p>Name: {data.name}</p>
    <p>Phone: {data.phone}</p>
   </div>

   <button
    className="mt-8 w-full 
    bg-green-600 p-3 rounded">
    Confirm Booking
   </button>
  </>
 )
}