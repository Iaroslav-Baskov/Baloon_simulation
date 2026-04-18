const waveR = 4.16; // (PI/700e-9)^4 * const
const waveG = 1.08e1; // (PI/550e-9)^4 * const
const waveB = 2.42e1; // (PI/450e-9)^4 * const
const btau=0.2; // Base optical depth at sea level for Rayleigh scattering
const taur=0.051*btau;
const taug=0.136*btau;
const taub=0.252*btau;

const GPUcanvas = document.getElementById('gpu');
const skyCanvas = document.getElementById('sky');
const canvas=document.getElementById("image");

const width = canvas.clientWidth;
const height = canvas.clientHeight;

const ctx = canvas.getContext("2d");
const skyCtx = GPUcanvas.getContext("2d");
const starCtx = skyCanvas.getContext("2d");
[skyCanvas, GPUcanvas, canvas].forEach(c => {
    c.width = width;
    c.height = height;
});
// Передаем существующий холст в настройки
const gpu = new GPU({
  mode: 'gpu' // Принудительно используем GPU (или 'webgl')
});

const canvasToTexture = gpu.createKernel(function(srcCanvas) {
  const pixel = srcCanvas[this.thread.y][this.thread.x];
  return [pixel.r, pixel.g, pixel.b, pixel.a];
})
.setPipeline(true) // Output a texture, not a visible canvas
.setOutput([width, height]);

const drawCanvas = gpu.createKernel(function(image) {
  const pixel = image[this.thread.y][this.thread.x];
  this.color(pixel.r, pixel.g, pixel.b, pixel.a);
}).setGraphical(true)
.setOutput([width, height]);
const multiplyColor = gpu.createKernel(function(image, r_fac, g_fac, b_fac) {
  const pixel = image[this.thread.y][this.thread.x];
  return [
    pixel.r * r_fac, 
    pixel.g * g_fac, 
    pixel.b * b_fac, 
    pixel.a*1.0 
  ];
})
.setPipeline(true)
.setOutput([width, height]);

function starDisc(theta, sunRadius, sunSoftness) {
    let edge0 = sunRadius - sunSoftness;
    let edge1 = sunRadius + sunSoftness;
    let t = -(theta - edge0) / (edge1 - edge0);
    
    // Manual Clamp
    if (t < 0.0) t = 0.0;
    if (t > 1.0) t = 1.0;
    
    return t;
}
gpu.addFunction(starDisc);
function starMask(theta, sunRadius, sunSoftness,sunAngle){

    const sun = starDisc(theta, sunRadius, sunSoftness);
    
    const numSpikes = 8.0;
    const alignment = Math.max(-1,Math.min(1,Math.cos(sunAngle * numSpikes)));
    const angularDist = Math.acos(alignment) / numSpikes;

    const distToSpike = Math.sin(angularDist) * theta;

    const spikes =(starDisc(distToSpike,sunRadius,sunSoftness) / (theta+sunRadius*2))*0.0006;
    return spikes+sun;
}
gpu.addFunction(starMask);
function haloMask(theta,airmass,wave4){
    const G = 0.76; // Asymmetry factor (0.7 to 0.9 for realistic haze)
    const g2 = G * G;
    const cosTheta = Math.cos(theta);
    
    const miePhase = (1.5 * (1.0 - g2) / (2.0 + g2)) * (1.0 + cosTheta * cosTheta) / Math.pow(1.0 + g2 - 2.0 * G * cosTheta, 1.5);
    return miePhase * airmass*wave4; 
}

gpu.addFunction(haloMask);

function calcAirmass(altitude,z){
    const Re = 6371000.0;
    const H =8500;
    const R = Re + altitude;
    const cosZ = Math.cos(z);
    const path = Math.sqrt(R * R * cosZ * cosZ + 2.0 * R * H + H * H) - R * cosZ;
    const hRel = Math.exp(-altitude / H);

    return (path / H) * hRel;
}
gpu.addFunction(calcAirmass);

function calcDestinction(airmass,tau){
 return Math.exp(-tau * airmass);
}
gpu.addFunction(calcDestinction);

function calcScattering(theta,airmass,wave4){
    const scatteringBase =( 1+ Math.cos(theta) * Math.cos(theta)) / 2.0;
    return scatteringBase*wave4*airmass;
}


gpu.addFunction(calcScattering);

const renderSky = gpu.createKernel(drawStar)
.setConstants({ width: width, height: height })
.setOutput([width, height])
.setPipeline(true);
const renderStars = gpu.createKernel(drawStars)
.setConstants({ width: width, height: height })
.setOutput([width, height])
.setPipeline(true);

function drawStar(sunX,sunY, altitude, aWidth,expo) {
    const x = this.thread.x;
    const y = this.thread.y;
    const w = this.constants.width;
    const h = this.constants.height;
    // 1. Вычисляем угловое расстояние до солнца (дистанция в пикселях -> радианы)
    const dx = x - sunX; 
    const dy = y + sunY -h;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const sunAngle = Math.atan2(dy, dx);
    const theta = dist / w * aWidth/180*3.14159265; // Упрощенная проекция

    const z = (1.570796) + ((h / 2.0 - y) / w)* aWidth/180*3.14159265; 

    const airmass=calcAirmass(altitude,z);

    const sunRadius = 0.0046*4; 
    const sunSoftness = 0.002*4; // Prevents jagged edges

    const sun = starMask(theta, sunRadius, sunSoftness,sunAngle);

    // 3. Рассеяние Рэлея (инлайним функцию для скорости)
    // Константы длин волн (nm^-4)
    const waveR = 4.16; // (PI/700e-9)^4 * const
    const waveG = 1.08e1; // (PI/550e-9)^4 * const
    const waveB = 2.42e1; // (PI/450e-9)^4 * const
    const btau=0.2; // Base optical depth at sea level for Rayleigh scattering
    const taur=0.051*btau;
    const taug=0.136*btau;
    const taub=0.252*btau;

    const physicalConst = 1e-2; 
    const SunLuminance = 5; // Adjust for sun brightness
    const mieLuminance = 2e-4; // Adjust for halo brightness

    const sunZ = (1.570796) + ((h / 2.0 -h+ sunY) / w)* aWidth/180*3.14159265; 
    const sunAirmass=Math.max(calcAirmass(altitude,sunZ)-airmass,0);

    let sunR = 1;
    let sunG = 1;
    let sunB = 0.9;

    const r = Math.min(1.0, (calcScattering(theta,airmass,waveR) * physicalConst + sun*SunLuminance + (haloMask(theta,airmass,waveR) * mieLuminance)) * calcDestinction(taur,airmass)*calcDestinction(taur,sunAirmass) * expo * sunR);
    const g = Math.min(1.0, (calcScattering(theta,airmass,waveG) * physicalConst + sun*SunLuminance + (haloMask(theta,airmass,waveG) * mieLuminance)) * calcDestinction(taug,airmass)*calcDestinction(taug,sunAirmass) * expo * sunG);
    const b = Math.min(1.0, (calcScattering(theta,airmass,waveB) * physicalConst + sun*SunLuminance + (haloMask(theta,airmass,waveB) * mieLuminance)) * calcDestinction(taub,airmass)*calcDestinction(taub,sunAirmass) * expo * sunB);
    return [r,g,b, 1.0];
}
function drawStars(stars,n, aWidth,expo) {
    const x = this.thread.x;
    const y = this.thread.y;
    const w = this.constants.width;
    const h = this.constants.height;
    let r = 0;
    let g = 0;
    let b = 0;
    for(let i=0;i<n;i++){
    const sunX = stars[i][0];
    const sunY = stars[i][1];
    const dx = x - sunX; 
    const dy = y + sunY -h;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const sunAngle = Math.atan2(dy, dx);
    const theta = dist / w * aWidth/180*3.14159265; // Упрощенная проекция


    const sunRadius = 5/ w * aWidth/180*3.14159265; 
    const sunSoftness = 3/ w * aWidth/180*3.14159265; // Prevents jagged edges

    const sun = starMask(theta, sunRadius, sunSoftness,sunAngle);

    // 3. Рассеяние Рэлея (инлайним функцию для скорости)
    // Константы длин волн (nm^-4)
    const SunLuminance = 1; // Adjust for sun brightness

    r += ( sun*SunLuminance)  * expo * stars[i][2];
    g +=  ( sun*SunLuminance ) * expo * stars[i][3];
    b +=  ( sun*SunLuminance ) * expo * stars[i][4];
    }
    return [r,g,b, 1.0];
}
