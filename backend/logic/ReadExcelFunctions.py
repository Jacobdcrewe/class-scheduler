import pandas as pd
from models.Semester import Semester
import logic.ClassUtils as ClassUtils
import json
def read_classes(semester: Semester): 
    # load the classes
    if semester == Semester.FALL:
        classes = pd.read_excel('./schedules/schedulefall.xlsx', sheet_name=0)
    else:
        classes = pd.read_excel('./schedules/schedulewinter.xlsx', sheet_name=0)

    # create class models
    classes.columns = ['code', 'department', 'class_code', 'class_name', 'lecture_code', 'day_of_week', 'start', 'end', 'room']
    classes.dropna(how='all', inplace=True)
    return classes


def read_extras(level, sections, semester: Semester):
    # load the extras
    if semester == Semester.FALL:
        extras = pd.read_excel('./schedules/formattingfall.xlsx', sheet_name=0)    
    else:
        extras = pd.read_excel('./schedules/formattingwinter.xlsx', sheet_name=0)    
    
    extras.columns = ['code', 'department', 'class_code', 'class_name', 'lecture_code', 'day_of_week', 'start', 'end', 'room']
    extras.dropna(how='all', inplace=True)
   
    extras_json = json.loads(extras.to_json(orient='records'))


    # Separate into sections based on headings
    section_data = []
    current_section = None
    
    for row in extras_json:
        if str(row['code']) and str(row['code']).startswith('LEVEL'):
            current_section = str(row['code'])
            section_stats = current_section.split()
            lvl = int(section_stats[1])
            sec = ' '.join(section_stats[2:])
            section_data.append({'level': lvl, 'section': sec, 'classes': []})
        elif current_section:
            section_data[-1]['classes'].append(row)

    # Filter classes based on level and section
    filtered_classes = []
    
    for sect in sections:
        for s in section_data:
            if int(s['level']) == int(level) and s['section'].upper() == sect:
                filtered_classes = s['classes']
                break

    filtered_classes = ClassUtils.format_classes(filtered_classes)

    return filtered_classes


def read_extra_sections_on_level(level, semester: Semester):
    if semester == Semester.FALL:
        extras = pd.read_excel('./schedules/formattingfall.xlsx', sheet_name=0)
    else:
        extras = pd.read_excel('./schedules/formattingwinter.xlsx', sheet_name=0)
    
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

