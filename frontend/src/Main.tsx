import React from "react";
import Calendar from "./components/Calendar.tsx";

function Main() {
  return (

    <div className="w-screen h-screen bg-black text-neutral-900 p-2 overflow-hidden flex">
      <div className="flex flex-grow rounded-xl bg-neutral-100 overflow-hidden">
        <Calendar start_time={8} end_time={19} calendar_height={800} />
      </div>        
    </div>
  );
}

export default Main;
