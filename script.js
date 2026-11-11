import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const $ = id => document.getElementById(id);
const audioFiles = {
  universe:"audio/universo.mp3", doraemon:"audio/doraemon.mp3",
  bears:"audio/osos.mp3", snoopy:"audio/snoopy.mp3",
  heart:"audio/personalizada.mp3", extra:"audio/sonido_corazon.mp3"
};
const videos = {doraemon:"videos/doraemon.mp4",bears:"videos/osos.mp4",snoopy:"videos/snoopy.mp4"};
const data = {
 doraemon:{name:"GALAXIA DORAEMON",color:0x42baff,center:"assets/doraemon/doraimagen1.png",video:videos.doraemon,items:[
 ["gorrocoptero.png","Que puedas volar tan alto que tus miedos se hagan pequeños y tus sueños parezcan estar al alcance de tus manos."],
 ["puerta magica.png","Si pudiera regalarte algo, sería una puerta mágica para que siempre encuentres el camino hacia tus sueños."],
 ["maquina del tiempo.png","Si pudieras viajar por el tiempo, ¿visitarías el pasado o el futuro?"],
 ["pan de la memoria.png","El sabor de los recuerdos puede tener forma de pan. ¿Qué momentos de tu vida guardarías para siempre en el corazón?"],
 ["dorayaquis.png","Si la felicidad tuviera forma de dorayaki, ¿qué forma tendría tu dorayaki?"]],folder:"assets/doraemon"},
 bears:{name:"GALAXIA OSOS ESCANDALOSOS",color:0xdaf5ff,center:"assets/escandalosos/escandalosos.png",video:videos.bears,folder:"assets/escandalosos",items:[
 ["pardo.png","Eres fuerte, buena onda, eres Pardo y hay más que onda 😎."],
 ["panda.png","Eres un destello, bella y gentil, no puedo creerlo... ♪ヘ(￣ω￣ヘ)"],
 ["polar.png",["Polar quiere más papas gratis","Polar es rápido y furioso","Polar sabe","Polar te protegerá","El corazón de Polar es azúcar","Polar es Polar","No abandones a Polar 🐻‍❄️"]]]},
 snoopy:{name:"GALAXIA SNOOPY",color:0xff91c9,center:"assets/snoopy/snoopy principal.png",video:videos.snoopy,folder:"assets/snoopy",items:[
 ["snoopy joe.png","No necesitas impresionar, ya tienes tu propio encanto. Y nunca pierdas esa genialidad tan tuya porque naciste para destacar sin intentarlo. ¡Eres cool! 😎"],
 ["snoopy aviador.png","Hasta las nubes parecen pequeñas cuando tienes grandes sueños, pues no hay ningún horizonte que sea demasiado lejano para ti, porque naciste para explorar cielos que aún no conoces."],
 ["snoopy escritor.png","Tu historia todavía guarda capítulos extraordinarios. Cada página de tu vida tiene algo bonito que contar, así que plasma todo en una hoja de papel... ✒️"],
 ["snoopy lider.png","Un buen guía no solo conoce el camino, también anima a otros a caminar. Nunca pierdas esa valentía para descubrir lo desconocido. Tienes pequeñas figuras que te admiran. 🫡✨"],
 ["snoopy bailarin.png","Nunca dejes de bailar a tu propio ritmo, encuentra siempre motivos para celebrar y que nunca pierdas el ritmo de tu felicidad. 〜(꒪꒳꒪)〜🎶"]]},
 heart:{name:"UN UNIVERSO HECHO PARA TI",color:0xb78aff,items:[]}
};
data.heart.items = ["Brilla siempre ✨","Mereces lo mejor 💛","Sigue siendo luz 🌟","Un abrazo al alma 🫂","Qué bonito existes 🦋","Sigue iluminando vidas 🏮","Sé siempre feliz 🤗","Más bonito contigo 🌸","Nunca cambies 🍃","Mil alegrías 🍰","Cielos a tu favor 🪄","Lo mejor para ti ✨","Celebremos tu existencia 🌹"].map((s,i)=>["frase"+i,s]);

let scene,camera,renderer,controls,raycaster,universe,galaxyGroup=null;
let mode="universe",activeKey=null,clickables=[],animated=[],polarIndex=0,heartSpecialTimer=null,selectedPhraseSprite=null;
const audios={};
for(const [k,src] of Object.entries(audioFiles)){const a=new Audio(src);a.loop=k!=="extra";a.volume=.55;audios[k]=a;}
function stopAudio(){Object.values(audios).forEach(a=>{a.pause();a.currentTime=0;});}
function playAudio(k){Object.entries(audios).forEach(([name,a])=>{if(name!==k){a.pause();if(name!=="extra")a.currentTime=0;}});audios[k].play().catch(()=>{});}
function glowTexture(){const c=document.createElement("canvas");c.width=c.height=128;const x=c.getContext("2d"),g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(.16,"rgba(255,255,255,.9)");g.addColorStop(.42,"rgba(210,220,255,.28)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);}
const glow=glowTexture();
// Textura circular y suave: evita que los puntos se vean como pequeños cuadrados.
function stars(parent,n,r,color=0xffffff,size=.22){const p=new Float32Array(n*3);for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,u=Math.random()*2-1,d=r*(.3+Math.random()*.7),s=Math.sqrt(1-u*u);p[i*3]=d*s*Math.cos(a);p[i*3+1]=d*u;p[i*3+2]=d*s*Math.sin(a);}const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(p,3));const o=new THREE.Points(g,new THREE.PointsMaterial({color,size,map:glow,transparent:true,opacity:.76,alphaTest:.004,depthWrite:false,sizeAttenuation:true}));parent.add(o);return o;}
function emojiStar(parent,emoji,size,position){const c=document.createElement("canvas");c.width=c.height=128;const x=c.getContext("2d");x.clearRect(0,0,128,128);x.textAlign="center";x.textBaseline="middle";x.font='100px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';x.fillText(emoji,64,68);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const o=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));o.scale.set(size,size,1);o.position.copy(position);parent.add(o);return o;}
function spiral(color,scale=1){
 // Galaxia espiral: brazos curvos, núcleo difuso y polvo distribuido de forma irregular.
 const group=new THREE.Group(),n=56000,p=new Float32Array(n*3),c=new Float32Array(n*3),base=new THREE.Color(color);
 for(let i=0;i<n;i++){
   const arm=Math.floor(Math.random()*4),r=Math.pow(Math.random(),.62)*19*scale;
   const curve=arm*Math.PI/2+r*.30;
   const spread=(.10+r*.018)*(Math.random()-.5);
   const a=curve+spread+(Math.random()-.5)*.10;
   const bulge=Math.random()<.20;
   const rr=bulge?Math.pow(Math.random(),1.8)*7*scale:r;
   const aa=bulge?Math.random()*Math.PI*2:a;
   const thickness=(.12+rr*.035)*(Math.random()-.5);
   p[i*3]=Math.cos(aa)*rr*scale/scale + Math.cos(aa+Math.PI/2)*thickness;
   p[i*3+1]=(Math.random()-.5)*(.45+rr*.035);
   p[i*3+2]=Math.sin(aa)*rr*scale/scale + Math.sin(aa+Math.PI/2)*thickness;
   const tint=Math.random();
   const col=base.clone().lerp(new THREE.Color(tint>.82?0xffffff:0x9aa9d8),tint*.48);
   c.set([col.r,col.g,col.b],i*3);
 }
 const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(p,3));g.setAttribute("color",new THREE.BufferAttribute(c,3));
 group.add(new THREE.Points(g,new THREE.PointsMaterial({size:.049,map:glow,vertexColors:true,transparent:true,opacity:.84,alphaTest:.004,depthWrite:false,sizeAttenuation:true})));
 // Polvo fino adicional en los brazos, sin discos ni cuerpos sólidos.
 const dust=stars(group,39000,19*scale,base,.17);dust.material.opacity=.42;
 const core=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:base,transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false}));
 core.scale.set(8*scale,8*scale,1);group.add(core);
 return group;
}
function particleCelestial(parent,color,radius,position,orbitRadius=0,orbitSpeed=0){
 const group=new THREE.Group();
 const count=1500,points=new Float32Array(count*3),colors=new Float32Array(count*3);
 const base=new THREE.Color(color),bright=new THREE.Color(0xffffff);
 for(let i=0;i<count;i++){
   const u=Math.random()*2-1,a=Math.random()*Math.PI*2;
   const shell=radius*(.82+Math.random()*.20),q=Math.sqrt(1-u*u);
   points[i*3]=shell*q*Math.cos(a);points[i*3+1]=shell*u;points[i*3+2]=shell*q*Math.sin(a);
   const c=base.clone().lerp(bright,Math.random()*.55);
   colors.set([c.r,c.g,c.b],i*3);
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(points,3));geo.setAttribute("color",new THREE.BufferAttribute(colors,3));
 const cloud=new THREE.Points(geo,new THREE.PointsMaterial({size:.14,map:glow,vertexColors:true,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending}));
 group.add(cloud);
 const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:base,transparent:true,opacity:.32,blending:THREE.AdditiveBlending,depthWrite:false}));
 halo.scale.set(radius*3.2,radius*3.2,1);group.add(halo);
 // Anillo orbital de partículas, ligeramente inclinado.
 const ringCount=520,ringPos=new Float32Array(ringCount*3);
 for(let i=0;i<ringCount;i++){const a=Math.random()*Math.PI*2,r=radius*(1.45+Math.random()*.28);ringPos[i*3]=Math.cos(a)*r;ringPos[i*3+1]=(Math.random()-.5)*.12*radius;ringPos[i*3+2]=Math.sin(a)*r;}
 const ringGeo=new THREE.BufferGeometry();ringGeo.setAttribute("position",new THREE.BufferAttribute(ringPos,3));
 const ringPoints=new THREE.Points(ringGeo,new THREE.PointsMaterial({color:base,size:.10,map:glow,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending}));
 ringPoints.rotation.x=.24+Math.random()*.35;group.add(ringPoints);
 group.position.copy(position);parent.add(group);
 animated.push({o:group,celestial:true,orbitRadius,orbitSpeed,phase:Math.random()*Math.PI*2,basePosition:position.clone(),spin:.16});
 return group;
}
function addCelestialField(parent,count,spread,small=false){
 const palette=[0x70cfff,0xffc76a,0xe7a5ff,0x9de8d1,0xff8fba,0xb3baff];
 for(let i=0;i<count;i++){
   const pos=new THREE.Vector3((Math.random()-.5)*spread,(Math.random()-.5)*spread*.46,(Math.random()-.5)*spread);
   const radius=(small?1.0:1.7)+Math.random()*(small?1.2:2.0);
   particleCelestial(parent,palette[i%palette.length],radius,pos,small?0:8+Math.random()*23,small?0:.025+Math.random()*.045);
 }
}
function createGalaxyAura(parent,key){
 const color=data[key].color;
 // Nube exterior de polvo coloreado y brazos orbitales que hacen reconocible cada galaxia desde lejos.
 const cloudCount=24000,arr=new Float32Array(cloudCount*3),cols=new Float32Array(cloudCount*3);
 const base=new THREE.Color(color),accent=new THREE.Color(key==="doraemon"?0x9af4ff:key==="bears"?0xffffff:key==="snoopy"?0xffb0dc:0xd9a7ff);
 for(let i=0;i<cloudCount;i++){
   const a=Math.random()*Math.PI*2,r=15+Math.random()*24,z=(Math.random()-.5)*(key==="bears"?10:18);
   arr[i*3]=Math.cos(a)*r;arr[i*3+1]=z;arr[i*3+2]=Math.sin(a)*r;
   const c=base.clone().lerp(accent,Math.random()*.7);cols.set([c.r,c.g,c.b],i*3);
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(arr,3));geo.setAttribute("color",new THREE.BufferAttribute(cols,3));
 const cloud=new THREE.Points(geo,new THREE.PointsMaterial({size:.105,map:glow,vertexColors:true,transparent:true,opacity:.72,depthWrite:false,blending:THREE.AdditiveBlending}));
 parent.add(cloud);animated.push({o:cloud,spin:key==="bears"?-.012:.016,twinkle:true});
 for(let j=0;j<3;j++){
   const n=2600,pts=new Float32Array(n*3),radius=25+j*5;
   for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,r=radius+(Math.random()-.5)*1.5;pts[i*3]=Math.cos(a)*r;pts[i*3+1]=(Math.random()-.5)*(key==="bears"?1.5:3);pts[i*3+2]=Math.sin(a)*r;}
   const rg=new THREE.BufferGeometry();rg.setAttribute("position",new THREE.BufferAttribute(pts,3));
   const ring=new THREE.Points(rg,new THREE.PointsMaterial({color:j===0?color:accent,size:.12,map:glow,transparent:true,opacity:.42-j*.07,depthWrite:false,blending:THREE.AdditiveBlending}));
   ring.rotation.x=(j-1)*.23;parent.add(ring);animated.push({o:ring,spin:(j%2?-.018:.012)*(key==="snoopy"?1.3:1)});
 }
 const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color,transparent:true,opacity:.18,blending:THREE.AdditiveBlending,depthWrite:false}));halo.scale.set(68,68,1);parent.add(halo);
}
function createGalaxyLabel(parent,key){
 const labels={doraemon:"DORAEMON",bears:"OSOS ESCANDALOSOS",snoopy:"SNOOPY",heart:"UNIVERSO DEL CORAZÓN"};
 const canvas=document.createElement("canvas");canvas.width=1024;canvas.height=192;const ctx=canvas.getContext("2d");
 ctx.clearRect(0,0,canvas.width,canvas.height);ctx.textAlign="center";ctx.textBaseline="middle";
 ctx.font='bold 76px Arial, sans-serif';ctx.shadowColor="#ffffff";ctx.shadowBlur=24;ctx.fillStyle="#ffffff";ctx.fillText(labels[key],512,96);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false,opacity:.96,toneMapped:false}));
 label.scale.set(key==="bears"||key==="heart"?37:27,5.2,1);label.position.set(0,27,0);parent.add(label);
}
function createParticleSun(parent,color,position,size=4){
 const group=new THREE.Group(),n=2600,p=new Float32Array(n*3),c=new Float32Array(n*3),base=new THREE.Color(color),hot=new THREE.Color(0xfff1c2);
 for(let i=0;i<n;i++){const u=Math.random()*2-1,a=Math.random()*Math.PI*2,r=size*(.82+Math.random()*.2),q=Math.sqrt(1-u*u);p[i*3]=r*q*Math.cos(a);p[i*3+1]=r*u;p[i*3+2]=r*q*Math.sin(a);const cc=base.clone().lerp(hot,Math.random()*.72);c.set([cc.r,cc.g,cc.b],i*3);}
 const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(p,3));geo.setAttribute("color",new THREE.BufferAttribute(c,3));
 group.add(new THREE.Points(geo,new THREE.PointsMaterial({size:.19,map:glow,vertexColors:true,transparent:true,opacity:.98,depthWrite:false,blending:THREE.AdditiveBlending})));
 const corona=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false}));corona.scale.set(size*5,size*5,1);group.add(corona);
 for(let j=0;j<2;j++){const ray=stars(group,950,size*3.2, j?0xffd28a:color,.18);ray.scale.set(1.7,.34,1);ray.rotation.z=j*Math.PI/2+.35;}
 group.position.copy(position);parent.add(group);animated.push({o:group,spin:.12,pulse:true});return group;
}
function createAsteroidSwarm(parent,color,position,radius=28,count=4200){
 const p=new Float32Array(count*3),sizes=new Float32Array(count);
 for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,r=radius+(Math.random()-.5)*5;p[i*3]=Math.cos(a)*r;p[i*3+1]=(Math.random()-.5)*2.8;p[i*3+2]=Math.sin(a)*r;sizes[i]=.06+Math.random()*.12;}
 const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(p,3));
 const belt=new THREE.Points(geo,new THREE.PointsMaterial({color,size:.15,map:glow,transparent:true,opacity:.72,depthWrite:false,blending:THREE.AdditiveBlending}));belt.position.copy(position);belt.rotation.x=.28;parent.add(belt);animated.push({o:belt,spin:.025});return belt;
}
function createNebula(parent,color,position,spread=38,count=26000){
 const p=new Float32Array(count*3),cols=new Float32Array(count*3),base=new THREE.Color(color),light=new THREE.Color(0xffffff);
 for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,r=Math.pow(Math.random(),.65)*spread,th=(Math.random()-.5)*spread*.48;p[i*3]=Math.cos(a)*r;p[i*3+1]=th;p[i*3+2]=Math.sin(a)*r;const cc=base.clone().lerp(light,Math.random()*.28);cols.set([cc.r,cc.g,cc.b],i*3);}
 const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(p,3));geo.setAttribute("color",new THREE.BufferAttribute(cols,3));
 const cloud=new THREE.Points(geo,new THREE.PointsMaterial({size:.16,map:glow,vertexColors:true,transparent:true,opacity:.32,depthWrite:false,blending:THREE.AdditiveBlending}));cloud.position.copy(position);parent.add(cloud);animated.push({o:cloud,spin:.009,twinkle:true});return cloud;
}
function createCosmicBodySet(parent,key,spread){
 const palette=key==="doraemon"?[0x63d8ff,0x4caaff]:key==="bears"?[0xdff8ff,0xa9dfff]:key==="snoopy"?[0xff9dce,0xf7c1ff]:key==="heart"?[0xc69aff,0xff8fcf]:[0x9acaff,0xffc878,0xd4a2ff];
 const pos=(x,y,z)=>new THREE.Vector3(x,y,z);
 createParticleSun(parent,palette[0],pos(-spread*.24,spread*.09,-spread*.13),key==="universe"?5.5:4.2);
 createNebula(parent,palette[1]||palette[0],pos(spread*.22,-spread*.06,spread*.18),key==="universe"?46:34,key==="universe"?32000:22000);
 createAsteroidSwarm(parent,palette[0],pos(spread*.12,spread*.1,-spread*.22),key==="universe"?37:26,key==="universe"?6500:3800);
 // Pequeño cúmulo de estrellas en espiral para dar profundidad y escala cósmica.
 const cluster=stars(parent,key==="universe"?19000:13000,key==="universe"?105:76,palette[1]||palette[0],.2);cluster.position.set(-spread*.2,-spread*.12,spread*.25);animated.push({o:cluster,spin:-.014,twinkle:true});
}
function init(){scene=new THREE.Scene();scene.background=new THREE.Color(0x03040b);camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,1800);camera.position.set(0,45,105);scene.add(camera);renderer=new THREE.WebGLRenderer({canvas:$("space"),antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.05;controls.minDistance=10;controls.maxDistance=260;controls.target.set(0,0,0);raycaster=new THREE.Raycaster();universe=new THREE.Group();scene.add(universe);const distantStars=stars(universe,205000,480,0xe5ebff,.28);animated.push({o:distantStars,spin:.0028,twinkle:true});
 const dust=stars(universe,155000,390,0x8da9ff,.21);animated.push({o:dust,spin:-.006,twinkle:true});
 const places=[["doraemon",[-78,18,-35]],["bears",[80,-15,-28]],["snoopy",[-42,-25,75]],["heart",[55,35,78]]];
 for(const [key,pos] of places){const g=spiral(data[key].color,1.15);g.position.set(...pos);universe.add(g);createGalaxyAura(g,key);createGalaxyLabel(g,key);const hit=new THREE.Mesh(new THREE.SphereGeometry(10,20,16),new THREE.MeshBasicMaterial({transparent:true,opacity:0}));hit.userData={type:"galaxy",key};g.add(hit);clickables.push(hit);animated.push({o:g,spin:.045,pulse:true});}
 // Sustituimos los planetas por estrellas y destellos emoji de distintos tamaños.
 for(let i=0;i<70;i++){const emoji=i%3===0?"🌟":"✨",size=1.8+Math.random()*2.6;const pos=new THREE.Vector3((Math.random()-.5)*340,(Math.random()-.5)*155,(Math.random()-.5)*340);const star=emojiStar(universe,emoji,size,pos);animated.push({o:star,spin:(Math.random()-.5)*.35,float:true,baseY:pos.y,phase:Math.random()*Math.PI*2,twinkle:true});}
 addCelestialField(universe,16,360,false);
 createCosmicBodySet(universe,"universe",390);
 makeComets(universe,0x9ecaff,36,true);scene.add(new THREE.AmbientLight(0xffffff,.55));const light=new THREE.PointLight(0x9d8cff,.8,500);light.position.set(0,40,20);scene.add(light);
 renderer.setAnimationLoop(tick);window.addEventListener("resize",resize);$("space").addEventListener("pointerdown",pick);}
function starEmojiTexture(){
 const c=document.createElement("canvas");c.width=c.height=256;
 const x=c.getContext("2d");x.clearRect(0,0,256,256);
 x.textAlign="center";x.textBaseline="middle";
 x.shadowColor="#fff4a8";x.shadowBlur=34;
 x.font='190px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
 x.fillText("⭐",128,133);
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return tex;
}
const cometStarMap=starEmojiTexture();
function makeComets(parent,color,count=7,universeWide=false){
 const span=universeWide?520:190,vertical=universeWide?270:125;
 for(let i=0;i<count;i++){
   const g=new THREE.Group();
   // Estrella emoji luminosa: se desplaza como cometa, pero sin cola ni estela.
   const head=new THREE.Sprite(new THREE.SpriteMaterial({map:cometStarMap,transparent:true,opacity:1,depthWrite:false,toneMapped:false}));
   const size=universeWide?4.2:3.1;
   head.scale.set(size,size,1);
   const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:0xffedaa,transparent:true,opacity:.62,blending:THREE.AdditiveBlending,depthWrite:false}));
   halo.scale.set(universeWide?8:6,universeWide?8:6,1);
   g.add(halo,head);
   g.position.set((Math.random()-.5)*span,(Math.random()-.5)*vertical,(Math.random()-.5)*span);
   parent.add(g);
   const v=new THREE.Vector3((Math.random()-.5)*1.1,(Math.random()-.5)*.7,(Math.random()-.5)*1.1)
     .normalize().multiplyScalar(universeWide?(.34+Math.random()*.42):(.25+Math.random()*.3));
   animated.push({o:g,comet:true,v,span,vertical,halo,phase:Math.random()*Math.PI*2});
 }
}
function sprite(path,size,color){const mat=new THREE.SpriteMaterial({color:0xffffff,transparent:true,opacity:.82,depthWrite:false,toneMapped:true});const s=new THREE.Sprite(mat);s.scale.set(size,size,1);new THREE.TextureLoader().load(path,t=>{t.colorSpace=THREE.SRGBColorSpace;mat.map=t;mat.color.set(0xffffff);mat.opacity=.82;mat.needsUpdate=true;},undefined,()=>console.warn("No se encontró:",path));return s;}
function makeTextTexture(message,color=0xffffff){
 const canvas=document.createElement("canvas");canvas.width=1024;canvas.height=320;
 const ctx=canvas.getContext("2d");
 const fontSize=38,lineHeight=54,maxWidth=900;
 ctx.font=`600 ${fontSize}px "Playfair Display", Georgia, serif`;
 const words=String(message).split(/\s+/),lines=[];let line="";
 for(const word of words){const test=line?line+" "+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;}else line=test;}
 if(line)lines.push(line);
 const shown=lines.slice(0,4),total=shown.length*lineHeight,startY=(canvas.height-total)/2+lineHeight*.72;
 ctx.textAlign="center";ctx.textBaseline="middle";
 ctx.shadowColor="#b68aff";ctx.shadowBlur=22;
 ctx.fillStyle=`#${new THREE.Color(color).getHexString()}`;
 shown.forEach((txt,i)=>ctx.fillText(txt,512,startY+i*lineHeight));
 ctx.shadowBlur=8;ctx.fillStyle="rgba(255,255,255,.94)";
 shown.forEach((txt,i)=>ctx.fillText(txt,512,startY+i*lineHeight));
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;
 return {texture,lines:shown.length};
}
function floatingPhrase(parent,message,index,total,color,radius=54){
 const {texture,lines}=makeTextTexture(message,color);
 const mat=new THREE.SpriteMaterial({map:texture,transparent:true,opacity:.88,depthWrite:false,depthTest:true});
 const obj=new THREE.Sprite(mat);
 const angle=(index/Math.max(total,1))*Math.PI*2+(Math.random()-.5)*.22;
 const y=(Math.random()-.5)*25;
 const width=message.length>115?35:message.length>75?30:message.length>42?26:22;
 const height=width*.31*(lines>2?1.25:1);
 obj.scale.set(width,height,1);
 obj.position.set(Math.cos(angle)*radius,y,Math.sin(angle)*radius);
 parent.add(obj);
 animated.push({o:obj,floatText:true,base:obj.position.clone(),phase:Math.random()*Math.PI*2,drift:.18+Math.random()*.16,orbitSpeed:(Math.random()-.5)*.018,angle,radius});
 return obj;
}
function createWormhole(){
 const tunnel=new THREE.Group();tunnel.name="heart-wormhole";
 const count=26000,positions=new Float32Array(count*3),colors=new Float32Array(count*3);
 const palette=[new THREE.Color(0x9d6bff),new THREE.Color(0xf29bd8),new THREE.Color(0x8adfff),new THREE.Color(0xffffff)];
 for(let i=0;i<count;i++){
   const z=-105+Math.random()*108;
   const f=(z+105)/108,angle=Math.random()*Math.PI*2+f*8;
   const radius=2+f*23+Math.random()*5;
   positions[i*3]=Math.cos(angle)*radius;
   positions[i*3+1]=Math.sin(angle)*radius;
   positions[i*3+2]=z;
   const col=palette[Math.floor(Math.random()*palette.length)];
   colors.set([col.r,col.g,col.b],i*3);
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(positions,3));geo.setAttribute("color",new THREE.BufferAttribute(colors,3));
 const stream=new THREE.Points(geo,new THREE.PointsMaterial({size:.12,map:glow,vertexColors:true,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending}));
 tunnel.add(stream);
 // Anillos de polvo incompletos, hechos con puntos para que no parezcan tubos sólidos.
 for(let j=0;j<5;j++){
   const ringPts=stars(tunnel,2200,12+j*5,palette[j%palette.length],.12);
   ringPts.position.z=-78+j*17;
   ringPts.rotation.z=j*.7;
 }
 tunnel.position.set(0,0,0);
 scene.add(tunnel);
 animated.push({o:tunnel,wormhole:true,stream,life:0});
 return tunnel;
}
function createGalaxyFormation(parent,color,scale=1){
 // Explosión inicial y reunión progresiva de partículas para reconstruir cada galaxia.
 const count=18000,positions=new Float32Array(count*3),targets=new Float32Array(count*3);
 const burst=new Float32Array(count*3),start=new Float32Array(count*3);
 const base=new THREE.Color(color);
 for(let i=0;i<count;i++){
   const arm=Math.floor(Math.random()*4),r=Math.pow(Math.random(),.62)*19*scale;
   const angle=arm*Math.PI/2+r*.30+(Math.random()-.5)*.24;
   const thick=(Math.random()-.5)*(.35+r*.035);
   const tx=Math.cos(angle)*r+Math.cos(angle+Math.PI/2)*thick;
   const tz=Math.sin(angle)*r+Math.sin(angle+Math.PI/2)*thick;
   const ty=(Math.random()-.5)*(.8+r*.035);
   targets.set([tx,ty,tz],i*3);
   const dx=(Math.random()-.5),dy=(Math.random()-.5),dz=(Math.random()-.5);
   const len=Math.hypot(dx,dy,dz)||1;
   const distance=(24+Math.random()*54)*scale;
   burst.set([dx/len*distance,dy/len*distance,dz/len*distance],i*3);
   start.set([(Math.random()-.5)*2,(Math.random()-.5)*2,(Math.random()-.5)*2],i*3);
   positions.set([start[i*3],start[i*3+1],start[i*3+2]],i*3);
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(positions,3));
 const material=new THREE.PointsMaterial({color:base,size:.105,map:glow,transparent:true,opacity:.98,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true});
 const cloud=new THREE.Points(geo,material);cloud.name="galaxy-formation-particles";
 // Oculta la galaxia real durante la reconstrucción; las partículas toman su lugar.
 for(const child of [...parent.children]) child.visible=false;
 parent.add(cloud);
 animated.push({o:cloud,formation:true,elapsed:0,start,burst,targets,count,baseChildren:parent.children.filter(c=>c!==cloud)});
}
function enterGalaxy(key){
 if(heartSpecialTimer){clearTimeout(heartSpecialTimer);heartSpecialTimer=null;}
 activeKey=key;mode="galaxy";stopAudio();$("audioPlayer").classList.add("hide");universe.visible=false;
 clickables=clickables.filter(o=>o.userData.type==="galaxy");
 galaxyGroup=new THREE.Group();scene.add(galaxyGroup);
 const cfg=data[key];$("title").textContent=cfg.name;$("back").classList.remove("hide");
 controls.target.set(0,0,0);camera.position.set(0,30,78);
 if(key==="heart"){
   camera.position.set(0,14,128);
   const tunnel=createWormhole();
   animated.push({o:tunnel,wormholeFade:true,life:0});
   buildHeart(cfg);
 }else buildCharacter(key,cfg);
 createGalaxyFormation(galaxyGroup,cfg.color,key==="heart"?1.65:1.25);
 playAudio(key);
 if(key==="heart"){
   // El efecto sonoro especial entra dos segundos después de llegar a la galaxia.
   heartSpecialTimer=setTimeout(()=>{
     if(mode==="galaxy"&&activeKey==="heart"){
       audios.extra.currentTime=0;audios.extra.play().catch(()=>{});
     }
     heartSpecialTimer=null;
   },2000);
 }
}
function buildCharacter(key,cfg){
 const g=spiral(cfg.color,1.25);galaxyGroup.add(g);animated.push({o:g,spin:.05,pulse:true});
 const dust=stars(galaxyGroup,92000,155,cfg.color,.24);animated.push({o:dust,spin:-.018,twinkle:true});
 addCelestialField(galaxyGroup,10,165,true);
 createCosmicBodySet(galaxyGroup,key,120);
 createNebula(galaxyGroup,cfg.color,new THREE.Vector3(24,-8,-22),42,28000);
 const center=sprite(cfg.center,14,cfg.color);galaxyGroup.add(center);center.userData={type:"video",key};clickables.push(center);ring(37,cfg.color);
 let phraseIndex=0,phraseTotal=cfg.items.reduce((n,it)=>n+(Array.isArray(it[1])?it[1].length:1),0);
 cfg.items.forEach((it,i)=>{
   const s=sprite(cfg.folder+"/"+it[0],6.8,cfg.color),a=i/cfg.items.length*Math.PI*2;
   s.position.set(Math.cos(a)*37,Math.sin(a*2)*4,Math.sin(a)*37);
   galaxyGroup.add(s);
   animated.push({o:s,orbit:true,r:43,a,speed:.075+i*.009,y:s.position.y,floatImage:true,phase:i*.9});
   const messages=Array.isArray(it[1])?it[1]:[it[1]];
   s.userData={type:"phrase",messages,phraseIndex:0,imagePath:it[0]};
   clickables.push(s);
 });
 makeComets(galaxyGroup,cfg.color,18,false);
}
function ring(r,color){
 const n=3000,p=new Float32Array(n*3);
 for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,rr=r+(Math.random()-.5)*1.1;p[i*3]=Math.cos(a)*rr;p[i*3+1]=(Math.random()-.5)*.7;p[i*3+2]=Math.sin(a)*rr;}
 const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(p,3));
 const orbit=new THREE.Points(geo,new THREE.PointsMaterial({color,size:.045,map:glow,transparent:true,opacity:.35,depthWrite:false}));galaxyGroup.add(orbit);animated.push({o:orbit,spin:.012,twinkle:true});
}
function createPermanentBlackHole(parent){
 // Horizonte oscuro y disco de acreción hechos con sprites y partículas, sin geometría rígida.
 const c=document.createElement("canvas");c.width=c.height=256;
 const ctx=c.getContext("2d");
 const grad=ctx.createRadialGradient(128,128,16,128,128,126);
 grad.addColorStop(0,"rgba(0,0,0,1)");grad.addColorStop(.46,"rgba(3,1,12,1)");
 grad.addColorStop(.58,"rgba(20,8,35,.92)");grad.addColorStop(.76,"rgba(105,55,170,.20)");
 grad.addColorStop(1,"rgba(150,100,255,0)");
 ctx.fillStyle=grad;ctx.fillRect(0,0,256,256);
 const tex=new THREE.CanvasTexture(c);
 const horizon=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,opacity:.98}));
 horizon.scale.set(15,15,1);horizon.position.z=1;parent.add(horizon);
 const count=11000,positions=new Float32Array(count*3),colors=new Float32Array(count*3);
 const angles=new Float32Array(count),radii=new Float32Array(count),speeds=new Float32Array(count);
 const inner=new THREE.Color(0xffb4ec),outer=new THREE.Color(0x8b72ff);
 for(let i=0;i<count;i++){
   angles[i]=Math.random()*Math.PI*2;radii[i]=5+Math.random()*17;
   speeds[i]=.35+Math.random()*.9;
   const col=inner.clone().lerp(outer,Math.random());
   colors.set([col.r,col.g,col.b],i*3);
   positions[i*3]=Math.cos(angles[i])*radii[i];
   positions[i*3+1]=(Math.random()-.5)*1.5;
   positions[i*3+2]=Math.sin(angles[i])*radii[i];
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(positions,3));geo.setAttribute("color",new THREE.BufferAttribute(colors,3));
 const disk=new THREE.Points(geo,new THREE.PointsMaterial({size:.12,map:glow,vertexColors:true,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending}));
 disk.rotation.x=.22;parent.add(disk);
 animated.push({o:disk,blackHoleFlow:true,angles,radii,speeds,count});
 const outerDust=stars(parent,15000,28,0xc39aff,.14);outerDust.material.opacity=.32;
 animated.push({o:outerDust,spin:-.22,twinkle:true});
}
function buildHeart(cfg){
 // Galaxia espiral completa: brazos de estrellas, núcleo difuso y nubes de polvo.
 const heartGalaxy=spiral(cfg.color,1.65);
 heartGalaxy.rotation.x=-.28;heartGalaxy.rotation.z=.12;
 galaxyGroup.add(heartGalaxy);animated.push({o:heartGalaxy,spin:.075,pulse:true});
 createPermanentBlackHole(galaxyGroup);
 addCelestialField(galaxyGroup,12,195,true);
 createCosmicBodySet(galaxyGroup,"heart",145);
 createNebula(galaxyGroup,0xb995ff,new THREE.Vector3(-34,12,-26),48,36000);
 const heartDust=stars(galaxyGroup,112000,175,0xc9a4ff,.23);
 animated.push({o:heartDust,spin:-.012,twinkle:true});
 const nebula=stars(galaxyGroup,62000,88,0xf08bcf,.2);
 nebula.material.opacity=.26;animated.push({o:nebula,spin:.018,twinkle:true});
 // Corazón de polvo luminoso con volumen irregular y profundidad variable.
 const n=24000,p=new Float32Array(n*3),colors=new Float32Array(n*3);
 const pink=new THREE.Color(0xff8fca),white=new THREE.Color(0xffe4f3),violet=new THREE.Color(0xb995ff);
 for(let i=0;i<n;i++){
   const t=Math.random()*Math.PI*2;
   const edge=Math.random()<.24?(.84+Math.random()*.16):Math.sqrt(Math.random())*.96;
   const wobble=1+Math.sin(t*5)*.025+Math.cos(t*9)*.018+(Math.random()-.5)*.035;
   const x=16*Math.pow(Math.sin(t),3)*edge*wobble;
   const y=(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*edge*wobble;
   const depth=(Math.random()-.5)*(2.5+edge*4.5);
   p[i*3]=x*.70+(Math.random()-.5)*.5;
   p[i*3+1]=y*.70+(Math.random()-.5)*.5;
   p[i*3+2]=depth+Math.sin(t*4)*.35;
   const mix=Math.random();
   const col=pink.clone().lerp(mix>.78?violet:white,mix*.48);
   colors.set([col.r,col.g,col.b],i*3);
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(p,3));geo.setAttribute("color",new THREE.BufferAttribute(colors,3));
 const heart=new THREE.Points(geo,new THREE.PointsMaterial({size:.064,map:glow,vertexColors:true,transparent:true,depthWrite:false,opacity:.94,alphaTest:.003,blending:THREE.AdditiveBlending,sizeAttenuation:true}));
 galaxyGroup.add(heart);animated.push({o:heart,spin:.025,pulse:true});
 const messages=cfg.items.map(it=>it[1]);
 messages.forEach((message,i)=>floatingPhrase(galaxyGroup,message,i,messages.length,0xffd8f0,49+(i%4)*5));
 makeComets(galaxyGroup,cfg.color,24,false);$("audioPlayer").classList.remove("hide");
}
function pick(e){
 const r=$("space").getBoundingClientRect(),p=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
 raycaster.setFromCamera(p,camera);
 const hit=raycaster.intersectObjects(clickables,true)[0];if(!hit)return;
 let o=hit.object;while(o&&!o.userData.type)o=o.parent;if(!o)return;
 const d=o.userData;
 if(d.type==="galaxy"&&mode==="universe")enterGalaxy(d.key);
 else if(d.type==="video")openVideo(d.key);
 else if(d.type==="phrase"){
   const messages=d.messages||[];
   if(messages.length){const message=messages[d.phraseIndex%messages.length];d.phraseIndex=(d.phraseIndex+1)%messages.length;showPhrase(message,d.imagePath,o);}
 }
}
function showPhrase(text,imagePath,spriteObject){
 if(selectedPhraseSprite)selectedPhraseSprite.visible=true;
 selectedPhraseSprite=spriteObject||null;
 if(selectedPhraseSprite)selectedPhraseSprite.visible=false;
 const overlay=$("phrase");
 if(activeKey==="heart"){
   $("heartPhraseText").textContent=text;
   overlay.classList.remove("character-phrase");
 }else{
   $("phraseText").textContent=text;
   $("characterImage").src=data[activeKey].folder+"/"+imagePath;
   overlay.classList.add("character-phrase");
 }
 overlay.classList.remove("hide");
}
function hidePhrase(){
 if(selectedPhraseSprite){selectedPhraseSprite.visible=true;selectedPhraseSprite=null;}
 $("phrase").classList.add("hide");
 $("phrase").classList.remove("character-phrase");
 $("characterImage").removeAttribute("src");
 $("phraseCenter").textContent="";
}
function openVideo(key){audios[key].pause();$("video").src=videos[key];$("videoBox").classList.remove("hide");$("video").play().catch(()=>{});}
function closeVideo(){const v=$("video");v.pause();v.removeAttribute("src");v.load();$("videoBox").classList.add("hide");if(activeKey)audios[activeKey].play().catch(()=>{});}
function backUniverse(){if(heartSpecialTimer){clearTimeout(heartSpecialTimer);heartSpecialTimer=null;}if(activeKey==="heart"){audios.extra.pause();audios.extra.currentTime=0;$("audioPlayer").classList.add("hide");updateAudioPlayer();}for(const a of animated){if(a.wormholeFade&&a.o?.parent){scene.remove(a.o);a.o.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose();});}}animated=animated.filter(a=>!a.wormholeFade&&!a.wormhole);hidePhrase();if(!$("videoBox").classList.contains("hide"))closeVideo();stopAudio();if(galaxyGroup){scene.remove(galaxyGroup);galaxyGroup.traverse(o=>{o.geometry?.dispose();if(o.material){const m=Array.isArray(o.material)?o.material:[o.material];m.forEach(x=>x.dispose());}});galaxyGroup=null;}clickables=clickables.filter(o=>o.userData.type==="galaxy");animated=animated.filter(a=>a.o.parent);universe.visible=true;mode="universe";activeKey=null;$("title").textContent="Mi universo para Jhoana ✨";$("back").classList.add("hide");camera.position.set(0,45,105);controls.target.set(0,0,0);playAudio("universe");}
function tick(){
 const dt=Math.min(.05,clockDelta());controls.update();const t=performance.now()*.001;
 for(let i=animated.length-1;i>=0;i--){
  const a=animated[i];if(!a.o?.parent){animated.splice(i,1);continue;}
  if(a.spin)a.o.rotation.y+=a.spin*dt;
  if(a.celestial){
    if(a.orbitRadius>0){const angle=t*a.orbitSpeed+a.phase;a.o.position.x=a.basePosition.x+Math.cos(angle)*a.orbitRadius;a.o.position.z=a.basePosition.z+Math.sin(angle)*a.orbitRadius;a.o.position.y=a.basePosition.y+Math.sin(angle*.7)*2.4;}
    a.o.rotation.z+=dt*.035;
  }
  if(a.float){a.o.position.y=a.baseY+Math.sin(t*1.15+a.phase)*1.8;a.o.rotation.z+=.12*dt;}
  if(a.twinkle&&a.o.material)a.o.material.opacity=.64+Math.sin(t*2.1+(a.phase||0))*.18;
  if(a.orbit){a.o.position.x=Math.cos(t*a.speed+a.a)*a.r;a.o.position.z=Math.sin(t*a.speed+a.a)*a.r;a.o.position.y=a.y+Math.sin(t+a.a)*1.4;}
  if(a.floatImage){a.o.position.y=a.y+Math.sin(t*.8+a.phase)*1.5;a.o.rotation.z=Math.sin(t*.45+a.phase)*.035;}
  if(a.floatText){
    const angle=a.angle+t*a.orbitSpeed;
    a.o.position.x=a.base.x+Math.cos(angle)*1.8;
    a.o.position.z=a.base.z+Math.sin(angle)*1.8;
    a.o.position.y=a.base.y+Math.sin(t*a.drift+a.phase)*2.2;
    a.o.material.opacity=.72+Math.sin(t*1.4+a.phase)*.13;
  }
  if(a.comet){
    a.o.position.addScaledVector(a.v,dt*60);
    if(a.halo)a.halo.material.opacity=.42+Math.sin(t*5+(a.phase||0))*.18;
    const out=Math.abs(a.o.position.x)>a.span/2||Math.abs(a.o.position.z)>a.span/2||Math.abs(a.o.position.y)>a.vertical/2;
    if(out){
      const side=Math.floor(Math.random()*6);
      a.o.position.set((Math.random()-.5)*a.span,(Math.random()-.5)*a.vertical,(Math.random()-.5)*a.span);
      if(side===0)a.o.position.x=-a.span/2;if(side===1)a.o.position.x=a.span/2;
      if(side===2)a.o.position.z=-a.span/2;if(side===3)a.o.position.z=a.span/2;
      a.v.set((Math.random()-.5)*.8,(Math.random()-.5)*.5,(Math.random()-.5)*.8).normalize().multiplyScalar(.28+Math.random()*.3);
    }
  }
  if(a.formation){
    a.elapsed+=dt;
    const pos=a.o.geometry.attributes.position.array;
    const burstPhase=Math.min(a.elapsed/.72,1);
    const gatherPhase=Math.max(0,Math.min((a.elapsed-.72)/2.35,1));
    const easeOut=1-Math.pow(1-burstPhase,3);
    const easeGather=1-Math.pow(1-gatherPhase,3);
    for(let j=0;j<a.count;j++){
      const k=j*3;
      const bx=a.start[k]+a.burst[k]*easeOut;
      const by=a.start[k+1]+a.burst[k+1]*easeOut;
      const bz=a.start[k+2]+a.burst[k+2]*easeOut;
      pos[k]=bx+(a.targets[k]-bx)*easeGather;
      pos[k+1]=by+(a.targets[k+1]-by)*easeGather;
      pos[k+2]=bz+(a.targets[k+2]-bz)*easeGather;
    }
    a.o.geometry.attributes.position.needsUpdate=true;
    if(a.elapsed>2.9){
      for(const child of a.baseChildren) child.visible=true;
      if(a.o.parent)a.o.parent.remove(a.o);
      a.o.geometry.dispose();a.o.material.dispose();
      animated.splice(i,1);
      continue;
    }
  }
  if(a.blackHoleFlow){
    const pos=a.o.geometry.attributes.position;
    for(let j=0;j<a.count;j++){
      a.angles[j]+=a.speeds[j]*dt;
      a.radii[j]-=dt*(.28+a.speeds[j]*.18);
      if(a.radii[j]<4.8)a.radii[j]=17+Math.random()*5;
      const k=j*3;
      pos.array[k]=Math.cos(a.angles[j])*a.radii[j];
      pos.array[k+1]=Math.sin(a.angles[j]*2.1)*.42;
      pos.array[k+2]=Math.sin(a.angles[j])*a.radii[j];
    }
    pos.needsUpdate=true;
  }
  if(a.wormhole){
    a.life+=dt;a.o.rotation.z+=dt*1.25;
    const pos=a.stream.geometry.attributes.position;
    for(let j=2;j<pos.count*3;j+=3){pos.array[j]+=dt*42;if(pos.array[j]>5)pos.array[j]=-105;}
    pos.needsUpdate=true;
  }
  if(a.wormholeFade){
    a.life+=dt;
    const progress=Math.min(a.life/3.4,1);
    camera.position.set(0,14+progress*16,128-progress*50);
    if(a.life>3.4){
      scene.remove(a.o);a.o.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose();});
      animated.splice(i,1);
    }
  }
  if(a.pulse)a.o.scale.setScalar(1+Math.sin(t*2)*.025);
 }
 renderer.render(scene,camera);
}
let last=performance.now();function clockDelta(){const n=performance.now(),d=(n-last)/1000;last=n;return d;}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}
$("enter").addEventListener("click",()=>{ $("cover").classList.add("hide");$("world").classList.remove("hide");if(!scene)init();playAudio("universe");});
$("back").addEventListener("click",backUniverse);$("closePhrase").addEventListener("click",hidePhrase);$("closePhraseFallback").addEventListener("click",hidePhrase);$("closeVideo").addEventListener("click",closeVideo);
function formatAudioTime(value){if(!Number.isFinite(value))return "0:00";const m=Math.floor(value/60),s=Math.floor(value%60);return `${m}:${String(s).padStart(2,"0")}`;}
function updateAudioPlayer(){
 const a=audios.extra,seek=$("audioSeek");
 if(Number.isFinite(a.duration)&&a.duration>0){seek.value=String(Math.round((a.currentTime/a.duration)*1000));$("audioTime").textContent=`${formatAudioTime(a.currentTime)} / ${formatAudioTime(a.duration)}`;}
 else{$("audioTime").textContent=`${formatAudioTime(a.currentTime)} / --:--`;seek.value="0";}
 $("audioPlay").textContent=a.paused?"▶":"Ⅱ";
}
audios.extra.addEventListener("timeupdate",updateAudioPlayer);audios.extra.addEventListener("loadedmetadata",updateAudioPlayer);audios.extra.addEventListener("play",updateAudioPlayer);audios.extra.addEventListener("pause",updateAudioPlayer);audios.extra.addEventListener("ended",updateAudioPlayer);
$("audioPlay").addEventListener("click",()=>{const a=audios.extra;if(a.paused)a.play().catch(()=>{});else a.pause();updateAudioPlayer();});
$("audioBack").addEventListener("click",()=>{audios.extra.currentTime=Math.max(0,audios.extra.currentTime-10);updateAudioPlayer();});
$("audioForward").addEventListener("click",()=>{const a=audios.extra;a.currentTime=Math.min(Number.isFinite(a.duration)?a.duration:a.currentTime+10,a.currentTime+10);updateAudioPlayer();});
$("audioSeek").addEventListener("input",e=>{const a=audios.extra;if(Number.isFinite(a.duration)&&a.duration>0)a.currentTime=(Number(e.target.value)/1000)*a.duration;updateAudioPlayer();});
