from pydantic import BaseModel

class ZooInput(BaseModel):
    Zoo_Name: str
    State: str
    Species_Name: str
    Closing_Stock: int
    Deaths: int