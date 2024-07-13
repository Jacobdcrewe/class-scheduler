import logic.ReadExcelFunctions as ReadExcelFunctions
import json

def get_years():
    classes = ReadExcelFunctions.read_classes()
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

# get the available departments based on the year
def get_departments(year: int = 0):
    classes = ReadExcelFunctions.read_classes()
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

# convert to HH:MM format
def convert_time(time: str):
    time = str(time)
    if '.' in time:
        if len(time.split('.')[1]) == 1:
            time = time + '0'
        time = time.replace('.', ':')
    else:
        time = time + ':00'

    if time.startswith('0'):
        time = time[1:]

    return time

