class Course:
    def __init__(self, 
                 code: str, 
                 department: str, 
                 class_code: str, 
                 class_name: str, 
                 lecture_code: str, 
                 day_of_week: str,
                 start: str, 
                 end: str, 
                 room: str):
        self.code = code
        self.department = department
        self.class_code = class_code
        self.class_name = class_name
        self.lecture_code = lecture_code
        self.day_of_week = day_of_week
        self.start = start
        self.end = end
        self.room = room

    def __repr__(self):
        return (f"Course(code={self.code}, department='{self.department}', class_code='{self.class_code}', "
                f"class_name='{self.class_name}', lecture_code='{self.lecture_code}', day_of_week='{self.day_of_week}', "
                f"start='{self.start}', end='{self.end}', room='{self.room}')")

    @classmethod
    def from_dataframe(cls, df):
        courses = []
        for _, row in df.iterrows():
            course = cls(
                code=str(row[0]),
                department=row[1],
                class_code=row[2],
                class_name=row[3],
                lecture_code=row[4],
                day_of_week=row[5],
                start=row[6],
                end=row[7],
                room=row[8]
            )
            print(course)
            courses.append(course)
        return courses