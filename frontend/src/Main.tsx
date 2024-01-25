import React from "react";
import Calendar from "./components/Calendar.tsx";

function Main() {
  return (
    <div className="w-screen h-screen bg-black text-white p-2">
      <div className="w-full h-full rounded-xl bg-neutral-200 overflow-hidden overscroll-contain">
        <Calendar />
      </div>        
    </div>
  );
}

export default Main;
