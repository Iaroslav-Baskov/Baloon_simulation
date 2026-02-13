
import asyncio
import websockets
import json
from websockets.sync.client import connect
import time
import random
import math
import serial
ser = serial.Serial('/dev/ttyACM0', 115200, timeout=1)  # порт и скорость
#bluetooth_serial = serial.Serial('COM5', 9600, timeout=1)
import numpy as np

async def main():
    pitchv=0.0
    pitch=1*random.random()

    rollv=0
    roll=1*random.random()
    yaw=0
    yawv=0.1
    vx=-0.0001
    vy=0
    data = {
    "lat": 43.202571,
    "lon": 27.907670667,
    "altitude": 0,
    "2G": 15.0,
    "SD_en": 1.0,
    "LoRa_tmp": 21.0,
    "LoRa_en": 1.0,
    "AHT_tmp": 23.4,
    "AHT_hum": 60.36,
    "AHT_en": 1.0,
    "BMP_tmp": 24.3,
    "BMP_pPa": 101021.0,
    "BMP_en": 1.0,
    "axG": 0.08,
    "ayG": -0.37,
    "azG": -5.36,
    "gx": 0.05,
    "gy": 8.89,
    "gz": -5.36,
    "gtmp": 21.75,
    "g_en": 1.0,
    "magx": 24303.0,
    "magy": -12465.0,
    "magz": 24115.0,
    "3v3": 2.8,
    "time":0
    }

    with connect("ws://79.100.175.98:1560") as websocket:
        websocket.send("stratoccini fetuccini")
        print("Client connected for sending ", websocket.remote_address)
        def send_data():
            try:
                message = json.dumps(data)
                websocket.send(message)
                #print("Data sent: ", message)
            except websockets.ConnectionClosed:
                print("Connection closed unexpectedly")
                return
        
        def clear_data():
            websocket.send("clear")
            print("Data cleared")
        #tuk mozhesh da napravish cikul koito da promenq data i posle da izvikva send_data()
        # clear_data()
        while(1):
            # yaw+=yawv
            # rollv-=(roll)/1000
            # pitchv-=(pitch)/1000
            # roll=roll+rollv
            # pitch=pitch+pitchv
            # data["axG"]=math.sin(pitch)*math.cos(roll)
            # data["ayG"]=math.sin(roll)*math.cos(pitch)
            # data["azG"]=math.cos(roll)*math.cos(pitch)

            data["time"]=time.time()*1000+3*1000*3600
            # data["time"]=5*3600*1000
            # data["altitude"]+=100
            # if(data["altitude"]>35000):
            #     data["altitude"]=0
            # vx+=(random.random()-0.5)*0.00001
            # vy+=(random.random()-0.5)*0.00001
            # data["lat"]+=vy
            # data["lon"]+=vx
            # line = ser.readline().decode('utf-8', errors='ignore').strip()
            # if line:
            #     arr=line.split(",")
            #     print(line)
            #     if len(arr)>=28:
            #         with open("distance.csv", "a") as file:  # "a" means append mode
            #             file.write(line + "\n") 
            #         data["lat"]=arr[2]
            #         data["lon"]=arr[3]
            #         data["altitude"]=arr[4]
            #         data["axG"]=arr[10]
            #         data["ayG"]=arr[11]
            #         data["azG"]=arr[12]
            #         data["magx"]=arr[17]*1
            #         data["magy"]=arr[18]*1
            #         data["magz"]=arr[19]*1
            #         data["qality"]=arr[27]
            #         send_data()


        
asyncio.run(main())
