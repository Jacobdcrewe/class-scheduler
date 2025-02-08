import saveAs from "file-saver";
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, PageOrientation, TextRun, PageSize } from "docx";

const generateScheduleDoc = (organizedSchedule) => {
    const daysOfWeek = ["Mo", "Tu", "We", "Th", "Fr"]; // Adjust as needed
    const daysOfWeekLong = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]; // Adjust as needed

    const timeSlots = [
        { start: 8 * 60 + 30, end: 9 * 60 + 30, label: "8:30 AM - 9:20 AM" },
        { start: 9 * 60 + 30, end: 10 * 60 + 30, label: "9:30 AM - 10:20 AM" },
        { start: 10 * 60 + 30, end: 11 * 60 + 30, label: "10:30 AM - 11:20 AM" },
        { start: 11 * 60 + 30, end: 12 * 60 + 30, label: "11:30 AM - 12:20 PM" },
        { start: 12 * 60 + 30, end: 13 * 60 + 30, label: "12:30 PM - 1:20 PM" },
        { start: 13 * 60 + 30, end: 14 * 60 + 30, label: "1:30 PM - 2:20 PM" },
        { start: 14 * 60 + 30, end: 15 * 60 + 30, label: "2:30 PM - 3:20 PM" },
        { start: 15 * 60 + 30, end: 16 * 60 + 30, label: "3:30 PM - 4:20 PM" },
        { start: 16 * 60 + 30, end: 17 * 60 + 30, label: "4:30 PM - 5:20 PM" },
        { start: 17 * 60 + 30, end: 18 * 60 + 30, label: "5:30 PM - 6:20 PM" },
        { start: 18 * 60 + 30, end: 19 * 60 + 30, label: "6:30 PM - 7:20 PM" },
        { start: 19 * 60 + 30, end: 20 * 60 + 30, label: "7:30 PM - 8:20 PM" },
        { start: 20 * 60 + 30, end: 21 * 60 + 30, label: "8:30 PM - 9:20 PM" },
        { start: 21 * 60 + 30, end: 22 * 60 + 30, label: "9:30 PM - 10:20 PM" }
    ];
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

    const convertTime = (time) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes; // Convert to total minutes
    };

    const tableRows = [
        new TableRow({ // Header row
            children: [
                new TableCell({ 
                    width: { size: 10, type: WidthType.NIL }, 
                    children: [new Paragraph("Time Slots")],
                    margins: { top: 100, bottom: 100, left: 150, right: 150 } // Padding
                }),
                ...daysOfWeekLong.map(day => new TableCell({ 
                    width: { size: 17, type: WidthType.PERCENTAGE }, 
                    children: [new Paragraph({ children: [new TextRun({ text: day })] })],
                    margins: { top: 100, bottom: 100, left: 150, right: 150 } // Padding
                }))
            ]
        }),
        ...timeSlots.map(({ start: slotStart, end: slotEnd, label }) => {
            return new TableRow({
                children: [
                    new TableCell({ 
                        width: { size: 10, type: WidthType.NIL },
                        children: [new Paragraph(label)], // Time slot label
                        margins: { top: 100, bottom: 100, left: 150, right: 150 } // Padding
                    }),
                    ...daysOfWeek.map(day => {
                        const classes = (organizedSchedule[day] || []).flat().filter(cls => {
                            const clsStart = convertTime(cls.start);
                            const clsEnd = convertTime(cls.end);
                            return clsStart < slotEnd && clsEnd > slotStart;
                        });

                        // Format as "Class Name (X hrs)" if it spans multiple slots
                        const classParagraphs = classes.flatMap(cls => {
                            const clsStart = convertTime(cls.start);
                            const clsEnd = convertTime(cls.end);
                            const durationHrs = Math.round((clsEnd - clsStart) / 60);
                            
                            return [
                                new Paragraph({ children: [new TextRun({ text: `${cls.department} ${cls.class_code} (${cls.lecture_code}) ${cls.class_name} - (${durationHrs} hrs) - ${convertTo12Hour(cls.start)}`, bold: true })] }),
                                new Paragraph("") // Extra newline
                            ];
                        });
                        
                        // Remove the last empty paragraph to avoid unnecessary trailing space
                        if (classParagraphs.length > 0) {
                            classParagraphs.pop();
                        }
                        
                        return new TableCell({ 
                            children: classParagraphs.length ? classParagraphs : [new Paragraph("-")],
                            margins: { top: 100, bottom: 100, left: 150, right: 150 } // Padding
                        });
                    })
                ]
            });
        })
    ];

    const padding = 150;
    // Create the document
    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: padding,
                        right: padding,
                        bottom: padding,
                        left: padding
                    },
                    size: {
                        orientation: PageOrientation.LANDSCAPE, // Set to landscapewo\
                        height: "16in",
                        width: "11.3in"
                    }
                }
            },
            children: [
                new Paragraph("Class Schedule"),
                new Table({ rows: tableRows })
            ]
        }]
    });

    // Generate and download the .docx file
    Packer.toBlob(doc).then(blob => {
        saveAs(blob, "Class_Schedule.docx");
    });
};

export default generateScheduleDoc;
