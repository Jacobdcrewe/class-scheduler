import React , {useState} from "react";
import Calendar from "./components/Calendar.tsx";

function Main() {
  const [year, setYear] = useState(1);
  const [department, setDepartment] = useState("ENGPHYS");
  const [height, setHeight] = useState(800);
  return (

    <div className="w-screen h-screen bg-black text-neutral-900 p-2 overflow-hidden flex">

      <div className="flex flex-grow rounded-xl bg-neutral-100 overflow-hidden">
        <Calendar start_time={8} end_time={19} calendar_height={height} department={department} year={year}/>
      </div>        
    </div>
  );
}

export default Main;
