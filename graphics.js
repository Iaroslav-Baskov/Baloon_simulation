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
var mode="baloon";
var data={
    "height":0,
    "pressure":1,
    "longitude":0,
    "latitude":0,
    "outsideTemperature":-10,
    "inside temperature":15,
    "sunHeight":-30,
}
var sunX=width/4;
var sunY=height/2-data.sunHeight/aHeight*height;
function skyColor(angularDistance, airMass,I0=1) {
    const sigma =1.025;
    const theta = (angularDistance * Math.PI) / 180;
    const wavelengths = {
      red: 700e-9,
      green: 550e-9,
      blue: 450e-9,
    };

    function rayleighScattering(lambda) {
        var col=1/(Math.pow(lambda, 4)/Math.pow(550e-9, 4))
      return (
        I0  *2**-((theta/col/airMass*10)**2)/((sigma)**(airMass*col))
      );
    }
    const I_red = rayleighScattering(wavelengths.red);
    const I_green = rayleighScattering(wavelengths.green);
    const I_blue = rayleighScattering(wavelengths.blue);

    const red = Math.min(255, I_red  * 255);
    const green = Math.min(255, I_green * 255);
    const blue = Math.min(255, I_blue * 255);

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
          ctx.fillStyle=skyColor(dist,airmass*(yAtm/Atm));
          ctx.fillRect(x,y,step,step);
      }
      ctx.fillStyle="black";
      ctx.fillRect(0,horyzont*height/aHeight+height/2,width,height);
  }
  }
  var h=7;
  var horyzont=0;
  var v=50;
setInterval(function(){
  drawAtmosphere(6);
h+=0.01;
//data["height"]+=v;
if(data["height"]>=Atm-1000 || data["height"]<=0){
    v=-v;
    data["height"]+=v;
}
data["sunHeight"]=Math.sin(h/24*2*Math.PI)*45;
sunY=height/2-data["sunHeight"]/aHeight*height;},1);
