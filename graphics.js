var canvas=document.getElementById("image");
var width = canvas.clientWidth;
var height = canvas.clientHeight;
var sky=new Image();
sky.src="./textures/sky.png"
var boxFront=new Image();
boxFront.src="./textures/Back.png"
var terrain=[];
for(var i=0;i<5;i++){
terrain[i]=new Image();
terrain[i].src="./textures/terrain"+i+".png"}
canvas.width=width;
canvas.height=height;
var aHeight=30;
var aWidth=aHeight*width/height;
const ctx = canvas.getContext("2d");
const Atm=35000;
const R=6357000;
const m=height/20;
var mode="baloon";
var data={
    "altitude":10,
    "pressure":1,
    "startR":0.9,
    "longitude":0,
    "latitude":0,
    "outsideTemperature":-10,
    "inside temperature":15,
    "sunHeight":-30,
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
    
    const max=Math.max(k2**((theta/airMass/col)**2),1e-10);
    const red = Math.min(255, I_red  * 255)*IR/max;
    const green = Math.min(255, I_green * 255)*IG/max;
    const blue = Math.min(255, I_blue * 255)*IB/max;

    return `rgba(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)}, ${max})`;
  }
  function drawAtmosphere(ctx,altitude,minH,maxH,Add, step=10){
    var background = ctx.createLinearGradient(0,minH, 0,maxH);
    for(var y=minH;y<=maxH;y+=(maxH-minH)/step){
          var dist=Math.sqrt(sunX**2+(y-sunY)**2)/width*aWidth;
          var z=(90-(height/2-y)/height*aHeight)/180*Math.PI;
          var yAtm=Atm-altitude;
          var airmass=(R/yAtm*Math.sqrt(Math.cos(z)**2+2*yAtm/R+(yAtm/R)**2)-R/yAtm*Math.cos(z))*(yAtm/Atm);
          var add=Add;
          background.addColorStop((y-minH)/(maxH-minH),skyColor(dist,airmass,1,1,1,add));
    }
    ctx.fillStyle=background;
    ctx.fillRect(0,minH,width, maxH);
  }
  function drawBox(ctx,image, x,y,wid=300,angle=0){
    ctx.drawImage(image,x-wid/2,y-image.height/image.width*wid/2,wid,image.height/image.width*wid);
  }
  var h=-2;
  var horyzont=0;
  var v=500;
setInterval(function(){

  horyzont=Math.acos(R/(R+data["altitude"]))/Math.PI*180;
  var horyzontH=Math.floor(horyzont*height/aHeight+height/2);
  ctx.drawImage(sky,0,0,width,sky.height/sky.width*width);
  var add=0;
  horyzontH=Math.floor(horyzontH);
  if(horyzontH<sunY){
    add+=((sunY-horyzontH)/height*aHeight/180*Math.PI*R/Atm);
  }
  drawAtmosphere(ctx,data["altitude"],0,height, add);
  for(var i=0;i<terrain.length;i++){
  var d=300000/(i+0.5);
  var horyzont=Math.atan(data["altitude"]/d)/Math.PI*180;
  var horyzontH=Math.floor(horyzont*height/aHeight+height/2);
  ctx.drawImage(terrain[i],0,horyzontH-width/10,width,terrain[i].height/terrain[i].width*width);}
  drawBox(ctx,boxFront,width/2,height/2);

h+=0.01;
data["altitude"]+=v;
data["pressure"]=Math.E**(-data["altitude"]/8400);
if(data["altitude"]>=Atm-500){// || data["altitude"]<=0){
  data["altitude"]=10;
  data["pressure"]=Math.E**(-data["altitude"]/8400);
  h=Math.random()*-2;
    //v=-v;
    //data["altitude"]+=v;k
}
data["sunHeight"]=Math.sin(h/24*2*Math.PI)*45;
sunY=height/2-data["sunHeight"]/aHeight*height;},500);
