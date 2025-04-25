const canvas=document.getElementById("image");
const width = canvas.clientWidth;
const height = canvas.clientHeight;
var sky=new Image();
sky.src="./textures/sky.png"
var fog=new Image();
fog.src="./textures/fog.png"
var boxFront=new Image();
boxFront.src="./textures/Back.png"
var clouds=new Image();
clouds.src="./textures/clouds.png"
var terrain=[];
var cloudThickness=6000;
for(var i=0;i<5;i++){
terrain[i]=new Image();
terrain[i].src="./textures/terrain"+i+".png"}
canvas.width=width;
canvas.height=height;
const maxA=90;
var aHeight;
var aWidth;
if(height>width){
aHeight=maxA;
aWidth=aHeight*width/height;}else{
  aWidth=maxA;
  aHeight=aWidth/width*height;
}
const ctx = canvas.getContext("2d");
const Atm=70000;
const R=6357000;
const m=height/aHeight*50;
var mode="baloon";
var data={
    "altitude":0,
    "pressure":1,
    "startR":0.9,
    "longitude":0,
    "latitude":0,
    "outsideTemperature":-10,
    "inside temperature":15,
    "sunHeight":-30,
    "cloudAltitude":10000
}
var sunX=width/4;
var sunY=height/2-data.sunHeight/aHeight*height;
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
    ctx.drawImage(image,x-wid/2,y-image.height/image.width*wid/2,wid,image.height/image.width*wid);
  }
  var h=Math.random()*-4+3;
  var horyzont=0;
  var v=5;
setInterval(function(){
  var dmax=200000;
  horyzont=Math.acos(R/(R+data["altitude"]))/Math.PI*180;
  var horyzontH=Math.floor(horyzont*height/aHeight+height/2);
  ctx.drawImage(sky,0,0,width,sky.height/sky.width*width);
  var add=0;
  horyzontH=Math.floor(horyzontH);
  if(horyzontH<sunY){
    add+=((sunY-horyzontH)/height*aHeight/180*Math.PI*R/Atm);
  }
  drawAtmosphere(ctx,data["altitude"],0,height, add);

  for(var i=0;i<terrain.length;i+=1/16){
  var d=dmax*(terrain.length-i)/terrain.length;
  if(i%1==0){
  var horyzont2=Math.atan(data["altitude"]/d)/Math.PI*180;
  var horyzontH2=Math.floor(horyzont2*height/aHeight+height/2);
  var imwidth=width/aWidth*maxA*(d**2+Atm**2)**0.5/(d**2+data.altitude**2)**0.5
  ctx.drawImage(terrain[i],width/2-imwidth/2,horyzontH2-imwidth*0.1,imwidth,terrain[i].height/terrain[i].width*imwidth);}
  var horyzont2=Math.atan((data["altitude"]-data.cloudAltitude)/d)/Math.PI*180;
  var horyzontH2=Math.floor(horyzont2*height/aHeight+height/2);
  var imwidth=width/aWidth*maxA*(d**2+Atm**2)**0.5/(d**2+data.altitude**2)**0.5*1.1;
  ctx.drawImage(clouds,width/2-imwidth/2+(-1)**i*0.1*imwidth,horyzontH2-clouds.height/clouds.width*imwidth,imwidth,clouds.height/clouds.width*imwidth);
}

  
  drawBox(ctx,boxFront,width/2,height/2,m*0.30);
  ctx.drawImage(fog,0,-data.cloudAltitude*m+data.altitude*m-cloudThickness*m/2,cloudThickness*m/clouds.height*clouds.width,cloudThickness*m);

h+=0.001;
data["altitude"]+=v;
data["pressure"]=Math.E**(-data["altitude"]/8400);
if(data["altitude"]>=Atm-500){// || data["altitude"]<=0){
  data["altitude"]=10;
  data["pressure"]=Math.E**(-data.altitude/8400);
  h=Math.random()*-4+3;
    //v=-v;
    //data["altitude"]+=v;k
}
data["sunHeight"]=Math.sin(h/24*2*Math.PI)*45;
sunY=height/2-data["sunHeight"]/aHeight*height;},10);
