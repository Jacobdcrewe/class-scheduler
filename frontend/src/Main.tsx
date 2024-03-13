import React, { useEffect, useState } from "react";
import Calendar from "./components/calendar/Calendar.tsx";
import { MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon, ArrowPathIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const url = "http://localhost:8000";
function Main() {
  const [year, setYear] = useState(3);
  const yearOptions = [1,2,3,4,5];
  const [department, setDepartment] = useState("ENGPHYS");
  const [departmentOptions, setDepartmentOptions] = useState(["ENGPHYS"]);
  const [height, setHeight] = useState(768);


  useEffect(() => {
    const getDepartments = async () => {
      const response = await fetch(`${url}/api/extra_sections/?level=${year}`);
      const data = await response.json();
      if (data) {
        setDepartmentOptions(["ENGPHYS", ...data]);
      }

    }

    getDepartments()
  }, [year])
  const printDocument = () => {
    const input = document.getElementById('div_to_print');
    if (input) {
      html2canvas(input, { height: input.scrollHeight }) // Capture the entire scrollable content
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          console.log(canvas)
          const pdf = new jsPDF({
            orientation: 'l',
            unit: 'px',
            format: [canvas.width, canvas.height]
          });
          // Set width and height of the PDF document to the same as the canvas
          pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
          // pdf.output('dataurlnewwindow');
          pdf.save("download.pdf");
        });
    }
  }
  return (

    <div className="w-screen h-screen bg-black text-neutral-900 p-2 overflow-hidden flex gap-4 flex-col">
      <div className="flex rounded-xl bg-neutral-100 overflow-hidden min-h-16 min-w-[700px]">
        <select className="bg-white rounded-xl px-2 py-1 m-4" value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
          {yearOptions.map((x) => {
            return <option key={x} value={x}>{x}</option>
          })}
        </select>
        <select className="bg-white rounded-xl px-2 py-1 m-4" value={department} onChange={(e) => setDepartment(e.target.value)}>
          {departmentOptions.map((x) => {
            return <option key={x} value={x}>{x}</option>
          })}
        </select>
        <div className="ml-auto mr-4 min-h-12 h-full flex items-center justify-center gap-2">
          <button className=" rounded-xl p2 ml-auto" onClick={() => setHeight(height - 50)}><MagnifyingGlassMinusIcon className="w-8 aspect-square" /></button>
          <button className=" rounded-xl p2 ml-auto" onClick={() => setHeight(height + 50)}><MagnifyingGlassPlusIcon className="w-8 aspect-square" /></button>
          <button className=" rounded-xl p2 ml-auto" onClick={() => setHeight(768)}><ArrowPathIcon className="w-8 aspect-square" /></button>
          <button className=" rounded-xl p2 ml-auto" onClick={() => printDocument()}><ArrowDownTrayIcon className="w-8 aspect-square" /></button>
        </div>

      </div>
      <div className="flex flex-grow rounded-xl bg-neutral-100 overflow-hidden min-w-[700px]">
        <Calendar start_time={8} end_time={19} calendar_height={height} department={department} year={year} />
      </div>
    </div>
  );
}

export default Main;
