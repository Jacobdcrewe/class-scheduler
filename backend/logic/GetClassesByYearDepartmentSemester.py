

from typing import Annotated, Union
from fastapi import Query
import logic.ReadExcelFunctions as ReadExcelFunctions
import json
from models.Semester import Semester
import logic.BasicUtils as BasicUtils
import logic.ClassUtils as ClassUtils
from models.Course import Course
def Query(year: int = 0, departments: Annotated[Union[list[str], None], Query()] = ['ENGPHYS'], semester: Semester = Semester.FALL):
    if(year == 2):
        departments.append("MATH")
    departments.append("ENGINEER")

    # get the classes for the current semester
    classes = ReadExcelFunctions.read_classes(semester)
    # show teh 3rd column of the excel doc
    # print(classes.iloc[:, 3].head())
    # print(classes['class_name'].head())

    classes_json = []
    if departments:
        # convert the departments to uppercase
        departments = [department.upper() for department in departments]


        # print the json object of the classes in the departments
        # set the json object to be only values with departments in the list
        if 'ENGPHYS' not in departments:
            departments.append('ENGPHYS')
        classes_json = json.loads(classes[classes['department'].isin(departments)].to_json(orient='records'))

    else:
        # print the json object of all classes
        classes_json = json.loads(classes.to_json(orient='records'))

    if classes_json != []:
        # remove class if class_code is null
        classes_json = ClassUtils.format_classes(classes_json)

        # create a new array to return the classes that start with the year
        if year:
            new_classes = []
            for c in classes_json:
                if isinstance(c['class_code'], str) and c['class_code'].startswith(str(year)):
                    print('CLASS:', c)
                    new_classes.append(c)
            classes_json = new_classes

        # add the extra sections to the base classes
        extras = ReadExcelFunctions.read_extras(year, departments, semester)

        if extras:
            classes_json += extras

        # if any class has day_of_week = name of day separated by a space (ex. Mo Tue) duplicate object and make them into separate objects (undefined number of spaces)
        classes_json = ClassUtils.create_seperate_classes(classes_json)
        

        return classes_json
    else:
        return {'error': 'department not found'}


