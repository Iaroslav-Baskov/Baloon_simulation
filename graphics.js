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
var roll;
var pitch;
var yaw;
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


function predictBatteryLevel(voltage,flags){
  return 100;
}
function predictSunPosition(utHours, lat, lon, altitude) {
    const rad = Math.PI / 180;

    // 1. Get current date components to calculate the correct Julian Day
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1; // JS months are 0-11
    const day = now.getUTCDate();

    // 2. Calculate Julian Day (standard astronomical formula)
    // This converts the current date + your utHours into a continuous day count
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    const JD = Math.floor(365.25 * (year + 4716)) + 
               Math.floor(30.6001 * (month + 1)) + 
               day + B - 1524.5 + (utHours / 24);

    const d = JD - 2451545.0; // Days since J2000.0 epoch

    // 3. Solar Coordinates (Position of the sun in space)
    const g = (357.529 + 0.98560028 * d) % 360; // Mean Anomaly
    const q = (280.459 + 0.98564736 * d) % 360; // Mean Longitude
    const L = (q + 1.915 * Math.sin(g * rad) + 0.020 * Math.sin(2 * g * rad)) % 360; // Ecliptic Longitude
    const e = 23.439 - 0.00000036 * d; // Obliquity of Earth's axis

    // 4. Celestial Coordinates (Equatorial system)
    const ra = Math.atan2(Math.cos(e * rad) * Math.sin(L * rad), Math.cos(L * rad)) / rad;
    const dec = Math.asin(Math.sin(e * rad) * Math.sin(L * rad)) / rad;

    // 5. Sidereal Time (Earth's rotation relative to stars)
    // We use the specific hours provided to find where your longitude is facing
    const GMST = (280.46061837 + 360.98564736629 * d) % 360;
    const LMST = GMST + lon;
    
    let H = LMST - ra; // Hour Angle
    while (H < -180) H += 360;
    while (H > 180) H -= 360;

    // 6. Transformation to Horizontal Coordinates (Azimuth/Elevation)
    const latRad = lat * rad;
    const decRad = dec * rad;
    const hRad = H * rad;

    let elevation = Math.asin(Math.sin(latRad) * Math.sin(decRad) + 
                    Math.cos(latRad) * Math.cos(decRad) * Math.cos(hRad)) / rad;
    
    let azimuth = Math.atan2(-Math.sin(hRad), 
                  Math.cos(latRad) * Math.tan(decRad) - Math.sin(latRad) * Math.cos(hRad)) / rad;
    
    azimuth = (azimuth + 360) % 360;

    // 7. Atmospheric Refraction Correction
    // Higher altitude = thinner air = less "bending" of light
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

var secondaryData={
  "UT[h]":{"sources":["UT[s]"],"formula":(x)=>(x/3600)},
  "now[h]":{"sources":["now[ms]"],"formula":(x)=>(x/3600/1000)},
  "batteryLevel":{"sources":["voltage","flags"],"formula":(v,f)=>(predictBatteryLevel(v,f))},
  "sunX":{"sources":["UT[h]","lat","lon","altitude"],"formula":(UT,lat,lon,alt)=>(predictSunPosition(UT, lat, lon, alt).azimuth/360*aWidth)},
  "sunY":{"sources":["UT[h]","lat","lon","altitude"],"formula":(UT,lat,lon,alt)=>(height/2-predictSunPosition(UT, lat, lon, alt).elevation/180*aHeight)},
  "heatingon":{"sources":["flags"],"formula":(f)=>(f&1)}
}
var limits={
  "lat":{max:90, min:-90, exceptions:[]},
  "lon":{max:180, min:-180, exceptions:[]},
  "altitude":{max:100000, min:-1000, exceptions:[]},
  "AHT_temp[C]":{max:60, min:-80, exceptions:[]},
  "BMP_temp[C]":{max:60, min:-80, exceptions:[]},
  "gtemp[C]":{max:60, min:-80, exceptions:[]},
  "voltage":{max:5, min:0, exceptions:[0]},
  "AHT_hum":{max:100, min:0, exceptions:[]},
  "BMP_pres":{max:200000, min:3000, exceptions:[]},
  "pm1_0":{max:300, min:0, exceptions:[]},
  "pm10_0":{max:300, min:0, exceptions:[]},
  "pm2_5":{max:300, min:0, exceptions:[]},
  "03µm":{max:300, min:0, exceptions:[]},
  "05µm":{max:300, min:0, exceptions:[]},
  "10µm":{max:300, min:0, exceptions:[]},
};
var allKeys={
  "now[h]":{"csv":true,"table":false,"diagrams":true,"name":"now"},
  "rssi":{"csv":true,"table":true,"name":"rssi"},
  "snr":{"csv":true,"table":true,"name":"snr"},
  "AHT_temp[C]":{"csv":true,"table":false,"name":"outside_temperature"},
  "AHT_hum":{"csv":true,"table":true,"name":"humidity"},
  "BMP_temp[C]":{"csv":true,"table":false,"name":"outside_temperature"},
  "BMP_pres":{"csv":true,"table":true,"name":"pressure"},
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
  "heatingon":{"csv":true,"table":false,"name":"heatingOn"},
  "sunX":{"csv":false,"table":false},
  "sunY":{"csv":false,"table":false},
  "flags":{"csv":false,"table":false},
};
const nameToData={
  "altitude":{"data":["altitude"],"unit":"m","labels":{"en":["altitude"],"bg":["Височина"]},"label":{"en":"altitude","bg":"Височина"}},
  "now":{"data":["now[h]"],"unit":"h","labels":{"en":["probe time"],"bg":["Вътрешно време"]},"label":{"en":"probe time","bg":"Вътрешно време"}},
  "time":{"data":["UT[h]"],"unit":"h","labels":{"en":["time"],"bg":["време"]},"label":{"en":"Universal Time","bg":"Универсално време"}},
  "inside_temperature":{"data":["gtemp[C]"],"unit":"°C","labels":{"en":["temperature"],"bg":["температура"]},"label":{"en":"Inside temperature","bg":"Вътрешна температура"}},
  "outside_temperature":{"data":["AHT_temp[C]","BMP_temp[C]"],"unit":"°C","labels":{"en":["outside temperature 1","outside temperature 2"],"bg":["Външна температура 1","Външна температура 2"]},"label":{"en":"Outside temperature","bg":"Външна температура"}},
  "pressure":{"data":["BMP_pres"],"unit":"Pa","labels":{"en":["pressure"],"bg":["Налягане"]},"label":{"en":"pressure","bg":"Налягане"}},
  "humidity":{"data":["AHT_hum"],"unit":"%","labels":{"en":["humidity"],"bg":["Влажност"]},"label":{"en":"humidity","bg":"Влажност"}},
  "PMconc":{"data":["pm1_0","pm2_5","pm10_0"],"unit":"µg/m³","labels":{"en":["pm1_0","pm2_5","pm10_0"],"bg":["pm1_0","pm2_5","pm10_0"]},"label":{"en":"Dist concentration","bg":"Концентрация на прахови частици"}},
  "PMnum":{"data":["p03um","p05um","p10um"],"unit":"n/0.1L","labels":{"en":["p03m","p05m","p10m"],"bg":["p03m","p05m","p10m"]},"label":{"en":"Dist count","bg":"Количество прахови частици"}},
  "rssi":{"data":["rssi"],"unit":"dbm","labels":{"en":["rssi"],"bg":["rssi"]},"label":{"en":"LoRa rssi","bg":"LoRa rssi"}},
  "snr":{"data":["snr"],"unit":"dbm","labels":{"en":["snr"],"bg":["snr"]},"label":{"en":"LoRa snr","bg":"LoRa snr"}},
  "voltage":{"data":["voltage"],"unit":"V","labels":{"en":["volage"],"bg":["Напрежение"]},"label":{"en":"Battery voltage","bg":"Напрежение на батерията"}},
  "batteryLevel":{"data":["batteryLevel"],"unit":"%","labels":{"en":["charge"],"bg":["Ниво"]},"label":{"en":"Battery level","bg":"Ниво на батерията"}},
  "heatingOn":{"data":["heatingon"],"unit":"","labels":{"en":["is on?"],"bg":["Включено"]},"label":{"en":"Heating activation","bg":"Активация на нагревателя"}},
}
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
var sun={x:width/4,y:0}

var noDataEvent;
var allData=[
  {AHT_temp:[]}
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
    const url = "https://aurora.stratostat.com/log.txt";

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
        for (const [key, value] of Object.entries(json)) {
            loadData(value);
        }

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
    root.style.setProperty('--yaw', yaw/Math.PI*180);
    root.style.setProperty('--roll', roll/Math.PI*180);
    root.style.setProperty('--pitch', pitch/Math.PI*180);
    var cloudN0=2;
    var cloudN1=5;
    var cloudN2=25;
    for(var i=0;i<terrain.length;i+=1){
    var d=dmax*(terrain.length-i)/terrain.length;
    drawLayer(terrain[i],d,data.altitude,0,0,true);
    for(j=0;j<cloudN0;j++){
    d=dmax*(terrain.length-i-j/cloudN0)/terrain.length;
    var offset = Math.sin((i+j/cloudN0)*2)*0.1;
    drawLayer(cum,d,data.altitude,cloudAltitude[0],offset);
  }
    for(j=0;j<cloudN1;j++){
    d=dmax*(terrain.length-i-j/cloudN1)/terrain.length;
    var offset = Math.sin((i+j/cloudN1)/3)/2+Math.sin((i+j/cloudN2)*3*Math.PI)/2;
    drawLayer(clouds,d,data.altitude,cloudAltitude[1],offset)
  }
    for(j=0;j<cloudN2;j++){
    d=dmax*(terrain.length-i-j/cloudN2)/terrain.length;
    var offset = Math.sin((i+j/cloudN2)/3)/2+Math.sin((i+j/cloudN2)*cloudN2/8*Math.PI);
    drawLayer(cur,d,data.altitude,cloudAltitude[2],offset)
  }
}
    drawBox(ctx,boxFront,width/2,height*0.65-1.5*m,0.3*m,roll);

    let size=2*m*Math.cbrt(allData["BMP_pres"][0]/data["BMP_pres"]);
    drawBox(ctx,baloon,width/2,height*0.65-1.5*m,size,roll);
    ctx.drawImage(fog,0,-cloudAltitude[0]*m+data.altitude*m-cloudThickness/2,cloudThickness*m/clouds.height*clouds.width,cloudThickness*m);
    ctx.drawImage(fog,0,-cloudAltitude[1]*m+data.altitude*m-cloudThickness/2,cloudThickness*m/clouds.height*clouds.width,cloudThickness*m);
  ctx.drawImage(fog,0,-cloudAltitude[2]*m+data.altitude*m-cloudThickness/2,cloudThickness*m/clouds.height*clouds.width,cloudThickness*m);
  
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
            
            yaw=Math.atan2(data["magy[uT]"],data["magx[uT]"])+Math.PI ;
            roll=Math.atan2(-data["ay[m/s2]"],data["az[m/s2]"]);
            pitch=Math.atan2(data["ax[m/s2]"],data["az[m/s2]"]);
            drawWorld();
            if(observer!=undefined){
              observerMoved();
            }
            changeData();
          map.setView([data.lat, data.lon], map.getZoom());
      }
	}
radios.onchange=changeData;
relatedTo.onchange=changeData;
function changeData() {
    // 1. Get current selection values
    var metricKey = radios.value;
    var relationKey = relatedTo.value;

    // 2. Guard: Ensure the selected keys exist in our mapping

    if (!nameToData.hasOwnProperty(metricKey) || !nameToData.hasOwnProperty(relationKey)) return;


    var input = [];
    var metricInfo = nameToData[metricKey];
    var relationInfo = nameToData[relationKey];

    // 3. Corrected Loop: Use 'of' to get values, not 'in'
    for (var index in  metricInfo["data"]) {
      col = metricInfo["data"][index];
      input.push([]);
        for(var i=0; i<allData[col].length; i++){
          input[input.length-1].push({x:allData[relationInfo["data"][0]][i], y:allData[col][i]});
        }
    }

    if(myChart==undefined){
      drawChart(input,metricInfo["labels"][langSelect.value],relationInfo["label"][langSelect.value],relationInfo["unit"]);
    }
    updateChart(
        input,
        metricInfo["labels"][langSelect.value],
        relationInfo["label"][langSelect.value],
        relationInfo["unit"],
        metricInfo["label"][langSelect.value],
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
function drawChart(Data,labels,xName,xUnit){
  var dsets=[];
  for(var i=0; i<Data.length;i++){
    dsets.push({
        pointRadius: 1,
        label: labels[i],
        data: Data[i]
      });
  }
  myChart=new Chart("diagramsIm", {
    type: "scatter",
    plugins: [{
              // Custom plugin to force white background
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
      }
  });
  updateChart(Data,labels,xName,xUnit)
}
function updateChart(Data,labels,xName,xUnit,yName,yUnit){
var dsets=[];
for(var i=0; i<Data.length;i++){

  rad=width/Data[i].length/2;
  if(rad<0.2){
    rad=0.2;
  } else if(rad>5){
    rad=5;
  }
  dsets.push({
      pointRadius: rad,
      label: labels[i],
      data: Data[i]
    });

}
myChart.data.datasets=dsets;
myChart.options.scales.x={title:{
                  display: true,
                  text: xName,
                },
                ticks: {
                    callback: function(value, index, ticks) {
                        return value + xUnit;
                    }
                }};
myChart.options.scales.y={title:{
                  display: true,
                  text: yName,
                  color: "black"
                },
                ticks: {
                    callback: function(value, index, ticks) {
                        return value + yUnit;
                    }
                }};
    myChart.update();}
function createTable(){
  table.innerHTML="";
  for(let name in allKeys){
    if(allKeys[name]["table"]){
      let label=nameToData[allKeys[name]["name"]]['label'][langSelect.value]
      let element = "<div class='file'>"+label+":<div style='flex-grow:1;'></div><div  id='"+name+"'></div></div>";
      table.innerHTML=table.innerHTML+element;}}
}

function fillTable(){
  for(let name in allKeys){
    if(allKeys[name]["table"]){
      document.getElementById(name).innerHTML=""+ data[name] + nameToData[allKeys[name]["name"]]['unit']}}}
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
    if(values.includes(undefined)){
      json[key]=undefined;
    }else{
      json[key]=secondaryData[key].formula(...values);
    }
  }
  return json;
}

function loadData(json){
  if(json["malformed"]==0){
        json=filter(json,limits);
        if (json.hasOwnProperty("lat")) {
        var latlng = L.latLng(json["lat"], json["lon"]);
        marker.setLatLng(latlng); 
        polyline.addLatLng(latlng);}
        json=calcSecondaryData(json);
        for(var index in allKeys){
          var key=index;
          if(!allData[key]){
            allData[key]=[];
          }
          if(json.hasOwnProperty(key)){
            value=parseFloat(json[key]);
            data[key]=value;
            allData[key].push(value);}
          else{
            data[key]=undefined;
            allData[key].push(undefined);
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
    
      if(ok==true){
        output[parameter]=value;
      }
  }
  return output;
}
function generateCSV(){
  var csvContent = ""; 
  for(key of allKeys){
    csvContent+=key+",";
  }
  csvContent+="\n";
    for(var i=0;i<allData[allKeys[0]].length;i++){
      for(key of allKeys){
        csvContent+=allData[key][i]+",";
      }
      csvContent+="\n";
    }
    csvUrl = URL.createObjectURL(new Blob([csvContent], { type: "text/csv;charset=utf-8;",}));
const link = document.createElement("a");
link.href = csvUrl;
link.setAttribute("download", "stratostat_data.csv"); // Set the filename

// 4. Append to body, click it, and remove it
document.body.appendChild(link);
link.click();
document.body.removeChild(link);

// 5. Clean up the URL to free up memory
URL.revokeObjectURL(csvUrl);
}
