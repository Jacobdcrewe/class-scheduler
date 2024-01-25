import pandas as pd
import json
from fastapi import FastAPI


app = FastAPI()

@app.get("/classes/")
async def get_classes(year: int = 1, department = None):
    # load the classes
    classes = pd.read_excel('schedule.xlsx', sheet_name='sheet1')

    # rename the columns
    classes.columns = ['code', 'department', 'class_code', 'class_name', 'lecture_code', 'day_of_week', 'start', 'end', 'room', 'instructor']
    # show teh 3rd column of the excel doc
    # print(classes.iloc[:, 3].head())
    # print(classes['class_name'].head())

    classes_json = []
    if department:
        department = department.upper()
         # print the json object of the classes in the ENGPHYS department
        # set the json object to be only values with department ENGPHYS
        classes_json = json.loads(classes[classes['department'] == department].to_json(orient='records'))

    else:
        # print the json object of the classes in the ENGPHYS department
        # set the json object to be only values with department ENGPHYS
        classes_json = json.loads(classes.to_json(orient='records'))
        if classes_json != []:
            # remove class if class_code is null
            new_classes = []
            for c in classes_json:
                if c['class_code']:
                    new_classes.append(c)
            classes_json = new_classes
    
       
    if classes_json != []:
        # remove spaces from the class names
        for c in classes_json:
            if c['class_code']:
                c['class_code'] = c['class_code'].replace(' ', '')
            else:
                print(c)

        # if any class has day_of_week = name of day separated by a space (ex. Mo Tue) duplicate object and make them into separate objects (undefined number of spaces)
        new_classes = []
        for c in classes_json:
            if c['day_of_week'] and ' ' in c['day_of_week']:
                days = c['day_of_week'].split(' ')
                for d in days:
                    new_c = c.copy()
                    new_c['day_of_week'] = d
                    new_classes.append(new_c)
            else:
                new_classes.append(c)

        classes_json = new_classes
        
        # createa a new array to return the classes that start with the year
        new_classes = []
        for c in classes_json:
            if c['class_code'].startswith(str(year)):
                new_classes.append(c)

        classes_json = new_classes
        return classes_json
    else:
        return {'error': 'department not found'}






