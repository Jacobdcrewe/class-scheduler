import React, { useState, useEffect } from "react";
import Class from "./Class.ts";
import ClassBlock from "./ClassBlock.ts";
import ClassItem from "./ClassItem.tsx";
import {Semester} from "../shared/Semester.ts";
interface CalendarProps {
    start_time: number;
    end_time: number;
    calendar_height: number;
    year: number;
    department: string;
    semester: Semester;
}

const url = "http://localhost:8000";
const getCalendarData = async (year: number, department: string, semester: Semester) => {
    const response = await fetch(`${url}/api/classes/?year=${year}&departments=${department}&semester=${semester}`);
    const data = await response.json();
    return data;

}


function Calendar(props: CalendarProps) {
    const [calendarData, setCalendarData] = useState([]);
    const [classBlocks, setClassBlocks] = useState([]);
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    // create a range from start_time to end_time in 24 hour format
    var timeslot_range = (start, end) => [...Array(end - start + 1)].map((_, i) => start + i);


    // format timeslots to be AM and PM
    const [timeslots, setTimeslots] = useState(timeslot_range(props.start_time, props.end_time).map((x) => {
        if (parseInt(x) < 12) {
            return x + "AM";
        } else if (parseInt(x) === 12) {
            return x + " PM";
        } else {
            return (parseInt(x) - 12) + "PM";
        }
    }))

    useEffect(() => {
        setClassBlocks([]);
        setCalendarData([]);
        const fetchData = async () => {
            const data = await getCalendarData(props.year, props.department, props.semester);
            if (!data.error) {
                setCalendarData(data);
            }
        }
        fetchData();
    }, [props.calendar_height, props.year, props.department, props.semester]);

    // after being given the calendar start and end date and the day of the week, return the classes that are on that day
    // and the height and position of the class block
    useEffect(() => {
        var tempClassBlocks: any = [];

        calendarData.forEach((x: Class) => {
            var day = (days.find((day) => day.includes((x.day_of_week))))
            if (day === undefined) {
                return;
            }
            var start = convertTimeToNumberal(x.start) - props.start_time;
            var end = convertTimeToNumberal(x.end) - props.start_time;
            var block_height = (end - start) * (props.calendar_height - 24) / (props.end_time - props.start_time);
            var num_overlaps = 0;
            if (x.overlap_pos === undefined) {
                x.overlap_pos = 0;
            }
            calendarData.forEach((y: Class) => {

                if (((x.start >= y.start && x.start <= y.end) || (x.end >= y.start && x.end <= y.end)) && x.day_of_week === y.day_of_week) {
                    // console.log(x.class_name + x.start + " overlaps with " + y.start + y.class_name)
                    num_overlaps++;
                    if (x !== y) {
                        if (y.overlap_pos === undefined) {
                            y.overlap_pos = 1;
                        } else {
                            y.overlap_pos += 1;
                        }
                    }
                }
            })

            var wid = document.getElementById(`calendar_${day}`)?.clientWidth || 0;

            tempClassBlocks.push({
                class: x,
                day: day,
                height: block_height,
                top: start * (props.calendar_height - 24) / (props.end_time - props.start_time),
                overlaps: num_overlaps,
                overlap_pos: x.overlap_pos * wid / num_overlaps
            });
        });

        setClassBlocks(tempClassBlocks);
    }, [calendarData, props.calendar_height, props.start_time, props.end_time]);


    function convertTimeToNumberal(time: string) {
        var time_split = time.split(":");
        var hour = parseInt(time_split[0]);
        if (time_split[1].length === 1) {
            time_split[1] = time_split[1] + "0";
        }
        var minute = parseInt(time_split[1]);
        return hour + minute / 60;
    }


    return (
        <div className="w-full h-full flex flex-col overflow-auto relative min-w-[700px]" id="div_to_print">
            <div className="pl-16 flex flex-row w-full sticky top-0 bg-white z-30" id="header_calendar">
                <div className="grow grid grid-cols-5 bg-white gap-4 py-4 px-4">
                    {days.map((day) => (
                        <div key={day + "_day"} className="flex flex-col justify-center items-center">
                            <p className="text-neutral-900 text-xl">{day}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex flex-row flex-grow relative">
                <div className="absolute grow w-full z-10">
                    <div className={`w-full flex flex-col justify-between mt-2 mb-4`} style={{ height: props.calendar_height }}>
                        {timeslots.map((x) => (
                            <div key={x + "_timeslot"} className="flex items-center relative">
                                <div className="w-16">
                                    <p className="text-neutral-400 text-right text-small">{x}</p>
                                </div>
                                <div className="w-full h-[1px] bg-neutral-300 mx-4 "> </div>

                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex grow pl-16" id="body_calendar">
                    <div className="relative grid grid-cols-5 grow gap-x-4 gap-y-[1px] mx-4 mt-5 mb-7">
                        {days.map((day) => (
                            <div className="flex flex-col relative w-full" style={{ height: (props.calendar_height - 24) + "px" }} id={`calendar_${day}`}>
                                {classBlocks.map((x: ClassBlock, index: number) => (
                                    <>
                                        {x.day === day && (
                                            <div className={`flex flex-col justify-center items-center absolute px-2`} style={{ height: x.height, top: x.top + "px", width: (x.overlaps > 0 ? (100 / x.overlaps) : 100) + "%", left: x.overlap_pos }}>
                                                <ClassItem key={x.day + "_" + index} item={x} />
                                            </div>
                                        )}
                                    </>
                                ))}
                            </div>
                        ))}


                    </div>
                </div>

            </div>


        </div>
    );
}

export default Calendar;