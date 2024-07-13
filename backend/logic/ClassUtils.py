import logic.BasicUtils as BasicUtils
def create_seperate_classes(classes_json):
    new_classes = []
    for c in classes_json:
        day_of_week = c['day_of_week']
        
        # Check if day_of_week is a string and has spaces
        if isinstance(day_of_week, str) and ' ' in day_of_week:
            days = day_of_week.split(' ')
            for d in days:
                new_c = c.copy()
                new_c['day_of_week'] = d
                new_classes.append(new_c)
        else:
            new_classes.append(c)
    
    return new_classes

def format_classes(classes_json):
    new_classes = []
    new_classes = remove_nulls(classes_json)
    new_classes = remove_spaces(new_classes)
    new_classes = format_times(new_classes)
    print("NEW_CLASS", new_classes)
    return new_classes

def remove_nulls(classes_json):
    # remove class if class_code is null
    new_classes = []
    for c in classes_json:
        if c['class_code']:
            new_classes.append(c)
        else:
            print("ERR:", c)
    return new_classes


def remove_spaces(classes_json):
    # remove spaces from the class names
    new_classes = []
    for c in classes_json:
        if c['class_code']:
            course = c.copy()
            course['class_code'] = str(course['class_code']).replace(' ', '')
            new_classes.append(course)
        else:
            print("ERR:", c)
    return new_classes

def format_times(classes_json):
    # convert the start and end times to times and convert the format from HH.MM to HH:MM
    new_classes = []
    for c in classes_json:
        course = c.copy()
        if course['start']:
            course['start'] = BasicUtils.convert_time(str(course['start']))
        if course['end']:
            course['end'] = BasicUtils.convert_time(str(course['end']))
        new_classes.append(course)
    return new_classes