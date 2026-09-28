from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

app = FastAPI()


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# SENSOR DATA MODEL
# ==========================================

class SensorData(BaseModel):
    co2: float
    co: float
    temperature: float
    humidity: float


# ==========================================
# LATEST SENSOR DATA
# ==========================================

latest_sensor_data = {
    "co2": 0,
    "co": 0,
    "temperature": 0,
    "humidity": 0,
    "updated_at": None
}


# ==========================================
# RECEIVE DATA FROM ESP32
# ==========================================

@app.post("/sensor-data")
async def receive_sensor_data(data: SensorData):

    global latest_sensor_data

    latest_sensor_data = {
        "co2": data.co2,
        "co": data.co,
        "temperature": data.temperature,
        "humidity": data.humidity,
        "updated_at": datetime.now().strftime("%H:%M:%S")
    }

    print("====================================")
    print("DATA RECEIVED FROM ESP32")
    print("====================================")

    print(f"CO2         : {data.co2}")
    print(f"CO          : {data.co}")
    print(f"Temperature : {data.temperature}")
    print(f"Humidity    : {data.humidity}")

    print("====================================")

    return {
        "status": "success",
        "message": "Sensor data received",
        "data": latest_sensor_data
    }


# ==========================================
# SEND LATEST DATA TO REACT
# ==========================================

@app.get("/sensor-data")
async def get_sensor_data():

    return latest_sensor_data


# ==========================================
# ROOT
# ==========================================

@app.get("/")
async def root():

    return {
        "message": "Carbon Emission Monitoring API",
        "status": "running"
    }