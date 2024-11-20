var canvas=document.getElementById("image");
var width = canvas.clientWidth;
var height = canvas.clientHeight;
var ground=new Image();
ground.src="./textures/shumen.png"
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
    "height":10,
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
function skyColor(angularDistance, airMass,I0=1,additiveAirmass=0,clouds=0) {
    const theta = (angularDistance * Math.PI) / 180;
    const sigma=0.998;
    const k2=1e-20;
    const wavelengths = {
      red: 700e-9,
      green: 550e-9,
      blue: 450e-9,
    };
    const IR=0.8;
    const IG=1;
    const IB=1;

    function rayleighScattering(lambda) {
        var col=(wavelengths.red/lambda)**4;
      return (
        I0  *k2**(clouds*(theta/airMass)**2 + (theta/col/airMass)**2*(1-clouds))*(sigma**((additiveAirmass+airMass)*col))
      );
    }
    const I_red = rayleighScattering(wavelengths.red);
    const I_green = rayleighScattering(wavelengths.green);
    const I_blue = rayleighScattering(wavelengths.blue);
    var col=1/(Math.pow(wavelengths.blue, 4)/Math.pow(wavelengths.red, 4));
    
    const max=k2**((theta/airMass/col)**2);
    const red = Math.min(255, I_red  * 255)*IR/max;
    const green = Math.min(255, I_green * 255)*IG/max;
    const blue = Math.min(255, I_blue * 255)*IB/max;

    return `rgba(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)}, ${max})`;
  }
  function drawAtmosphere(step=5){
    horyzont=Math.acos(R/(R+data['height']))/Math.PI*180;
    ctx.fillStyle="black";
    var horyzontH=horyzont*height/aHeight+height/2;
    ctx.fillRect(0,0,width,horyzontH);
    var background = ctx.createLinearGradient(0,0, 0,horyzontH);
    for(var y=0;y<=horyzontH;y+=horyzontH/step){
          var dist=Math.sqrt(sunX**2+(y-sunY)**2)/width*aWidth;
          var z=(90-(height/2-y)/height*aHeight)/180*Math.PI;
          var yAtm=Atm-data["height"];
          var airmass=(R/yAtm*Math.sqrt(Math.cos(z)**2+2*yAtm/R+(yAtm/R)**2)-R/yAtm*Math.cos(z))*(yAtm/Atm);
          var add=0;
          if(horyzontH<sunY){
            add+=((sunY-horyzontH)/height*aHeight/180*Math.PI*R/Atm)**2/5;
          }
        console.log(skyColor(dist,airmass,1,add));
          background.addColorStop(y/horyzontH,skyColor(dist,airmass,1,add));
    }
    ctx.fillStyle=background;
    ctx.fillRect(0,0,width,horyzontH);
  }
  function drawBaloon(x,y){
    var dist=180-Math.sqrt((x-sunX)**2+(y-sunY)**2)/width*aWidth;
    var add=0;
    const gradient = ctx.createRadialGradient(x, y,0, x, y,m*data["startR"]/data["pressure"]**0.333*1.2);
    horyzont=Math.acos(R/(R+data['height']))/Math.PI*180;
    var horyzontH=horyzont*height/aHeight+height/2;
    if(horyzontH<sunY){
      add+=((sunY-horyzontH)/height*aHeight/180*Math.PI*R/Atm)**2/5;
    }
    gradient.addColorStop(0, skyColor(dist,30,1,add,0.7));
    gradient.addColorStop(1, skyColor(dist,50,1,add+2,0.7));
    ctx.beginPath();
    ctx.ellipse(x,y,data["startR"]/data["pressure"]**0.333*m,m*data["startR"]/data["pressure"]**0.333*1.2,0, 0, 2 * Math.PI);
    ctx.fillStyle=gradient;
    ctx.fill();
  }
  function drawGround(step=5){
    var horyzont=Math.acos(R/(R+data['height']))/Math.PI*180;
    var horyzontH=horyzont*height/aHeight+height/2;
    ctx.fillStyle="#00200a";
    ctx.fillRect(horyzontH,height,width,height);
    // imwidth=width/4;//(width+5000)/(data["height"]+5000)*Atm;
    // imheight=ground.width/ground.height*imwidth;
    // drawTrapezoid(ctx,ground,0,horyzontH*0,imwidth,horyzontH+imheight,0)
    var background = ctx.createLinearGradient(0,horyzontH, 0,height);
    for(var y=horyzontH;y<=height;y+=(height-horyzontH)/step){
          var dist=180-Math.sqrt(sunX**2+(y-sunY)**2)/width*aWidth;
          var yAtm=Atm-data["height"];
          var airmass=data['height']/Math.sin((y-height/2)/height*aHeight/180*Math.PI)/Atm;
          var add=0;
            if(horyzontH<sunY){
              airmass+=((sunY-horyzontH)/height*aHeight/180*Math.PI*R/Atm)*0.1;
              add+=((sunY-horyzontH)/height*aHeight/180*Math.PI*R/Atm)**2;
              add+=((sunY-horyzontH)/height*aHeight/180*Math.PI*R/Atm)**2/5;
            }
        console.log(skyColor(dist,airmass,1,add));
          background.addColorStop((y-horyzontH)/(height-horyzontH),skyColor(dist,airmass,1,add));
    }
    ctx.fillStyle=background;
    ctx.fillRect(0,horyzontH,width,height);
  }
  function drawTrapezoid(ctx, img, x, y, w, h, factor) {

    var startPoint = x + w * 0.5 * (factor*0.01), // calculate top x
        xi, yi, scale = img.height / h,           // used for interpolation/scale
        startLine = y,                            // used for interpolation
        endLine = y + h;                          // abs. end line (y)

    for(; y < endLine; y++) {

        // get x position based on line (y)
        xi = interpolate(startPoint, y, x, endLine, (y - startLine) / h);

        // get scaled y position for source image
        yi = (y * scale + 0.5)|0;

        // draw the slice
        ctx.drawImage(img, 0, yi, img.width, 1,       // source line
                           xi.x, y, w - xi.x * 2, 1); // output line
    }

    // sub-function doing the interpolation        
    function interpolate(x1, y1, x2, y2, t) {
        return {
            x: x1 + (x2 - x1) * t,
            y: y1 + (y2 - y1) * t
        };
    }
}
  var h=-5;
  var horyzont=0;
  var v=100;
setInterval(function(){
  drawAtmosphere(50);
  drawGround(50);
  drawBaloon(width/2,height/3);
h+=0.02;
data["height"]+=v;
data["pressure"]=Math.E**(-data["height"]/8400);
if(data["height"]>=Atm-500 || data["height"]<=0){
    v=-v;
    data["height"]+=v;
}
data["sunHeight"]=Math.sin(h/24*2*Math.PI)*45;
sunY=height/2-data["sunHeight"]/aHeight*height;},300);
