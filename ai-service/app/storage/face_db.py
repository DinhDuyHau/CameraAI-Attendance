from app.core.globals import FACE_DB

def save_face(employee_id, embedding):

    FACE_DB[employee_id] = embedding

def get_face_db():

    return FACE_DB