import React, { useState, useEffect } from "react";
import Class from "./Class.ts";
import ClassBlock from "./ClassBlock.ts";
interface CalendarProps {
    start_time: number;
    end_time: number;
    calendar_height?: number;
    year: number;
    department: string;
}

const url = "http://localhost:8000";
const getCalendarData = async (year: number, department: string) => {
    const response = await fetch(`${url}/api/classes/?year=${year}&department=${department}`);
    const data = await response.json();
    return data;

}


function Calendar(props: CalendarProps) {
    const calendarHeight = props.calendar_height ? props.calendar_height : 868;
    const [calendarData, setCalendarData] = useState([]);
    const [classBlocks, setClassBlocks] = useState([]);
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    // create a range from start_time to end_time in 24 hour format
    var timeslot_range = (start, end) => [...Array(end - start + 1)].map((_, i) => start + i);


    // format timeslots to be AM and PM
    var timeslots = timeslot_range(props.start_time, props.end_time).map((x) => {
        if (parseInt(x) < 12) {
            return x + "AM";
        } else if (parseInt(x) === 12) {
            return x + " PM";
        } else {
            return (parseInt(x) - 12) + "PM";
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            const data = await getCalendarData(props.year, props.department);
            setCalendarData(data);
        }
        fetchData();
    }, []);

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
            var block_height = (end - start) * (calendarHeight - 24) / (props.end_time - props.start_time);
            var num_overlaps = 0;
            if(x.overlap_pos === undefined) {
                x.overlap_pos = 0;
            }
            calendarData.forEach((y: Class) => {
                
                if (((x.start >= y.start && x.start <= y.end) || (x.end >= y.start && x.end <= y.end)) && x.day_of_week === y.day_of_week) {
                    console.log(x.class_name + x.start + " overlaps with " + y.start + y.class_name)
                    num_overlaps++;
                    if(x != y) {
                        if(y.overlap_pos === undefined) {
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
                top: start * (calendarHeight - 24) / (props.end_time - props.start_time),
                overlaps: num_overlaps,
                overlap_pos: x.overlap_pos * wid/ num_overlaps
            });
        });

        setClassBlocks(tempClassBlocks);
    }, [calendarData, calendarHeight, props.start_time, props.end_time]);


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
        <div className="w-full h-full flex flex-col overflow-auto relative min-w-[700px]">
            <div className="pl-16 flex flex-row w-full sticky top-0 bg-white z-50">
                <div className="grow grid grid-cols-5 bg-white gap-4 py-4 px-4">
                    {days.map((day) => (
                        <div key={day + "_day"} className="flex flex-col justify-center items-center">
                            <p className="text-neutral-900 text-xl">{day}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex flex-row flex-grow relative z-0">
                <div className="absolute grow w-full">
                    <div className={`w-full flex flex-col justify-between mt-2 mb-4 z-10`} style={{ height: calendarHeight }}>
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
                <div className="flex grow pl-16 z-20 ">
                    <div className="grid grid-cols-5 grow gap-x-4 gap-y-[1px] mx-4 mt-5 mb-7">
                        {days.map((day) => (
                            <div className="flex flex-col relative w-full" style={{ height: (calendarHeight - 24) + "px" }} id={`calendar_${day}`}>
                                {classBlocks.map((x: ClassBlock) => (
                                    <div className={`flex flex-col justify-center items-center absolute px-2`} style={{ height: x.height, top: x.top + "px", width: (x.overlaps > 0 ? (100/x.overlaps) : 100) + "%", left: x.overlap_pos}}>
                                        {x.day === day && (
                                            <div className={`overflow-hidden overscroll-contain w-full items-center justify-center flex flex-col h-full rounded-xl w-full ${x.overlaps > 1 ? 'bg-red-100 outline-red-600' : 'bg-blue-100'} text-center outline outline-blue-200 `} >
                                                <p className="text-neutral-900 text-sm">{x.class.class_name}</p>
                                                <p className="text-neutral-900 text-sm">{x.class.start} - {x.class.end}</p>
                                                <p className="text-neutral-900 text-sm ">{x.class.room}</p>
                                            </div>
                                        )}
                                    </div>
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