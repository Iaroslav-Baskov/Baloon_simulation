const canvas=document.getElementById("image");
const diagramsIm=document.getElementById("diagramsIm");
diagramsIm.width=diagramsIm.clientWidth;
diagramsIm.height=diagramsIm.clientHeight;
const width = canvas.clientWidth;
const height = canvas.clientHeight;
var terrain=[];
var langSelect=document.getElementById("lang");
var cloudThickness=1000;
var cloudAltitude=[2000,8000,16000];
canvas.width=width;
canvas.height=height;
const maxA=90;
var aHeight;
var aWidth;
var zeroHour;
var horyzont=0;
var csvFileLink=document.getElementById("csvFile");
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
const ctx = canvas.getContext("2d");
const Atm=40000;
const R=6357000;
const m=height/aHeight*10;
var mode="baloon";
    var dmax=200000;
var data={
  altitude:30000,
  time:6500000000,
}
var limits={
  lat:{max:90, min:-90, exceptions:[0]},
  lon:{max:180, min:-180, exceptions:[0]},
  altitude:{max:100000, min:-1000, exceptions:[]},
  AHT_temp:{max:60, min:-80, exceptions:[]},
  BMP_temp:{max:60, min:-80, exceptions:[]},
  gtemp:{max:60, min:-80, exceptions:[]},
  volt:{max:5, min:0, exceptions:[]},
  AHT_hum:{max:100, min:0, exceptions:[]},
  BMP_pres:{max:200000, min:3000, exceptions:[]},
  pm1_0:{max:300, min:0, exceptions:[]},
  pm10_0:{max:300, min:0, exceptions:[]},
  pm2_5:{max:300, min:0, exceptions:[]},
  "03µm":{max:300, min:0, exceptions:[]},
  "05µm":{max:300, min:0, exceptions:[]},
  "10µm":{max:300, min:0, exceptions:[]},
};
var csvKeys=[
    "AHT_temp", "AHT_hum", "BMP_temp", "BMP_pres",
    "ax", "ay", "az", "gx", "gy", "gz", "gtemp",
    "magx", "magy", "magz", "volt",
    "pm1_0", "pm2_5", "pm10_0", "03um", "05um", "10um","lon","lat","altitude","time"
];
var csvContent = ""; 
for(key of csvKeys){
  csvContent+=key+",";
}
var csvUrl = URL.createObjectURL(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }));
var noiseTime = 0;
var noise=setInterval(() => {
  makeNoise(ctx);
}, 50);
var map = L.map('map').setView([43, 25], 13);
  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 17,
  attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
}).addTo(map);
var latlngs = [];
var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
var marker = L.marker([0, 0], {draggable: false}).addTo(map);
var map2;
var observer;
var sightRay;
var sky=new Image();
sky.src="./textures/sky.png"
var fog=new Image();
fog.src="./textures/fog.png"
var boxFront=new Image();
boxFront.src="./textures/Back.png"
var baloon=new Image();
baloon.src="./textures/baloon.png"
var cum=new Image();
cum.src="./textures/cum.png"
var clouds=new Image();
clouds.src="./textures/clouds.png"
var cur=new Image();
cur.src="./textures/cur.png"
for(var i=0;i<5;i++){
terrain[i]=new Image();
terrain[i].src="./textures/terrain"+i+".png"}
var sunX=width/4;
var sunY=0;
const form = document.forms[0];
const radios = form.elements["selectData"];
const relatedTo = form.elements["relTo"];

var noDataEvent;
var allData=[
  {AHT_temp:[]}
];
async function startData() {
  const url = "https://confine.kolevi.net/aurora/log.txt"
try {
    const response = await fetch(url, {cache: "no-store"}).then((response) => response.text()).then((text) => {
        text = text.slice(0, text.length-2) + "}";
        var json=JSON.parse(text);
        console.log(json);
        for(const [key, value] of Object.entries(json)){
         loadData(value);
        }
       drawChart([allData.AHT_temp,allData.BMP_temp,allData.gtemp],["outside1","outside2","inside"],"temperature","°C");  
});
}
catch(err) {
    console.log(err);
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
  ctx.fillStyle="red";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText("waiting", width/2,height/2-0.5/aWidth*width*5);
  ctx.fillText("for data", width/2,height/2+0.5/aWidth*width*5);

}

function skyColor(angularDistance, airMass,Ir0=1,Ig0=1,Ib0=1,additiveAirmass=0,clouds=0) {
    const theta = (angularDistance * Math.PI) / 180;
    const sigma=0.998;
    const k2=1e-20;
    const wavelengths = {
      red: 700e-9,
      green: 550e-9,
      blue: 450e-9,
    };
    const IR=0.8*Ir0;
    const IG=1*Ig0;
    const IB=1*Ib0;

    function rayleighScattering(lambda) {
        var col=(wavelengths.red/lambda)**4;
      return (
        k2**(clouds*(theta/airMass)**2 + (theta/col/airMass)**2*(1-clouds))*(sigma**((additiveAirmass+airMass)*col))
      );
    }
    const I_red = rayleighScattering(wavelengths.red);
    const I_green = rayleighScattering(wavelengths.green);
    const I_blue = rayleighScattering(wavelengths.blue);
    var col=1/(Math.pow(wavelengths.blue, 4)/Math.pow(wavelengths.red, 4));
    
    const max=k2**((theta/airMass/col)**2)*(Ir0+Ig0+Ib0)/3;
    const red = Math.min(255, I_red  * 255)*IR;
    const green = Math.min(255, I_green * 255)*IG;
    const blue = Math.min(255, I_blue * 255)*IB;

    return `rgba(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)}, ${max})`;
  }
  function drawAtmosphere(ctx,altitude,minH,maxH,Add, step=10){
    var background = ctx.createLinearGradient(0,minH, 0,maxH);
    for(var y=minH;y<=maxH;y+=(maxH-minH)/step){
          var dist=Math.sqrt(sunX**2+(y-sunY)**2)/width*aWidth;
          var z=(90-(height/2-y)/height*aHeight)/180*Math.PI;
          var yAtm=Atm-altitude;
          var airmass=Math.max((R/yAtm*Math.sqrt(Math.cos(z)**2+2*yAtm/R+(yAtm/R)**2)-R/yAtm*Math.cos(z))*(yAtm/Atm),0);
          var add=Add;
          background.addColorStop((y-minH)/(maxH-minH),skyColor(dist,airmass,1,1,1,add));
    }
    ctx.fillStyle=background;
    ctx.fillRect(0,minH,width, maxH);
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
          var a=Math.sin(data.time/1000/3600/24%1*2*Math.PI-Math.PI/2);
          sunY=height/2-45*a/aHeight*height;
    horyzont=Math.acos(R/(R+data["altitude"]))/Math.PI*180;
    var horyzontH=Math.floor(horyzont*height/aHeight+height/2);
    ctx.drawImage(sky,0,0,width,sky.height/sky.width*width);
    var add=0;
    horyzontH=Math.floor(horyzontH);
    if(horyzontH<sunY){
      add+=((sunY-horyzontH)/height*aHeight/180*Math.PI*R/Atm);
    }
    drawAtmosphere(ctx,data["altitude"],0,height, add);

    root.style.setProperty('--altitude', data.altitude);
    root.style.setProperty('--yaw', yaw/Math.PI*180);
    root.style.setProperty('--roll', roll/Math.PI*180);
    root.style.setProperty('--pitch', pitch/Math.PI*180);
    altMarker.innerText=Math.floor(data.altitude)+"m";
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
    drawBox(ctx,baloon,width/2,height*0.65-1.5*m,2*m,roll);
    ctx.drawImage(fog,0,-cloudAltitude[0]*m+data.altitude*m-cloudThickness/2,cloudThickness*m/clouds.height*clouds.width,cloudThickness*m);
    ctx.drawImage(fog,0,-cloudAltitude[1]*m+data.altitude*m-cloudThickness/2,cloudThickness*m/clouds.height*clouds.width,cloudThickness*m);
  ctx.drawImage(fog,0,-cloudAltitude[2]*m+data.altitude*m-cloudThickness/2,cloudThickness*m/clouds.height*clouds.width,cloudThickness*m);
}
startData();
  terrain[terrain.length-1].onload=function(){

    
    const socket = new WebSocket("wss://confine.kolevi.net/ws");

    socket.addEventListener("open", (event) => {
      console.log("Connected");
      socket.send("listen");
      socket.addEventListener("message", (event) => {
  			console.log(event.data);
        update(JSON.parse(event.data));
    });
  });
}
	function update(json){
	    //tuk promenlivata json e samo nai noviq element
          loadData(json);
          clearTimeout(noDataEvent);
          clearInterval(noise);
          noDataEvent=setTimeout(function(){
            noise=setInterval(() => {
              makeNoise(ctx);
            }, 50);
          },40000);
          yaw=Math.atan2(data.magy,data.magx)+Math.PI ;
          roll=Math.atan2(-data.ay,data.az);
          pitch=Math.atan2(data.ax,data.az);

          drawWorld();
          if(observer!=undefined){
            observerMoved();
          }
          changeData();
        map.setView([data.lat, data.lon], map.getZoom());
	}
radios.onchange=changeData;
relatedTo.onchange=changeData;
function changeData(){
  if(relatedTo.value=="altitude"){
       switch(radios.value){
       case "temperature":
       updateChart([allData.AHT_temp,allData.BMP_temp,allData.gtemp],["outside temperature 1","outside temperature 2","inside temperature"],"temperature","°C","altitude","m");  
       break;
       case "temperature_byTime":
       updateChart([allData["AHT_temp_byTime"],allData["BMP_temp_byTime"],allData["gtemp_byTime"],],["outside temperature 1","outside temperature 2","inside temperature"],"time","h","temperature","°C"); 
       break;
       case "pressure":
       updateChart([allData.BMP_pres],["pressure"],"pressure","Pa","altitude","m");  
       break;
       case "humidity":
       updateChart([allData["AHT_hum"]],["humidity"],"humidity","%","altitude","m");  
       break;
       case "PMconc":
       updateChart([allData.pm1_0,allData.pm2_5,allData.pm10_0],["pm1_0","pm2_5","pm10_0"],"concentration","µg/m³","altitude","m");  
       break;
       case "PMnum":
       updateChart([allData["03um"],allData["05um"],allData["10um"]],["03µm","05µm","10µm"],"number","n/0.1L","altitude","m");  
       break;
       case "rssi":
       updateChart([allData["rssi"]],["rssi"],"rssi","db","altitude","m");  
       break;
       case "snr":
       updateChart([allData["snr"]],["snr"],"snr","db","altitude","m");  
       break;
       case "volt":
       updateChart([allData["volt"]],["battery voltage"],"battery voltage","v","altitude","m");  
       break;
      }}else{
       switch(radios.value){
       case "temperature":
       updateChart([allData["AHT_temp_byTime"],allData["BMP_temp_byTime"],allData["gtemp_byTime"],],["outside temperature 1","outside temperature 2","inside temperature"],"time","h","temperature","°C"); 
       break;
       case "pressure":
       updateChart([allData.BMP_pres_byTime],["pressure"],"time","h","pressure","Pa");  
       break;
       case "humidity":
       updateChart([allData["AHT_hum_byTime"]],["humidity"],"time","h","humidity","%");  
       break;
       case "PMconc":
       updateChart([allData.pm1_0_byTime,allData.pm2_5_byTime,allData.pm10_0_byTime],["pm1_0","pm2_5","pm10_0"],"time","h","concentration","µg/m³");  
       break;
       case "PMnum":
       updateChart([allData["03um_byTime"],allData["05um_byTime"],allData["10um_byTime"]],["03µm","05µm","10µm"],"time","h","number","n/0.1L");  
       break;
       case "rssi":
       updateChart([allData["rssi_byTime"]],["rssi"],"time","h","rssi","db");  
       break;
       case "snr":
       updateChart([allData["snr_byTime"]],["snr"],"time","h","snr","db");  
       break;
      case "volt":
       updateChart([allData["volt_byTime"]],["battery voltage"],"time","h","battery voltage","v");  
       break;
      }
      }
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
}
var myChart;
var font=parseFloat(getComputedStyle(document.body).getPropertyValue('font-size'));
Chart.defaults.plugins.legend.labels.color = "#F00";
Chart.defaults.scale.border.color="#800";
Chart.defaults.scale.grid.color="#800";
Chart.defaults.plugins.title.color = "#F00"
Chart.defaults.scale.ticks.color = "#F00";
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
}
function updateChart(Data,labels,xName,xUnit,yName,yUnit){
var dsets=[];
for(var i=0; i<Data.length;i++){
  dsets.push({
      pointRadius: 1,
      label: labels[i],
      data: Data[i]
    });

}
myChart.data.datasets=dsets;
myChart.options.scales.x={title:{
                  display: true,
                  text: xName,
                  color: "#F00"
                },
                ticks: {
                    callback: function(value, index, ticks) {
                        return value + xUnit;
                    }
                }};
myChart.options.scales.y={title:{
                  display: true,
                  text: yName,
                  color: "#F00"
                },
                ticks: {
                    callback: function(value, index, ticks) {
                        return value + yUnit;
                    }
                }};
    myChart.update();}



var windows=[document.getElementById("diagrams"),document.getElementById("about"),document.getElementById("rawDataWindow"),document.getElementById("observationWindow")];
        function windowShow(n){
            windowClose();
            windows[n].style.display="block";
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
sightRay = L.polyline([], {color: 'red'}).addTo(map2);
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
  json=filter(json,limits);
        if(json.time && zeroHour==undefined){
          zeroHour=json.time;
        }
        if (json["lat"] ) {
        if(json["lat"]>=0){
               var latlng = L.latLng(json["lat"], json["lon"]);
    marker.setLatLng(latlng); 
    polyline.addLatLng(latlng);}}
          for(var [parameter, value] of Object.entries(json)){
              value=parseFloat(value);
              if(!allData[parameter]){
                allData[parameter]=[];
              }
              if(!allData[parameter+"_byTime"]){
                allData[parameter+"_byTime"]=[];
              }
              data[parameter]=value;
              if(json["altitude"]){
              allData[parameter].push({x:parseFloat(value),y:parseFloat(json.altitude)});}
              if(json["time"]){
                allData[parameter+"_byTime"].push({y:parseFloat(value),x:parseFloat(((json.time-zeroHour)/1000/3600))});
              }
            }
            var row="\n"
            for(key of csvKeys){
              if(data[key]){
                row+=data[key];
              }else{
                row+="undefined";
              }
              row+=",";
            }
            csvContent+=row;
            URL.revokeObjectURL(csvUrl);
            csvUrl = URL.createObjectURL(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }));
            if (csvFileLink) csvFileLink.href = csvUrl;

        
}
function filter(json,limits){
  var output={};
  for([parameter,value] of Object.entries(json)){

    var ok=true;
    if(limits[parameter]){
      if(limits[parameter].max<value){
        ok=false;
      }
      if(limits[parameter].min>value){
        ok=false;
      }
      for(var i=0;i<limits[parameter].exceptions.length;i++){
        if(value==limits[parameter].exceptions[i]){
          ok=false;
        }
      }}
    
      if(ok==true){
        output[parameter]=value;
      }
  }
  return output;
}
