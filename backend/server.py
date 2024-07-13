import pandas as pd
import json
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated, Union
import logic.GetClassesByYearDepartmentSemester as GetClasses
import logic.ReadExcelFunctions as ReadExcelFunctions
from models.Semester import Semester
import logic.BasicUtils as BasicUtils

app = FastAPI()
# Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# get by year, department, and semester
@app.get("/api/classes/")
async def get_classes(year: int = 0, departments: Annotated[Union[list[str], None], Query()] = ['ENGPHYS'], semester: Semester = Semester.FALL):
    return GetClasses.Query(year, departments, semester)

# get departments by year
@app.get("/api/departments/")
async def get_departments(year: int = 0):
    return BasicUtils.get_departments(year)

# get the available years
@app.get("/api/years/")
async def get_years():
    return BasicUtils.get_years()

@app.get("/api/extra_sections/")
async def get_extra_sections(level: int = 1, semester: Semester = Semester.FALL):
    return json.loads(json.dumps(ReadExcelFunctions.read_extra_sections_on_level(level, semester)))


@app.get("/api/extras/")
async def get_extras(level: int = 1, section: str = None, semester: Semester = Semester.FALL):
    semester = semester.upper()
    return json.loads(json.dumps(ReadExcelFunctions.read_extras(level, section, semester)))
