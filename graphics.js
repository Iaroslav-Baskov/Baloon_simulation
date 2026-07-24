var redColor="#F00";
var redColor2="#800";
const diagramsIm=document.getElementById("diagramsIm");
var table=document.getElementById("table");
var terrain=[];
var langSelect=document.getElementById("lang");
var cloudThickness=1000;
var cloudAltitude=[2000,8000,16000];
const maxA=70;
var aHeight;
var aWidth;
var horyzont=0;
if(height>width){
aHeight=maxA;
aWidth=aHeight*width/height;}else{
  aWidth=maxA;
  aHeight=aWidth/width*height;
}
var root = document.querySelector(':root');
var altMarker=document.getElementById('marker');
const Atm=40000;
const R=6357000;
const m=height/aHeight*7;
var mode="baloon";
    var dmax=200000;
var data={
  altitude:1000,
  time:6500000000,
}


function readFlagAtPosition(flags, bitPosition) {
  if (flags === undefined || flags === null || isNaN(flags)) return false;
  return ((flags >> bitPosition) & 1);
}
function predictBatteryLevel(voltage,heating_on,cam_on){
  let data=[-9698.66399801,  9519.97433202, -3117.27831474,   340.44272883];
  poly=0;
  for(var i=0;i<data.length;i++){
    poly+=data[i]*(voltage+heating_on*0.09285857787284524+cam_on*0.06483004946064508)**(i);
  }
  return 100 / (1 + Math.exp(-poly));
}
function predictSunPosition(utHours, lat, lon, altitude) {
    const rad = Math.PI / 180;

    // Helper to fix JavaScript's negative modulo behavior
    const normalize = (val) => ((val % 360) + 360) % 360;

    // 1. Get current date components to calculate the correct Julian Day
    const now = new Date();
    let year = now.getUTCFullYear();
    let month = now.getUTCMonth() + 1; // JS months are 0-11
    const day = now.getUTCDate();

    // 2. Calculate Julian Day (standard astronomical formula)
    // CRITICAL FIX: Jan and Feb must be treated as months 13 and 14 of the previous year
    if (month <= 2) {
        year -= 1;
        month += 12;
    }

    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    const JD = Math.floor(365.25 * (year + 4716)) + 
               Math.floor(30.6001 * (month + 1)) + 
               day + B - 1524.5 + (utHours / 24);

    const d = JD - 2451545.0; // Days since J2000.0 epoch

    // 3. Solar Coordinates (Position of the sun in space)
    // CRITICAL FIX: Added proper 0-360 normalization
    const g = normalize(357.529 + 0.98560028 * d); 
    const q = normalize(280.459 + 0.98564736 * d); 
    const L = normalize(q + 1.915 * Math.sin(g * rad) + 0.020 * Math.sin(2 * g * rad)); 
    const e = 23.439 - 0.00000036 * d; // Obliquity of Earth's axis

    // 4. Celestial Coordinates (Equatorial system)
    let ra = Math.atan2(Math.cos(e * rad) * Math.sin(L * rad), Math.cos(L * rad)) / rad;
    ra = normalize(ra); // Ensure Right Ascension is normalized
    const dec = Math.asin(Math.sin(e * rad) * Math.sin(L * rad)) / rad;

    // 5. Sidereal Time (Earth's rotation relative to stars)
    const GMST = normalize(280.46061837 + 360.98564736629 * d);
    const LMST = normalize(GMST + lon);
    
    let H = LMST - ra; // Hour Angle
    // CRITICAL FIX: Replaced 'while' loop with reliable mathematical bound (-180 to 180)
    H = ((H + 180) % 360 + 360) % 360 - 180;

    // 6. Transformation to Horizontal Coordinates (Azimuth/Elevation)
    const latRad = lat * rad;
    const decRad = dec * rad;
    const hRad = H * rad;

    let elevation = Math.asin(Math.sin(latRad) * Math.sin(decRad) + 
                    Math.cos(latRad) * Math.cos(decRad) * Math.cos(hRad)) / rad;
    
    let azimuth = Math.atan2(-Math.sin(hRad), 
                  Math.cos(latRad) * Math.tan(decRad) - Math.sin(latRad) * Math.cos(hRad)) / rad;
    
    // CRITICAL FIX: Ensure azimuth is locked neatly into 0-360 degrees
    azimuth = normalize(azimuth);

    // 7. Atmospheric Refraction Correction
    const pressureCorrection = Math.exp(-altitude / 8200);
    if (elevation > -0.5) {
        const ref = (1.02 / Math.tan((elevation + 10.3 / (elevation + 5.11)) * rad)) * pressureCorrection;
        elevation += ref / 60;
    }

    return {
        azimuth: Number(azimuth.toFixed(2)),
        elevation: Number(elevation.toFixed(2)),
        timestamp: now.getUTCFullYear() + "-" + (now.getUTCMonth() + 1) + "-" + now.getUTCDate()
    };
}
function normalizeTo180(angle) {
    return ((angle + 180) % 360 + 360) % 360 - 180;
}
var secondaryData = {
  "UT[h]": {"sources": ["UT[s]"], "formula": (x) => (x / 3600)},
  "now[h]": {"sources": ["now[ms]"], "formula": (x) => (x / 3600 / 1000)},
  "yaw": {"sources": ["magy[uT]", "magx[uT]"], "formula": (y, x) => (Math.atan2(y, x))},
  "roll": {"sources": ["ay[m/s2]", "az[m/s2]"], "formula": (y, z) => (Math.atan2(-y, z))},
  "pitch": {"sources": ["ax[m/s2]", "az[m/s2]"], "formula": (x, z) => (Math.atan2(x, z))},
  "sunX": {"sources": ["UT[h]", "lat", "lon", "altitude","yaw"], "formula": (UT, lat, lon, alt, yaw) => (width/2+normalizeTo180(predictSunPosition(UT, lat, lon, alt).azimuth - yaw/Math.PI*180)/aHeight*height)},
  "sunY": {"sources": ["UT[h]", "lat", "lon", "altitude"], "formula": (UT, lat, lon, alt) => (height / 2 - normalizeTo180(predictSunPosition(UT, lat, lon, alt).elevation) / aHeight * height)},
  "heating_on": {"sources": ["flags"], "formula": (f) => readFlagAtPosition(f, 0)},
  "LoRa_on": {"sources": ["flags"], "formula": (f) => readFlagAtPosition(f, 1)},
  "GPS_on": {"sources": ["flags"], "formula": (f) => readFlagAtPosition(f, 2)},
  "SMS_on": {"sources": ["flags"], "formula": (f) => readFlagAtPosition(f, 3)},
  "SD_on": {"sources": ["flags"], "formula": (f) => readFlagAtPosition(f, 4)},
  "pms_on": {"sources": ["flags"], "formula": (f) => readFlagAtPosition(f, 5)},
  "gyro_on": {"sources": ["flags"], "formula": (f) => readFlagAtPosition(f, 6)},
  "cam_on": {"sources": ["flags"], "formula": (f) => readFlagAtPosition(f, 7)},
  "batteryLevel": {"sources": ["voltage", "heating_on", "cam_on"], "formula": (v, h, c) => (predictBatteryLevel(v, h, c))},
};
var limits={
  "lat":{max:90, min:-90, exceptions:[]},
  "lon":{max:180, min:-180, exceptions:[]},
  "altitude":{max:100000, min:-1000, exceptions:[]},
  "AHT_temp[C]":{max:90, min:-80, exceptions:[]},
  "BMP_temp[C]":{max:90, min:-80, exceptions:[]},
  "gtemp[C]":{max:90, min:-80, exceptions:[]},
  "voltage":{max:5, min:2, exceptions:[]},
  "AHT_hum":{max:100, min:0, exceptions:[]},
  "BMP_pres":{max:200000, min:10, exceptions:[]},
  "pm1_0":{max:3000, min:0, exceptions:[]},
  "pm10_0":{max:3000, min:0, exceptions:[]},
  "pm2_5":{max:3000, min:0, exceptions:[]},
  "03µm":{max:3000, min:0, exceptions:[]},
  "05µm":{max:3000, min:0, exceptions:[]},
  "10µm":{max:3000, min:0, exceptions:[]},
};
var allKeys={
  "now[h]":{"csv":true,"table":false,"diagrams":true,"name":"now"},
  "rssi":{"csv":true,"table":true,"name":"rssi"},
  "snr":{"csv":true,"table":true,"name":"snr"},
  "AHT_temp[C]":{"csv":true,"table":true,"name":"outside_temperature"},
  "AHT_hum":{"csv":true,"table":false,"name":"humidity"},
  "BMP_temp[C]":{"csv":true,"table":false,"name":"outside_temperature"},
  "BMP_pres":{"csv":true,"table":false,"name":"pressure"},
  "ax[m/s2]":{"csv":true,"table":false},
  "ay[m/s2]":{"csv":true,"table":false},
  "az[m/s2]":{"csv":true,"table":false},
  "gx":{"csv":true,"table":false},
  "gy":{"csv":true,"table":false},
  "gz":{"csv":true,"table":false},
  "gtemp[C]":{"csv":true,"table":true,"name":"inside_temperature"},
  "magx[uT]":{"csv":true,"table":false},
  "magy[uT]":{"csv":true,"table":false},
  "magz[uT]":{"csv":true,"table":false},
  "voltage":{"csv":true,"table":false,"name":"voltage"},
  "pm1_0":{"csv":true,"table":false,"name":"PMconc"},
  "pm2_5":{"csv":true,"table":false,"name":"PMconc"},
  "pm10_0":{"csv":true,"table":false,"name":"PMconc"},
  "p03um":{"csv":true,"table":false,"name":"PMnum"}, 
  "p05um":{"csv":true,"table":false,"name":"PMnum"},
  "p10um":{"csv":true,"table":false,"name":"PMnum"},
  "lon":{"csv":true,"table":false},
  "lat":{"csv":true,"table":false},
  "altitude":{"csv":true,"table":false,"name":"altitude"},
  "UT[h]":{"csv":true,"table":false,"name":"time"},
  "malformed":{"csv":true,"table":false},
  "batteryLevel":{"csv":true,"table":true,"name":"batteryLevel"},
  "yaw":{"csv":false,"table":false},
  "roll":{"csv":false,"table":false},
  "pitch":{"csv":false,"table":false},
  "sunX":{"csv":false,"table":false},
  "sunY":{"csv":false,"table":false},
  "flags":{"csv":false,"table":false},
  "heating_on":{"csv":true,"table":true,"bool":true,"name":"heating_on","critical":[1,0]},
  "cam_on":{"csv":true,"table":true,"bool":true,"name":"cam_on","critical":[1,0]},
  "LoRa_on":{"csv":true,"table":true,"bool":true,"name":"LoRa_on","critical":[0]},
  "GPS_on":{"csv":true,"table":true,"bool":true,"name":"GPS_on","critical":[0]},
  "SMS_on":{"csv":true,"table":true,"bool":true,"name":"SMS_on","critical":[0]},
  "SD_on":{"csv":true,"table":true,"bool":true,"name":"SD_on","critical":[0]},
  "pms_on":{"csv":true,"table":true,"bool":true,"name":"pms_on","critical":[0]},
  "gyro_on":{"csv":true,"table":true,"bool":true,"name":"gyro_on","critical":[0]}
};
const nameToData={
  "altitude":{"data":["altitude"],"unit":"m","labels":{"en":["altitude"],"bg":["Височина"]},"label":{"en":"altitude","bg":"Височина"}},
  "now":{"data":["now[h]"],"unit":"h","labels":{"en":["probe time"],"bg":["Вътрешно време"]},"label":{"en":"probe time","bg":"Вътрешно време"}},
  "time":{"data":["UT[h]"],"unit":"h","labels":{"en":["time"],"bg":["време"]},"label":{"en":"Universal Time","bg":"Универсално време"}},
  "inside_temperature":{"data":["gtemp[C]"],"unit":"°C","labels":{"en":["temperature"],"bg":["температура"]},"label":{"en":"Inside temperature","bg":"Вътрешна температура"},"img":"textures/icons/termometer.png"},
  "outside_temperature":{"data":["AHT_temp[C]","BMP_temp[C]"],"unit":"°C","labels":{"en":["outside temperature 1","outside temperature 2"],"bg":["Външна температура 1","Външна температура 2"]},"label":{"en":"Outside temperature","bg":"Външна температура"},"img":"textures/icons/termometer.png"},
  "pressure":{"data":["BMP_pres"],"unit":"Pa","labels":{"en":["pressure"],"bg":["Налягане"]},"label":{"en":"pressure","bg":"Налягане"}},
  "humidity":{"data":["AHT_hum"],"unit":"%","labels":{"en":["humidity"],"bg":["Влажност"]},"label":{"en":"humidity","bg":"Влажност"}},
  "PMconc":{"data":["pm1_0","pm2_5","pm10_0"],"unit":"µg/m³","labels":{"en":["pm1_0","pm2_5","pm10_0"],"bg":["pm1_0","pm2_5","pm10_0"]},"label":{"en":"Dist concentration","bg":"Концентрация на прахови частици"}},
  "PMnum":{"data":["p03um","p05um","p10um"],"unit":"n/0.1L","labels":{"en":["p03m","p05m","p10m"],"bg":["p03m","p05m","p10m"]},"label":{"en":"Dist count","bg":"Количество прахови частици"}},
  "rssi":{"data":["rssi"],"unit":"dbm","labels":{"en":["rssi"],"bg":["rssi"]},"label":{"en":"LoRa rssi","bg":"LoRa rssi"},"img":"textures/icons/probe.png"},
  "snr":{"data":["snr"],"unit":"dbm","labels":{"en":["snr"],"bg":["snr"]},"label":{"en":"LoRa snr","bg":"LoRa snr"},"img":"textures/icons/probe.png"},
  "voltage":{"data":["voltage"],"unit":"V","labels":{"en":["volage"],"bg":["Напрежение"]},"label":{"en":"Battery voltage","bg":"Напрежение на батерията"},"img":"textures/icons/battery.png"},
  "batteryLevel":{"data":["batteryLevel"],"unit":"%","labels":{"en":["charge"],"bg":["Ниво"]},"label":{"en":"Battery level","bg":"Ниво на батерията"},"img":"textures/icons/battery.png"},
  "heating_on":{"data":["heating_on"],"unit":"","labels":{"en":["is on?"],"bg":["Включено?"]},"label":{"en":"Heating activation","bg":"Активация на нагревателя"},"img":"textures/icons/heating.png","noimg":"textures/icons/no_heating.png"},
  
  "LoRa_on":{"data":["LoRa_on"],"unit":"","labels":{"en":["is on?"],"bg":["Включено?"]},"label":{"en":"LoRa activation","bg":"Активация на LoRa"},"img":"textures/icons/probe.png","noimg":"textures/icons/no_probe.png"},
  "GPS_on":{"data":["GPS_on"],"unit":"","labels":{"en":["is on?"],"bg":["Включено?"]},"label":{"en":"GPS activation","bg":"Активация на GPS"},"img":"textures/icons/sat.png","noimg":"textures/icons/no_sat.png"},
  "SMS_on":{"data":["SMS_on"],"unit":"","labels":{"en":["is on?"],"bg":["Включено?"]},"label":{"en":"SMS module activation","bg":"Активация на SMS модул"},"img":"textures/icons/sms.png","noimg":"textures/icons/no_sms.png"},
  "SD_on":{"data":["SD_on"],"unit":"","labels":{"en":["is on?"],"bg":["Включено?"]},"label":{"en":"SD activation","bg":"Активация на SD"},"img":"textures/icons/SD.png","noimg":"textures/icons/no_SD.png"},
  "pms_on":{"data":["pms_on"],"unit":"","labels":{"en":["is on?"],"bg":["Включено?"]},"label":{"en":"PMS sensor activation","bg":"Активация на сензора за прахови частици"},"img":"textures/icons/pms.png","noimg":"textures/icons/no_pms.png"},
  "gyro_on":{"data":["gyro_on"],"unit":"","labels":{"en":["is on?"],"bg":["Включено?"]},"label":{"en":"Gyro activation","bg":"Активация на жироскопа"},"img":"textures/icons/gyro.png","noimg":"textures/icons/no_gyro.png"},
  "cam_on":{"data":["cam_on"],"unit":"","labels":{"en":["is on?"],"bg":["Включено"]},"label":{"en":"Camera activation","bg":"Активация на камерата"},"img":"textures/icons/cam.png","noimg":"textures/icons/no_cam.png"}

}
const dwawWorld_needed_data=["altitude","sunX","sunY","ax[m/s2]","ay[m/s2]","az[m/s2]","magx[uT]","magy[uT]","magz[uT]","roll","pitch","yaw"];
const form = document.forms[0];
const radios = form.elements["selectData"];
const relatedTo = form.elements["relTo"];

for(var index in nameToData){
  for(var Ilang =0;Ilang<langSelect.length;Ilang++){
    let lang=langSelect[Ilang].value;
    radios.innerHTML=radios.innerHTML+'<option class="option '+lang+'" value='+index+'>'+nameToData[index]["label"][lang]+'</option>';
  }
}
relatedTo.innerHTML=radios.innerHTML;
createTable();

var noiseTime = 0;
var noise=setInterval(() => {
  makeNoise(ctx);
}, 50);
var map = L.map('map',{ attributionControl:false }).setView([43, 25], 13);
  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 17,
  attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
}).addTo(map);

var latlngs = [];
var polyline = L.polyline(latlngs, {color: redColor}).addTo(map);
var marker = L.marker([0, 0], {draggable: false}).addTo(map);
var map2;
var observer;
var sightRay;

var fog=new Image();
fog.crossOrigin = "anonymous";
fog.src="./textures/graphics/fog.png"
var boxFront=new Image();
boxFront.crossOrigin = "anonymous";
boxFront.src="./textures/graphics/Back.png"
var baloon=new Image();
baloon.crossOrigin = "anonymous";
baloon.src="./textures/graphics/baloon.png"
var cum=new Image();
cum.crossOrigin = "anonymous";
cum.src="./textures/graphics/cum.png"
var clouds=new Image();
clouds.crossOrigin = "anonymous";
clouds.src="./textures/graphics/clouds.png"
var cur=new Image();
cur.crossOrigin = "anonymous";
cur.src="./textures/graphics/cur.png"

for(var i=0;i<5;i++){
terrain[i]=new Image();
terrain[i].crossOrigin = "anonymous";

terrain[i].src="./textures/graphics/terrain"+i+".png"}

var noDataEvent;
var allData=[
];

stars=[]
for(var i=0;i<100;i++){
  let r=Math.random();
  let b=Math.random();
  let g=(r+b)/2;
  stars.push([width*Math.random(),height*Math.random(),r,g,b]);
}
let texture=renderStars(stars,100, aWidth,1);
drawCanvas(texture);
starCtx.clearRect(0,0,width,height);
starCtx.drawImage(drawCanvas.canvas,0,0);

var csvFileLink=document.getElementById("csvFile");
csvFileLink.onclick=generateCSV;

async function startData() {
    //const url = "https://aurora.stratostat.com/log.txt";
    url = "log.txt";
    try {
        // 1. Fetch with 'no-store' to ensure we don't get a cached 0-byte file
        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) {
            console.error("Server reached but returned error:", response.status);
            return;
        }

        // 2. YOU MUST AWAIT THE TEXT CONSUMPTION
        const text = await response.text();
        
        console.log("Success! Characters received:", text.length);

        if (text.length === 0) {
            console.warn("The file is currently empty on the server.");
            return;
        }

        // 3. Robust JSON Formatting
        let cleanedText = text.trim();
        
        // Remove trailing comma if it exists
        if (cleanedText.endsWith(',')) {
            cleanedText = cleanedText.slice(0, -1);
        }
        cleanedText=cleanedText.replaceAll("\n", " ");
        cleanedText = cleanedText + '}';

        const json = JSON.parse(cleanedText);
        
        // 4. Data Processing
        let lastsmth;
        for (const [key, value] of Object.entries(json)) {
            if(key=="101"){
              console.log("Data for key 101:", value);
            }
            loadData(value);
            lastsmth=value
        }
        update(data);
        console.log("Data loaded successfully:", lastsmth);

    } catch (err) {
        console.error("Detailed Error:", err);
    }
}
function makeNoise(context) {
  var imgd = context.createImageData(canvas.width, canvas.height);
  var pix = imgd.data;

  for (var i = 0, n = pix.length; i < n; i += 4) {
      var c = 6 + Math.sin(i/(height*width)*10 + noiseTime /7); // A sine wave of the form sin(ax + bt)
      pix[i] = pix[i+1] = pix[i+2] = 40 * Math.random() * c; // Set a random gray
      pix[i+3] = 255; // 100% opaque
  }

  context.putImageData(imgd, 0, 0);
  noiseTime  = (noiseTime  + 1) % canvas.height;
  ctx.font = Math.floor(1/aWidth*width*5)+"px myFont";
  ctx.fillStyle=redColor;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText("waiting", width/2,height/2-0.5/aWidth*width*5);
  ctx.fillText("for data", width/2,height/2+0.5/aWidth*width*5);

}

  function drawBox(ctx,image, x,y,wid=300,angle=0){
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(angle);
    ctx.translate(-wid/2,-image.height/image.width*wid/2);
    ctx.drawImage(image,0,0,wid,image.height/image.width*wid);
    ctx.restore();
  }
  function drawLayer(image,d,altitude,maxAlt,offset=0,ground=false){
    var horyzont2=Math.atan((altitude-maxAlt)/d)/Math.PI*180;
    var horyzontH2=Math.floor(horyzont2*height/aHeight+height/2);
    var imwidth=width/aWidth*maxA*(dmax**2+Atm**2)**0.5/(d**2+(altitude-maxAlt)**2)**0.5*2;
    if(ground){
          imwidth=width/aWidth*maxA*(d**2+Atm**2)**0.5/(d**2+(altitude-maxAlt)**2)**0.5;
    }
    if(ground){
    ctx.drawImage(image,width/2-imwidth/2*(1+offset/2),horyzontH2,imwidth,image.height/image.width*imwidth);}
    else{
      ctx.drawImage(image,width/2-imwidth/2*(1+offset/2),horyzontH2-image.height/image.width*imwidth/2,imwidth,image.height/image.width*imwidth);
    }
  }
  function drawWorld(){
    if(!dwawWorld_needed_data.every(key => data.hasOwnProperty(key))) {
      console.warn("Missing required data for drawWorld:", dwawWorld_needed_data.filter(key => !data.hasOwnProperty(key)));
      return;
    }
    for (const key of dwawWorld_needed_data) {
      if (data[key] === undefined ) { 
        console.warn(`Data for ${key} is undefined. Skipping drawWorld.`);
        return;}
      if (isNaN(data[key])) {
        console.warn(`Data for ${key} is NaN. Skipping drawWorld.`);
        return;
      }
    }
    console.log(data);
    horyzont=Math.acos(R/(R+data["altitude"]))/Math.PI*180;
    var horyzontH=Math.floor(horyzont*height/aHeight+height/2);
    var add=0;
    horyzontH=Math.floor(horyzontH);
    if(horyzontH<data["sunY"]){
      add+=((data["sunY"]-horyzontH)/height*aHeight/180*Math.PI*R/Atm);
    }
    drawCanvas(renderSky(data["sunX"],data["sunY"],data["altitude"],aWidth,1));
    skyCtx.clearRect(0,0,width,height);
    skyCtx.drawImage(drawCanvas.canvas, 0, 0);
    ctx.clearRect(0,0,width,height);
    root.style.setProperty('--altitude', data.altitude);
    root.style.setProperty('--yaw', data["yaw"]/Math.PI*180-180);
    root.style.setProperty('--roll', data["roll"]/Math.PI*180);
    root.style.setProperty('--pitch', data["pitch"]/Math.PI*180);
    var cloudN0=2;
    var cloudN1=5;
    var cloudN2=25;
  //   for(var i=0;i<terrain.length;i+=1){
  //   var d=dmax*(terrain.length-i)/terrain.length;
  //   drawLayer(terrain[i],d,data.altitude,0,0,true);
  //   for(j=0;j<cloudN0;j++){
  //   d=dmax*(terrain.length-i-j/cloudN0)/terrain.length;
  //   var offset = Math.sin((i+j/cloudN0)*2)*0.1;
  //   drawLayer(cum,d,data.altitude,cloudAltitude[0],offset);
  // }
  //   for(j=0;j<cloudN1;j++){
  //   d=dmax*(terrain.length-i-j/cloudN1)/terrain.length;
  //   var offset = Math.sin((i+j/cloudN1)/3)/2+Math.sin((i+j/cloudN2)*3*Math.PI)/2;
  //   drawLayer(clouds,d,data.altitude,cloudAltitude[1],offset)
  // }
  //   for(j=0;j<cloudN2;j++){
  //   d=dmax*(terrain.length-i-j/cloudN2)/terrain.length;
  //   var offset = Math.sin((i+j/cloudN2)/3)/2+Math.sin((i+j/cloudN2)*cloudN2/8*Math.PI);
  //   drawLayer(cur,d,data.altitude,cloudAltitude[2],offset)
  // }
// }
    // drawBox(ctx,boxFront,width/2,height*0.65-1.5*m,0.3*m,data["roll"]);

    // let size=2*m*Math.cbrt(allData["BMP_pres"][0]/data["BMP_pres"]);
    // drawBox(ctx,baloon,width/2,height*0.65-1.5*m,size,data["roll"]);
  //   ctx.drawImage(fog,0,-cloudAltitude[0]*m+data.altitude*m-cloudThickness/2,cloudThickness*m/clouds.height*clouds.width,cloudThickness*m);
  //   ctx.drawImage(fog,0,-cloudAltitude[1]*m+data.altitude*m-cloudThickness/2,cloudThickness*m/clouds.height*clouds.width,cloudThickness*m);
  // ctx.drawImage(fog,0,-cloudAltitude[2]*m+data.altitude*m-cloudThickness/2,cloudThickness*m/clouds.height*clouds.width,cloudThickness*m);
  
      const sunZ = (1.570796) + ((height / 2.0 -height+ data["sunY"]) / width)* aWidth/180*3.14159265;

    const sunAirmass=Math.max(calcAirmass(data.altitude,sunZ),0);

    const btau=0.2;
    const taur=0.051*btau;
    const taug=0.136*btau;
    const taub=0.252*btau;
    let sunR = 1*calcDestinction(taur,sunAirmass);
    let sunG = 1*calcDestinction(taug,sunAirmass);
    let sunB = 0.9*calcDestinction(taub,sunAirmass);
    const worldTexture = canvasToTexture(canvas);

    //2. PROCESS: Apply your sun-based color multiplication
    //Pass the texture we just created into the multiplier
    const processedTexture = multiplyColor(worldTexture,sunR,sunG,sunB);

    // 3. RENDER: Convert that GPU data back to a visible state
    drawCanvas(processedTexture);
    ctx.save();
    ctx.globalCompositeOperation = "source-atop"

    ctx.drawImage(drawCanvas.canvas,0,0);
    ctx.restore();
    fillTable();
}
startData();
  terrain[terrain.length-1].onload=function(){

    
    const socket = new WebSocket("wss://ws.stratostat.com/");

    socket.addEventListener("open", (event) => {
      console.log("Connected");
      socket.send("listen");
      socket.addEventListener("message", (event) => {
  			console.log(event.data);
        update(JSON.parse(event.data));
    });
  });
  socket.onerror = (error) => {
    console.warn("⚠️ WebSocket error:", error);
    socket.close(); // optional
  };

  socket.onclose = (event) => {
terrain[terrain.length-1].onload();
  };

}
	function update(json){
	    //tuk promenlivata json e samo nai noviq element

          if(loadData(json)){
            clearTimeout(noDataEvent);
            clearInterval(noise);
            noDataEvent=setTimeout(function(){
              noise=setInterval(() => {
                makeNoise(ctx);
              }, 50);
            },40000);
            
            drawWorld();
            if(observer!=undefined){
              observerMoved();
            }
            changeData();
            if(data.lat!=undefined && data.lon!=undefined){
            map.setView([data.lat, data.lon], map.getZoom());}
      }
	}
radios.onchange=changeData;
relatedTo.onchange=changeData;
function changeData() {
    var metricKey = radios.value;
    var relationKey = relatedTo.value;

    if (!nameToData.hasOwnProperty(metricKey) || !nameToData.hasOwnProperty(relationKey)) return;

    var input = [];
    var metricInfo = nameToData[metricKey];
    var relationInfo = nameToData[relationKey];
    var lang = langSelect.value;

    for (var m = 0; m < metricInfo["data"].length; m++) {
      var col = metricInfo["data"][m];
      // Get metric label (fallback to col key if missing)
      var metricLabel = (metricInfo["labels"] && metricInfo["labels"][lang] && metricInfo["labels"][lang][m]) 
                     || (metricInfo["label"] && metricInfo["label"][lang]) 
                     || col;

      for (var r = 0; r < relationInfo["data"].length; r++) {
        var relCol = relationInfo["data"][r];
        // Get relation label (fallback to relCol key if missing)
        var relationLabel = (relationInfo["labels"] && relationInfo["labels"][lang] && relationInfo["labels"][lang][r]) 
                         || (relationInfo["label"] && relationInfo["label"][lang]) 
                         || relCol;

        var points = [];
        for (var i = 0; i < allData[col].length; i++) {
          points.push({ x: allData[relCol][i], y: allData[col][i] });
        }

        // Return a structured dataset object containing both data and label
        input.push({
          label: metricLabel + ' vs ' + relationLabel,
          data: points
        });
      }
    }

    if (typeof myChart === "undefined" || myChart === undefined) {
      drawChart(input, metricInfo["labels"][lang], relationInfo["label"][lang], relationInfo["unit"]);
    }
    updateChart(
        input,
        metricInfo["labels"][lang],
        relationInfo["label"][lang],
        relationInfo["unit"],
        metricInfo["label"][lang],
        metricInfo["unit"]
    );
}
langSelect.onchange=function(){
    if(langSelect.value=="bg"){
      var lines = document.getElementsByClassName('bg');
        for(i=0; i<lines.length; i++) {
            lines[i].style.display="unset";
          }
        lines = document.getElementsByClassName('en');
        for(i=0; i<lines.length; i++) {
            lines[i].style.display="none";
          }
    }
        if(langSelect.value=="en"){
      var lines = document.getElementsByClassName('en');
        for(i=0; i<lines.length; i++) {
            lines[i].style.display="unset";
          }
        lines = document.getElementsByClassName('bg');
        for(i=0; i<lines.length; i++) {
            lines[i].style.display="none";
          }
    }
    changeData();
    createTable();
    fillTable();
}
var myChart;
var font=parseFloat(getComputedStyle(document.body).getPropertyValue('font-size'));
Chart.defaults.plugins.legend.labels.color = "black";
Chart.defaults.scale.border.color="grey";
Chart.defaults.scale.grid.color="grey";
Chart.defaults.plugins.title.color = "black";
Chart.defaults.scale.ticks.color = "black";
Chart.defaults.font = {
  size: font,
  family: 'Times New Roman, Times, serif',
  weight: 'normal',
};
function drawChart(Data, labels, xName, xUnit) {
  myChart = new Chart("diagramsIm", {
    type: "scatter",
    data: {
      datasets: Data // Data is already array of { label, data } objects!
    },
    plugins: [{
      id: 'custom_canvas_background_color',
      beforeDraw: (chart) => {
        const {ctx} = chart;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
      }
    }],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0
      },
      scales: {
        x: {
          title: { display: true, text: xName },
          ticks: { callback: (val) => val + (xUnit || "") }
        },
        y: {
          title: { display: true, text: "", color: "black" },
          ticks: { callback: (val) => val }
        }
      }
    }
  });
}

function updateChart(Data, labels, xName, xUnit, yName, yUnit) {
  // Dynamically calculate point radius for each dataset
  for (var i = 0; i < Data.length; i++) {
    var totalPoints = Data[i].data ? Data[i].data.length : 1;
    var rad = width / totalPoints / 2;
    if (rad < 0.2) rad = 0.2;
    if (rad > 5) rad = 5;

    Data[i].pointRadius = rad;
  }

  // Update chart data & scales
  myChart.data.datasets = Data;

  if (myChart.options.scales.x) {
    myChart.options.scales.x.title = { display: true, text: xName || "" };
    myChart.options.scales.x.ticks = { callback: (value) => value + (xUnit || "") };
  }

  if (myChart.options.scales.y) {
    myChart.options.scales.y.title = { display: true, text: yName || "", color: "black" };
    myChart.options.scales.y.ticks = { callback: (value) => value + (yUnit || "") };
  }

  myChart.update();
}
function createTable(){
  table.innerHTML="";
  for(let name in allKeys){
    if(allKeys[name]["table"] && !allKeys[name]["bool"]){
      let label=nameToData[allKeys[name]["name"]]['label'][langSelect.value]
      
      let element = "<div class='file'><img class='icon' src="+nameToData[allKeys[name]["name"]]['img']+"><div>"+label+":</div><div style='flex-grow:1;'></div><div  id='"+name+"' style='min-width:5em'></div></div>";
      table.innerHTML=table.innerHTML+element;}}
    let element = "<div class='file' id='booleans'> </div>";
    table.innerHTML=table.innerHTML+element;
}

function fillTable(){
  document.getElementById("booleans").innerHTML="";
  for(let name in allKeys){
    if(allKeys[name]["table"]){
      if(allKeys[name]["bool"]){
        if(allKeys[name]["critical"].includes(data[name])){
        let src=data[name]==1?nameToData[allKeys[name]["name"]]['img']:nameToData[allKeys[name]["name"]]['noimg'];
        let element = "<img class='icon' src="+src+" title='"+nameToData[allKeys[name]["name"]]['label'][langSelect.value]+(data[name]==1?":true":":false")+"'>";
        document.getElementById("booleans").innerHTML=document.getElementById("booleans").innerHTML+element;
      }}
      else{
        document.getElementById(name).innerHTML=""+ Math.floor(data[name]*100)/100 + nameToData[allKeys[name]["name"]]['unit']}
      }
    }
  }
var windows=[
  document.getElementById("diagrams"),
  document.getElementById("about"),
  document.getElementById("rawDataWindow"),
  document.getElementById("observationWindow"),
  document.getElementById("contacts")];
        function windowShow(n){

            windowClose();
            windows[n].style.display="flex";
            changeData();
            if(n==3 && map2==undefined){
              initObsMap();
}
}
        function windowClose(){
          for(var i=0; i<windows.length;i++){
            windows[i].style.display="none";}}


function initObsMap(){
map2 = L.map('map2').setView([43, 25], 13);
setLocation();
  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 17,
  attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
}).addTo(map2);
sightRay = L.polyline([], {color: redColor}).addTo(map2);
observer = L.marker([43, 25], {draggable: true}).addTo(map2);
observerMoved();
observer.on("dragend", (e) => observerMoved());
}
function setLocation(){
    if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition((position) => {
    var lon=position.coords.longitude;
    var lat=position.coords.latitude
        map2.setView([
  lat, 
  lon], map2.getZoom());
  observer.setLatLng({lat:lat, 
  lng:lon});
  observerMoved();
});
} 
}
function observerMoved(){
  {
  const latlng = observer._latlng;
fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${latlng.lat},${latlng.lng}`, {
  method: 'GET',
  cache: 'no-store'
}).then(res => res.json())
      .then(d => {
        const elevation = d.results[0].elevation;
        calcObservation(latlng.lat,data.lat,latlng.lng,data.lon,elevation,data.altitude,R)
      })
      .catch(err => {
        console.error("Elevation API error:", err);
      });
}
}
function calcObservation(lat0,lat1,lon0,lon1,alt0,alt1,R){
  R+=alt0;
  alt1-=alt0;
  var l=Math.acos(Math.sin(lat0/180*Math.PI)*Math.sin(lat1/180*Math.PI)+Math.cos(lat0/180*Math.PI)*Math.cos(lat1/180*Math.PI)*Math.cos((lon1-lon0)/180*Math.PI));
  var a;
  if(lat0<lat1){
  a=Math.asin(Math.cos(lat1/180*Math.PI)*Math.sin((lon1-lon0)/180*Math.PI)/Math.sin(l));}else{
  a=Math.PI-Math.asin(Math.cos(lat1/180*Math.PI)*Math.sin((lon1-lon0)/180*Math.PI)/Math.sin(l));
  }if(a<0){
    a+=2*Math.PI;
  }
  var relH=alt1/R;
  var D=R*Math.sqrt(relH**2+4*Math.sin(l/2)**2*(1+relH));
  var h=Math.asin(alt1/D*Math.cos(l/2))-l/2;
  sightRay.setLatLngs([{lat:lat0,lng:lon0},{lat:lat1,lng:lon1}]);
  observer.bindPopup(`distance: ${Math.floor(D/10)/100}km \n\r azimuth ${Math.floor(a*180/Math.PI*100)/100}° \n\r altitude ${Math.floor(h*180/Math.PI*100)/100}°`).openPopup();
}
function calcSecondaryData(json){
  for(var key in secondaryData){
    var sources=secondaryData[key].sources;
    var values=[];
    for(var i=0;i<sources.length;i++){
      if(json.hasOwnProperty(sources[i])){
        values.push(json[sources[i]]);
      }else{
        values.push(undefined);
      }
    }
    if(!values.includes(undefined)){
      json[key]=secondaryData[key].formula(...values);
    }else if (data.hasOwnProperty(key)){
      json[key]=data[key];
    }
  }
  return json;
}

function loadData(json){
  if(json["malformed"]==0){
        json=filter(json,limits);
        if (json.hasOwnProperty("lat") && json.hasOwnProperty("lon")) {
          if (json.lat !== undefined && json.lon !== undefined && !isNaN(json.lat) && !isNaN(json.lon)) {
            var latlng = L.latLng(json["lat"], json["lon"]);
            marker.setLatLng(latlng);
            polyline.addLatLng(latlng);}}
        
        for(var index in allKeys){
          if(!json.hasOwnProperty(index)){
            if(data.hasOwnProperty(index)){
              json[index]=data[index];
              allData[index].push(data[index]);
            }
          }
        }
        json=calcSecondaryData(json);
        for(var index in allKeys){
          var key=index;
          if(!allData[key]){
            allData[key]=[];
          }
          if(json.hasOwnProperty(key)){
            value=parseFloat(json[key]);
            data[key]=value;
            allData[key].push(value);
          }
        }
        return true;
    }
    return false;
}
function filter(json,limits){
  var output={};
  for([parameter,value] of Object.entries(json)){
    var ok=true;
    if(limits.hasOwnProperty(parameter)){
      if(limits[parameter].max<value){
        ok=false;
      }
      if(limits[parameter].min>value){
        ok=false;
      }
      for(var i=0;i<limits[parameter].exceptions.length;i++){
        if(Math.floor(value*10**10)==Math.floor(limits[parameter].exceptions[i]*10**10)){
          ok=false;
        }
      }}
      if(isNaN(value)){
        ok=false;
      }
      if(value==undefined){
        ok=false;
      }
      if(ok==true){
        output[parameter]=value;
      }
  }
  return output;
}
function generateCSV() {
  var csvContent = ""; 
  
  // 1. Filter keys where "csv" is true
  var csvKeys = Object.keys(allKeys).filter(key => allKeys[key]["csv"] === true);

  // 2. Build CSV Headers
  for (var i = 0; i < csvKeys.length; i++) {
    csvContent += csvKeys[i] + (i < csvKeys.length - 1 ? "," : "");
  }
  csvContent += "\n";

  // 3. Determine total row count based on the first valid dataset array
  var rowCount = allData[csvKeys[0]] ? allData[csvKeys[0]].length : 0;

  // 4. Build CSV Data Rows
  for (var i = 0; i < rowCount; i++) {
    for (var j = 0; j < csvKeys.length; j++) {
      var key = csvKeys[j];
      var val = (allData[key] && allData[key][i] !== undefined) ? allData[key][i] : "";
      csvContent += val + (j < csvKeys.length - 1 ? "," : "");
    }
    csvContent += "\n";
  }

  // 5. Trigger Browser Download
  var csvUrl = URL.createObjectURL(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = csvUrl;
  link.setAttribute("download", "stratostat_data.csv");
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(csvUrl);
}
