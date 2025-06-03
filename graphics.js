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

var map2 = L.map('map2').setView([43, 25], 13);
  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 17,
  attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
}).addTo(map2);
var latlngs = [];
var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
var marker = L.marker([0, 0], {draggable: false}).addTo(map);
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

var noDataEvent;
var allData=[
  {AHT_tmp:[]}
];
async function startData() {
  const url = "https://confine.kolevi.net/aurora/log.txt"
try {
    const response = await fetch(url, {cache: "no-store"}).then((response) => response.text()).then((text) => {
        text = text.slice(0, text.length-2) + "}";
        var json=JSON.parse(text);
        console.log(json);
        for(const [key, value] of Object.entries(json)){
       if (value["lat"] ) {
        if(value["lat"]>=0){
        var latlng = L.latLng(value["lat"], value["lon"]);
        marker.setLatLng(latlng); 
        polyline.addLatLng(latlng);
            }
            for(const [parameter, value2] of Object.entries(value)){
              if(!allData[parameter]){
                allData[parameter]=[];
              }
              allData[parameter].push({x:parseFloat(value2),y:parseFloat(value.altitude)});
            }
          }
        }
       drawChart([allData.AHT_tmp,allData.BMP_tmp,allData.gtmp],["outside1","outside2","inside"],"temperature","°C");  
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
  if(noiseTime%1000==0){
    socket = new WebSocket("wss://confine.kolevi.net/ws");
    socket.addEventListener("open", (event) => {
      console.log("Connected");
      socket.send("listen");
      socket.addEventListener("message", (event) => {
  			console.log(event.data);
        update(JSON.parse(event.data));
    });
  });
  }

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
function updateDiagrams(){

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
        map.setView([data.lat, data.lon], map.getZoom());
    });
  });
}
	function update(json){
	    //tuk promenlivata json e samo nai noviq element
   
        for(var i in json) {
        	data[i] = json[i];}
          clearTimeout(noDataEvent);
          clearInterval(noise);
          noDataEvent=setTimeout(function(){
            noise=setInterval(() => {
              makeNoise(ctx);
            }, 50);
          },30000);
          yaw=Math.atan2(data.magy,data.magx)+Math.PI ;
          roll=Math.atan2(-data.ayG,data.azG);
          pitch=Math.atan2(data.axG,data.azG);
     if (json["lat"] && json["lon"]) {
     var latlng = L.latLng(json["lat"], json["lon"]);
    marker.setLatLng(latlng); 
    polyline.addLatLng(latlng);
}
          drawWorld();
	}
for(i=0;i<radios.length;i++){
radios[i].onclick=function(){
       switch(radios.value){
       case "temperature":
       updateChart([allData.AHT_tmp,allData.BMP_tmp,allData.gtmp],["outside temperature 1","outside temperature 2","inside temperature"],"temperature","°C");  
       break;
       case "pressure":
       updateChart([allData.BMP_pPa],["pressure"],"pressure","Pa");  
       break;
       case "humidity":
       updateChart([allData["AHT_hum%"]],["humidity"],"humidity","%");  
       break;
       case "PMconc":
       updateChart([allData.pm1_0,allData.pm2_5,allData.pm10_0],["pm1_0","pm2_5","pm10_0"],"concentration","µg/m³");  
       break;
       case "PMnum":
       updateChart([allData["03um"],allData["05um"],allData["10um"]],["03µm","05µm","10µm"],"number","n/0.1L");  
       break;
      }}}
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
Chart.defaults.scale.ticks.color = "#800";
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
        scales: {
            y: {
                title:{
                  display: true,
                  text: 'altitude',
                  color: "#800"
                },
                ticks: {
                    callback: function(value, index, ticks) {
                        return value + "m";
                    }
                }
            },
        }
    }
});
myChart.options.responsive=true;
updateChart(Data,labels,xName,xUnit)
}
function updateChart(Data,labels,xName,xUnit){
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
                  color: "#800"
                },
                ticks: {
                    callback: function(value, index, ticks) {
                        return value + xUnit;
                    }
                }};
    myChart.update();}
