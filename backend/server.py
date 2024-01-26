import pandas as pd
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
# Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/classes/")
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
        if year:

            new_classes = []
            for c in classes_json:
                if c['class_code'].startswith(str(year)):
                    new_classes.append(c)

            classes_json = new_classes
        
        # convert the start and end times to times and convert the format from HH.MM to HH:MM
        for c in classes_json:
            if c['start']:
                if '.' in str(c['start']):
                    if len(str(c['start']).split('.')[1]) == 1:
                        c['start'] = str(c['start']) + '0'
                    c['start'] = str(c['start']).replace('.', ':')
                else:
                    c['start'] = str(c['start']) + ':00'
                
                if c['start'].startswith('0'):
                    c['start'] = c['start'][1:]
            if c['end']:
                if '.' in str(c['end']):
                    if len(str(c['end']).split('.')[1]) == 1:
                        c['end'] = str(c['end']) + '0'
                    c['end'] = str(c['end']).replace('.', ':')
                else:
                    c['end'] = str(c['end']) + ':00'
                
                if c['end'].startswith('0'):
                    c['end'] = c['end'][1:]
        return classes_json
    else:
        return {'error': 'department not found'}
