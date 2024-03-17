import React, { useState } from 'react';

export default function ClassItem(props: any) {
    const [classModal, setClassModal] = useState(false);

    function convertTo12Hour(time: string): string {
        const [hours, minutes] = time.split(':');
        let period = 'AM';
        let convertedHours = parseInt(hours);

        if (convertedHours >= 12) {
            period = 'PM';
            if (convertedHours > 12) {
                convertedHours -= 12;
            }
        }

        return `${convertedHours}:${minutes} ${period}`;
    }
    return (
        <>
            <div className={`z-50 fixed top-0 left-0 w-full h-full ${classModal ? 'flex' : 'hidden'} items-center justify-center bg-black bg-opacity-75`}>
                <div className="bg-white p-8 rounded-xl flex items-center justify-center flex-col text-neutral-900 text-xl relative">
                    <button className="absolute top-0 right-2 hover:text-red-600" onClick={() => setClassModal(false)}>x</button>
                    <p>{props.item.class.department} {props.item.class.class_code}</p>
                    <p>{props.item.day}</p>
                    <p>{convertTo12Hour(props.item.class.start)} - {convertTo12Hour(props.item.class.end)}</p>
                    <p>{props.item.class.room}</p>
                    <p>{props.item.class.class_name}</p>
                </div>
            </div>

            <div id={props.item.day + "_" + props.item.class.class_code} className={`z-20 hover:cursor-pointer overflow-hidden overscroll-contain w-full items-center justify-center flex flex-col h-full rounded-xl w-full ${props.item.overlaps > 1 ? 'bg-red-100 outline-red-600' : 'bg-blue-100'} text-center outline outline-blue-200 `} onClick={() => { setClassModal(true)}} >
                <p className="text-neutral-900 text-sm">{props.item.class.department} {props.item.class.class_code}</p>
                <p className="text-neutral-900 text-sm">{props.item.class.start} - {props.item.class.end}</p>
                <p className="text-neutral-900 text-sm ">{props.item.class.room}</p>
            </div>
        </>

    )
}