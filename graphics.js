const canvas=document.getElementById("image");
const width = canvas.clientWidth;
const height = canvas.clientHeight;
var terrain=[];
var cloudThickness=3000;
var cloudAltitude=8000;
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
var marker=document.getElementById('marker');
const ctx = canvas.getContext("2d");
const Atm=70000;
const R=6357000;
const m=height/aHeight*50;
var mode="baloon";
var data={
}
var noiseTime = 0;
var noise=setInterval(() => {
  makeNoise(ctx);
}, 50);


var sky=new Image();
sky.src="./textures/sky.png"
var fog=new Image();
fog.src="./textures/fog.png"
var boxFront=new Image();
boxFront.src="./textures/Back.png"
var clouds=new Image();
clouds.src="./textures/clouds.png"
for(var i=0;i<5;i++){
terrain[i]=new Image();
terrain[i].src="./textures/terrain"+i+".png"}
var sunX=width/4;
var sunY=0;
var noDataEvent;
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
  ctx.font = Math.floor(0.1*m)+"px myFont";
  ctx.fillStyle="red";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText("waiting", width/2,height/2-0.05*m);
  ctx.fillText("for data", width/2,height/2+0.05*m);
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
  function drawWorld(){
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
    root.style.setProperty('--altitude', data.altitude);
    root.style.setProperty('--yaw', yaw/Math.PI*180);
    marker.innerText=Math.floor(data.altitude)+"m";
    for(var i=0;i<terrain.length;i+=1/64){
    var d=dmax*(terrain.length-i)/terrain.length;
    if(i%1==0){
    var horyzont2=Math.atan(data["altitude"]/d)/Math.PI*180;
    var horyzontH2=Math.floor(horyzont2*height/aHeight+height/2);
    var imwidth=width/aWidth*maxA*(d**2+Atm**2)**0.5/(d**2+(data.altitude-1500)**2)**0.5
    ctx.drawImage(terrain[i],width/2-imwidth/2,horyzontH2,imwidth,terrain[i].height/terrain[i].width*imwidth);}
    var horyzont2=Math.atan((data["altitude"]-cloudAltitude)/d)/Math.PI*180;
    var horyzontH2=Math.floor(horyzont2*height/aHeight+height/2);
    var imwidth=width/aWidth*maxA*(dmax**2+Atm**2)**0.5/(d**2+data.altitude**2)**0.5*1.1;
    ctx.drawImage(clouds,width/2-imwidth/2+(-1)**i*0.1*imwidth,horyzontH2-clouds.height/clouds.width*imwidth/2,imwidth,clouds.height/clouds.width*imwidth);
  }
  
    
    drawBox(ctx,boxFront,width/2,height/2);
    ctx.drawImage(fog,0,-data.cloudAltitude*m+data.altitude*m-cloudThickness,cloudThickness*m/clouds.height*clouds.width,cloudThickness*m);
  
  }
  
  terrain[terrain.length-1].onload=function(){

    var index = 0;
    async function update(){
        const url = "https://confine.kolevi.net/aurora/data.txt";
        try {
            const response = await fetch(url,{cache:"no-store"});
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            
            const json = await response.json();
            console.log(json);
            // vinagi shte ima pone edin element..

            // ako nqma novi elementi da izleze
            // (index e posledno gledaniq element)
            if(json[index] && !json[index+1]) {
                console.log("no new data");
                return;
            }

            // tuk se updateva data[i]
            for(var i in json) {
                if(i <= index) continue;
                console.log("updating "+i);
                index = parseInt(i); //ne razbiram zashto i e string kato indexite sa intove??
                var d = json[i];
                for(var j in d) {
                    data[j] = d[j];
                }

            }
            clearTimeout(noDataEvent);
            clearInterval(noise);
            noDataEvent=setTimeout(function(){
              noise=setInterval(() => {
                makeNoise(ctx);
              }, 50);
            },5000);
            yaw=Math.atan2(data.magy,data.magx)+Math.PI ;
            var a=Math.sin(data.time/1000/3600/24%1*2*Math.PI-Math.PI/2);
            sunY=height/2-45*a/aHeight*height;
            drawWorld();
        } catch (error) {
            console.error(error.message);
        }


    }

    setInterval(update, 100);}
