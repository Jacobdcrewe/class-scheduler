interface Class {
    code: string,
    department: string,
    class_code: string,
    class_name: string,
    lecture_code: string,
    day_of_week: string,
    start: string,
    end: string,
    room?: string,
    instructor?: string,
    overlap_pos?: number
}

export default Class;