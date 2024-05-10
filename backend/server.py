import pandas as pd
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pyparsing import List


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
async def get_classes(year: int = 0, departments: List[str] = ["ENGPHYS"], semester: str = "FALL"):
    if(year == 2):
        departments.append("MATH")
    departments.append("ENGINEER")
    semester = semester.upper()
    classes = read_classes(semester)
    # show teh 3rd column of the excel doc
    # print(classes.iloc[:, 3].head())
    # print(classes['class_name'].head())
    classes_json = []
    if departments:
        departments = [department.upper() for department in departments]
        # print the json object of the classes in the departments
        # set the json object to be only values with departments in the list
        classes_json = json.loads(classes[classes['department'].isin(departments)].to_json(orient='records'))
        print(departments)

    else:
        # print the json object of all classes
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

        # create a new array to return the classes that start with the year
        if year:
            new_classes = []
            for c in classes_json:
                if c['class_code'].startswith(str(year)):
                    new_classes.append(c)
            classes_json = new_classes

        extras = read_extras(year, departments, semester)
        if extras:
            classes_json = classes_json + extras

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

@app.get("/api/departments/")
async def get_departments(year: int = 0):
    classes = read_classes()
    # get the dapartments
    departments = []
    if not classes.empty:
        classes = json.loads(classes.to_json(orient='records'))

        # remove spaces from the class names
        for c in classes:
            if c['class_code']:
                c['class_code'] = c['class_code'].replace(' ', '')
            else:
                print(c)

        if year == 0:
            departments = json.loads(classes['department'].to_json(orient='records'))
        else:
            for c in classes:
                if c['class_code'] and c['class_code'][0] == str(year):
                    departments.append(c['department'])
                # if c['class_code'][0] == str(year):
                    # departments.append(c['department'])            
        
        # remove duplicates and null values
        new_departments = []
        for d in departments:
            if d not in new_departments and d and not d == "Subject":
                new_departments.append(d)
        departments = new_departments
        departments.sort()
    return departments

@app.get("/api/years/")
async def get_years():
    classes = read_classes()
    # get the years
    years = []
    if not classes.empty:
        classes = json.loads(classes.to_json(orient='records'))

        # remove spaces from the class names
        for c in classes:
            if c['class_code']:
                c['class_code'] = c['class_code'].replace(' ', '')
            else:
                print(c)

        for c in classes:
            if c['class_code'] and c['class_code'][0] not in years and c['class_code'][0] != 'C':
                years.append(c['class_code'][0])
        
        # remove duplicates and null values
        new_years = []
        for y in years:
            if y not in new_years and y:
                new_years.append(int(y))
        years = new_years
        years.sort()
    
    return years

@app.get("/api/extra_sections/")
async def get_extra_sections(level: int = 1, semester: str = "FALL"):
    semester=semester.upper()
    return json.loads(json.dumps(read_extra_sections_on_level(level, semester)))


@app.get("/api/extras/")
async def get_extras(level: int = 1, section: str = None, semester: str = "FALL"):
    semester = semester.upper()
    return json.loads(json.dumps(read_extras(level, section, semester)))

def read_classes(semester: str): 
    # load the classes
    if semester == "FALL":
        classes = pd.read_excel('schedulefall.xlsx', sheet_name=0)
    else:
        classes = pd.read_excel('schedulewinter.xlsx', sheet_name=0)

    # rename the columns
    classes.columns = ['code', 'department', 'class_code', 'class_name', 'lecture_code', 'day_of_week', 'start', 'end', 'room']
    return classes

def read_extras(level, section, semester: str):
    # load the extras
    if semester == "FALL":
        extras = pd.read_excel('formattingfall.xlsx', sheet_name=0)    
    else:
        extras = pd.read_excel('formattingwinter.xlsx', sheet_name=0)    
    # rename the columns
    extras.columns = ['code', 'department', 'class_code', 'class_name', 'lecture_code', 'day_of_week', 'start', 'end', 'room']
    extras.dropna(how='all', inplace=True)
    
    # Separate into separate sections based on headings
    sections = []
    current_section = None
    for index, row in extras.iterrows():
        if not isinstance(row['code'], int) and row['code'].startswith('LEVEL'):
            current_section = row['code']
            section_stats = current_section.split()
            lvl = int(section_stats[1])
            sec = ' '.join(section_stats[2:])
            sections.append({'level': lvl, 'section': sec, 'classes': []})
        else:
            if current_section:
                sec = sections[-1]
                sec['classes'].append(row.to_dict())

    # Filter classes based on level and section
    filtered_classes = []
    for s in sections:
        print(s['level'], level)
        print(s['section'], section)
        if s['level'] == level and s['section'] == section:
            filtered_classes = s['classes']
            break
    
    return filtered_classes

def read_extra_sections_on_level(level, semester: str):
    if semester == "FALL":
        extras = pd.read_excel('formattingfall.xlsx', sheet_name=0)
    else:
        extras = pd.read_excel('formattingwinter.xlsx', sheet_name=0)
    
    # rename the columns
    extras.columns = ['code', 'department', 'class_code', 'class_name', 'lecture_code', 'day_of_week', 'start', 'end', 'room']
    extras.dropna(how='all', inplace=True)
    
    # Separate into separate sections based on headings
    sections = []
    current_section = None
    for index, row in extras.iterrows():
        if not isinstance(row['code'], int) and row['code'].startswith('LEVEL'):
            current_section = row['code']
            section_stats = current_section.split()
            section_level = int(section_stats[1])
            section = ' '.join(section_stats[2:])
            if section_level == level:
                sections.append(section)
    return sections