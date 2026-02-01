export default function ConfirmBooking({data,back}){

 return(
  <>
   <h2 className="text-3xl mb-6">
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
    bg-green-600 p-3">
    Confirm & Proceed
   </button>

   <button
    onClick={back}
    className="mt-4 text-gray-400">
    ← Back
   </button>
  </>
 )
}