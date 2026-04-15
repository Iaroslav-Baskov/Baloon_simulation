var redColor="#F00";
var redColor2="#800";
const diagramsIm=document.getElementById("diagramsIm");
<<<<<<< HEAD
diagramsIm.width=diagramsIm.clientWidth;
diagramsIm.height=diagramsIm.clientHeight;
=======
>>>>>>> 00bf947 (update description and diagrams)
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
const m=height/aHeight*10;
var mode="baloon";
    var dmax=200000;
var data={
  altitude:1000,
<<<<<<< HEAD
  time:6500000000,
}
var limits={
  lat:{max:90, min:-90, exceptions:[0]},
  lon:{max:180, min:-180, exceptions:[0]},
  altitude:{max:100000, min:-1000, exceptions:[0]},
  AHT_temp:{max:60, min:-80, exceptions:[]},
  BMP_temp:{max:60, min:-80, exceptions:[]},
  gtemp:{max:60, min:-80, exceptions:[]},
  volt:{max:5, min:0, exceptions:[0]},
  AHT_hum:{max:100, min:0, exceptions:[]},
  BMP_pres:{max:200000, min:3000, exceptions:[]},
  pm1_0:{max:300, min:0, exceptions:[]},
  pm10_0:{max:300, min:0, exceptions:[]},
  pm2_5:{max:300, min:0, exceptions:[]},
=======
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
>>>>>>> 00bf947 (update description and diagrams)
  "03µm":{max:300, min:0, exceptions:[]},
  "05µm":{max:300, min:0, exceptions:[]},
  "10µm":{max:300, min:0, exceptions:[]},
};
var csvKeys=[
<<<<<<< HEAD
    "AHT_temp[C]", "AHT_hum", "BMP_temp[C]", "BMP_pres",
    "ax[m/s2]", "ay[m/s2]", "az[m/s2]", "gx", "gy", "gz", "gtemp",
    "magx[uT]", "magy", "magz[uT]", "voltage",
    "pm1_0", "pm2_5", "pm10_0", "p03um", "p05um", "p10um","lon","lat","altitude","UT[s]"
=======
    "now[ms]","AHT_temp[C]", "AHT_hum", "BMP_temp[C]", "BMP_pres",
    "ax[m/s2]", "ay[m/s2]", "az[m/s2]", "gx", "gy", "gz", "gtemp[C]",
    "magx[uT]", "magy[uT]", "magz[uT]", "voltage",
    "pm1_0", "pm2_5", "pm10_0", "p03um", "p05um", "p10um","lon","lat","altitude","UT[s]","malformed"
>>>>>>> 00bf947 (update description and diagrams)
];

const nameToData={
  "altitude":{"data":["altitude"],"unit":"m","labels":{"en":["altitude"],"bg":["Височина"]},"label":{"en":"altitude","bg":"Височина"}},
<<<<<<< HEAD
  "time":{"data":["UT[s]"],"unit":"s","labels":{"en":["time"],"bg":["време"]},"label":{"en":"Universal Time","bg":"Универсално време"}},
  "temperature":{"data":["AHT_temp[C]","BMP_temp[C]","gtemp"],"unit":"°C","labels":{"en":["outside temperature 1","outside temperature 2","inside temperature"],"bg":["Външна температура 1","Външна температура 2","Вътрешна температура"]},"label":{"en":"temperature","bg":"температура"}},
=======
  "now":{"data":["now[ms]"],"unit":"ms","labels":{"en":["probe time"],"bg":["Вътрешно време"]},"label":{"en":"probe time","bg":"Вътрешно време"}},
  "time":{"data":["UT[s]"],"unit":"s","labels":{"en":["time"],"bg":["време"]},"label":{"en":"Universal Time","bg":"Универсално време"}},
  "temperature":{"data":["AHT_temp[C]","BMP_temp[C]","gtemp[C]"],"unit":"°C","labels":{"en":["outside temperature 1","outside temperature 2","inside temperature"],"bg":["Външна температура 1","Външна температура 2","Вътрешна температура"]},"label":{"en":"temperature","bg":"температура"}},
>>>>>>> 00bf947 (update description and diagrams)
  "pressure":{"data":["BMP_pres"],"unit":"Pa","labels":{"en":["pressure"],"bg":["Налягане"]},"label":{"en":"pressure","bg":"Налягане"}},
  "humidity":{"data":["AHT_hum"],"unit":"%","labels":{"en":["humidity"],"bg":["Влажност"]},"label":{"en":"humidity","bg":"Влажност"}},
  "PMconc":{"data":["pm1_0","pm2_5","pm10_0"],"unit":"µg/m³","labels":{"en":["pm1_0","pm2_5","pm10_0"],"bg":["pm1_0","pm2_5","pm10_0"]},"label":{"en":"Dist concentration","bg":"Концентрация на прахови частици"}},
  "PMnum":{"data":["p03um","p05um","p10um"],"unit":"n/0.1L","labels":{"en":["p03m","p05m","p10m"],"bg":["p03m","p05m","p10m"]},"label":{"en":"Dist count","bg":"Количество прахови частици"}},
  "rssi":{"data":["rssi"],"unit":"dbm","labels":{"en":["rssi"],"bg":["rssi"]},"label":{"en":"LoRa rssi","bg":"LoRa rssi"}},
  "snr":{"data":["snr"],"unit":"dbm","labels":{"en":["snr"],"bg":["snr"]},"label":{"en":"LoRa snr","bg":"LoRa snr"}},
  "voltage":{"data":["voltage"],"unit":"V","labels":{"en":["volage"],"bg":["Напрежение"]},"label":{"en":"Battery voltage","bg":"Напрежение на батерията"}}
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
<<<<<<< HEAD
fog.src="./textures/fog.png"
var boxFront=new Image();
boxFront.crossOrigin = "anonymous";
boxFront.src="./textures/Back.png"
var baloon=new Image();
baloon.crossOrigin = "anonymous";
baloon.src="./textures/baloon.png"
var cum=new Image();
cum.crossOrigin = "anonymous";
cum.src="./textures/cum.png"
var clouds=new Image();
clouds.crossOrigin = "anonymous";
clouds.src="./textures/clouds.png"
var cur=new Image();
cur.crossOrigin = "anonymous";
cur.src="./textures/cur.png"
=======
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
>>>>>>> 00bf947 (update description and diagrams)

for(var i=0;i<5;i++){
terrain[i]=new Image();
terrain[i].crossOrigin = "anonymous";
<<<<<<< HEAD
terrain[i].src="./textures/terrain"+i+".png"}
=======
terrain[i].src="./textures/graphics/terrain"+i+".png"}
>>>>>>> 00bf947 (update description and diagrams)

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
      var c = 9 + Math.sin(i/100000 + noiseTime /7); // A sine wave of the form sin(ax + bt)
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
<<<<<<< HEAD
          var a=Math.sin(data["UT[s]"]/1000/3600/24%1*2*Math.PI-Math.PI/2);
          sun.y=height/2-45*a/aHeight*height;
          document.getElementById("rssi").innerText="rssi:" + data.rssi + "db";
          document.getElementById("snr").innerText="snr:" + data.snr + "db";
=======
    console.log(data);
    var a=Math.sin((data["UT[s]"]/1000/3600/24)%1*2*Math.PI-Math.PI/2);
    sun.y=height/2-45*a/aHeight*height;
    document.getElementById("rssi").innerText="RSSI:" + data.rssi + "dBm";
    document.getElementById("snr").innerText="SNR:" + data.snr + "dB";
>>>>>>> 00bf947 (update description and diagrams)
    horyzont=Math.acos(R/(R+data["altitude"]))/Math.PI*180;
    var horyzontH=Math.floor(horyzont*height/aHeight+height/2);
    var add=0;
    horyzontH=Math.floor(horyzontH);
    if(horyzontH<sun.y){
      add+=((sun.y-horyzontH)/height*aHeight/180*Math.PI*R/Atm);
    }
    drawCanvas(renderSky(sun.x,sun.y,data["altitude"],aWidth,1));
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
<<<<<<< HEAD
    drawBox(ctx,baloon,width/2,height*0.65-1.5*m,2*m,roll);
=======
    let size=2*m*Math.cbrt(allData["BMP_pres"][0]/data["BMP_pres"]);
    drawBox(ctx,baloon,width/2,height*0.65-1.5*m,size,roll);
>>>>>>> 00bf947 (update description and diagrams)
    ctx.drawImage(fog,0,-cloudAltitude[0]*m+data.altitude*m-cloudThickness/2,cloudThickness*m/clouds.height*clouds.width,cloudThickness*m);
    ctx.drawImage(fog,0,-cloudAltitude[1]*m+data.altitude*m-cloudThickness/2,cloudThickness*m/clouds.height*clouds.width,cloudThickness*m);
  ctx.drawImage(fog,0,-cloudAltitude[2]*m+data.altitude*m-cloudThickness/2,cloudThickness*m/clouds.height*clouds.width,cloudThickness*m);
  
      const sunZ = (1.570796) + ((height / 2.0 -height+ sun.y) / width)* aWidth/180*3.14159265;

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
<<<<<<< HEAD
          loadData(json);
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
          }if (!myChart) {
        // Create the chart for the first time
        drawChart(
            [allData["AHT_temp[C]_by_time"], allData["BMP_temp[C]_by_time"], allData["gtemp_by_time"]],
            ["outside1", "outside2", "inside"],
            "temperature",
            "°C"
        );
        } else {
            // Chart already exists, just push new data
            changeData();
        }
        map.setView([data.lat, data.lon], map.getZoom());
=======
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
>>>>>>> 00bf947 (update description and diagrams)
	}
radios.onchange=changeData;
relatedTo.onchange=changeData;
function changeData() {
    // 1. Get current selection values
    var metricKey = radios.value;
    var relationKey = relatedTo.value;

    // 2. Guard: Ensure the selected keys exist in our mapping
<<<<<<< HEAD
    if (!nameToData[metricKey] || !nameToData[relationKey]) return;
=======
    if (!nameToData.hasOwnProperty(metricKey) || !nameToData.hasOwnProperty(relationKey)) return;
>>>>>>> 00bf947 (update description and diagrams)

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
<<<<<<< HEAD

    // 4. Update the chart with the new labels and units
=======
    if(myChart==undefined){
      drawChart(input,metricInfo["labels"][langSelect.value],relationInfo["label"][langSelect.value],relationInfo["unit"]);
    }
>>>>>>> 00bf947 (update description and diagrams)
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
<<<<<<< HEAD
Chart.defaults.plugins.legend.labels.color = redColor;
Chart.defaults.scale.border.color=redColor2;
Chart.defaults.scale.grid.color=redColor2;
Chart.defaults.plugins.title.color = redColor
Chart.defaults.scale.ticks.color = redColor;
Chart.defaults.font = {
  size: font,
  family: 'myFont',
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
      options: {
            animation: {
        duration: 0
    },
    }
});
myChart.options.responsive=true;
updateChart(Data,labels,xName,xUnit)
=======
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
>>>>>>> 00bf947 (update description and diagrams)
}
function updateChart(Data,labels,xName,xUnit,yName,yUnit){
var dsets=[];
for(var i=0; i<Data.length;i++){
<<<<<<< HEAD
  dsets.push({
      pointRadius: 1,
=======
  rad=width/Data[i].length/2;
  if(rad<0.2){
    rad=0.2;
  } else if(rad>5){
    rad=5;
  }
  dsets.push({
      pointRadius: РАД,
>>>>>>> 00bf947 (update description and diagrams)
      label: labels[i],
      data: Data[i]
    });

}
myChart.data.datasets=dsets;
myChart.options.scales.x={title:{
                  display: true,
                  text: xName,
<<<<<<< HEAD
                  color: redColor
=======
                  color: "black"
>>>>>>> 00bf947 (update description and diagrams)
                },
                ticks: {
                    callback: function(value, index, ticks) {
                        return value + xUnit;
                    }
                }};
myChart.options.scales.y={title:{
                  display: true,
                  text: yName,
<<<<<<< HEAD
                  color: redColor
=======
                  color: "black"
>>>>>>> 00bf947 (update description and diagrams)
                },
                ticks: {
                    callback: function(value, index, ticks) {
                        return value + yUnit;
                    }
                }};
    myChart.update();}



var windows=[
  document.getElementById("diagrams"),
  document.getElementById("about"),
  document.getElementById("rawDataWindow"),
  document.getElementById("observationWindow"),
  document.getElementById("contacts")];
        function windowShow(n){
<<<<<<< HEAD
            windowClose();
            windows[n].style.display="block";
=======

            windowClose();
            windows[n].style.display="flex";
            changeData();
>>>>>>> 00bf947 (update description and diagrams)
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

function loadData(json){
<<<<<<< HEAD
  json=filter(json,limits);

        if (json["lat"] ) {
        if(json["lat"]>=0){
               var latlng = L.latLng(json["lat"], json["lon"]);
    marker.setLatLng(latlng); 
    polyline.addLatLng(latlng);}}
=======
  if(json["malformed"]==0){
        json=filter(json,limits);
        if (json.hasOwnProperty("lat")) {
        var latlng = L.latLng(json["lat"], json["lon"]);
        marker.setLatLng(latlng); 
        polyline.addLatLng(latlng);}
>>>>>>> 00bf947 (update description and diagrams)
          for(var index in csvKeys){
            var key=csvKeys[index];
                if(!allData[key]){
                  allData[key]=[];
                }
<<<<<<< HEAD
                if(json[key]){
                value=parseFloat(json[key]);
                data[key]=value;
                allData[key].push(value);}
=======
                
                if(json.hasOwnProperty(key)){
                  value=parseFloat(json[key]);
                  data[key]=value;
                  allData[key].push(value);}
>>>>>>> 00bf947 (update description and diagrams)
                else{
                  data[key]=undefined;
                  allData[key].push(undefined);
                }
          }
<<<<<<< HEAD
        
=======
        return true;
    }
    return false;
>>>>>>> 00bf947 (update description and diagrams)
}
function filter(json,limits){
  var output={};
  for([parameter,value] of Object.entries(json)){

    var ok=true;
<<<<<<< HEAD
    if(limits[parameter]){
=======
    if(limits.hasOwnProperty(parameter)){
>>>>>>> 00bf947 (update description and diagrams)
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
  for(key of csvKeys){
    csvContent+=key+",";
  }
  csvContent+="\n";
    for(var i=0;i<allData[csvKeys[0]].length;i++){
      for(key of csvKeys){
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
