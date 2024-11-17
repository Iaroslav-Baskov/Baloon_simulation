var canvas=document.getElementById("image");
var width = canvas.clientWidth;
var height = canvas.clientHeight;
canvas.width=width;
canvas.height=height;
var aWidth=60;
var aHeight=aWidth*height/width;
const ctx = canvas.getContext("2d");
const Atm=35000;
const R=6357000;
const m=40;
var mode="baloon";
var data={
    "height":0,
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
function skyColor(angularDistance, airMass,I0=1,sigma =1.01) {
    const theta = (angularDistance * Math.PI) / 180;
    const wavelengths = {
      red: 700e-9,
      green: 550e-9,
      blue: 450e-9,
    };
    const IR=0.8;
    const IG=1;
    const IB=1;

    function rayleighScattering(lambda) {
        var col=1/(Math.pow(lambda, 4)/Math.pow(550e-9, 4))
      return (
        I0  *2**-((theta/col/airMass*5)**2)/((sigma)**(airMass*col))
      );
    }
    const I_red = rayleighScattering(wavelengths.red);
    const I_green = rayleighScattering(wavelengths.green);
    const I_blue = rayleighScattering(wavelengths.blue);

    const red = Math.min(255, I_red  * 255)*IR;
    const green = Math.min(255, I_green * 255)*IG;
    const blue = Math.min(255, I_blue * 255)*IB;

    return `rgb(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)})`;
  }
  function drawAtmosphere(step=5){
    for(var x=0;x<width;x+=step){
      horyzont=Math.acos(R/(R+data['height']))/Math.PI*180;
      for(var y=0;y<horyzont*height/aHeight+height/2;y+=step){
          var dist=Math.sqrt((x-sunX)**2+(y-sunY)**2)/width*aWidth;
          var z=(90-(height/2-y)/height*aHeight)/180*Math.PI;
          var yAtm=Atm-data["height"];
          var airmass=R/yAtm*Math.sqrt(Math.cos(z)**2+2*yAtm/R+(yAtm/R)**2)-R/yAtm*Math.cos(z);
          if(horyzont<sunY){
            ctx.fillStyle=skyColor(dist,airmass*(yAtm/Atm),1,1.01+0.5*(sunY-horyzont)/height*aHeight/90);
          }
          else{
          ctx.fillStyle=skyColor(dist,airmass*(yAtm/Atm));}
          ctx.fillRect(x,y,step,step);
      }
      ctx.fillStyle="black";
      ctx.fillRect(0,horyzont*height/aHeight+height/2,width,height);
  }
  }
  function grawBaloon(x,y){
    var dist=0;
    var z=(90-(height/2-y)/height*aHeight)/180*Math.PI;
    var yAtm=Atm-data["height"];
    var airmass=R/yAtm*Math.sqrt(Math.cos(z)**2+2*yAtm/R+(yAtm/R)**2)-R/yAtm*Math.cos(z);
    const gradient = ctx.createRadialGradient(x, y,0, x, y,m*data["startR"]/data["pressure"]**0.333*1.2);
    airmass*=yAtm/Atm;
    horyzont=Math.acos(R/(R+data['height']))/Math.PI*180;
    if(horyzont<sunY){
      gradient.addColorStop(0, skyColor(dist, airmass*0.2+2,1,1.01+0.5*(sunY-horyzont)/height*aHeight/90));
      gradient.addColorStop(1, skyColor(dist, airmass*0.6+8,1,1.01+0.5*(sunY-horyzont)/height*aHeight/90));
    }
    else{
    gradient.addColorStop(0, skyColor(dist, airmass*0.2+2));
    gradient.addColorStop(1, skyColor(dist, airmass*0.6+8));}
    ctx.beginPath();
    ctx.ellipse(x,y,data["startR"]/data["pressure"]**0.333*m,m*data["startR"]/data["pressure"]**0.333*1.2,0, 0, 2 * Math.PI);
    ctx.fillStyle=gradient;
    ctx.globalAlpha=0.8;
    ctx.fill();
    ctx.globalAlpha=1;
  }
  var h=-5;
  var horyzont=0;
  var v=50;
setInterval(function(){
  drawAtmosphere(6);
  grawBaloon(width/2,height/2);
h+=0.01;
data["height"]+=v;
data["pressure"]=Math.E**(-data["height"]/8400);
if(data["height"]>=Atm-500 || data["height"]<=0){
    v=-v;
    data["height"]+=v;
}
data["sunHeight"]=Math.sin(h/24*2*Math.PI)*45;
sunY=height/2-data["sunHeight"]/aHeight*height;},1);
