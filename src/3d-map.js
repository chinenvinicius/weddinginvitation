// @ts-nocheck
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

// Builds the animated venue scene inside `container`. Returns a dispose() for cleanup.
export function initVenue3D(container){
let renderer, scene, camera, controls, pin, raf, running=false, started=false, M={};

function rnd(a,b){return a+Math.random()*(b-a);}
function makeTex(draw,w,h,rx,ry){
  const c=document.createElement('canvas'); c.width=w; c.height=h;
  const x=c.getContext('2d'); draw(x,w,h);
  const t=new THREE.CanvasTexture(c);
  t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rx||1,ry||1);
  t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t;
}
const texStucco=()=>makeTex(function(x,w,h){
  x.fillStyle="#ccb795"; x.fillRect(0,0,w,h);
  for(let i=0;i<5200;i++){const v=rnd(-16,16)|0;
    x.fillStyle="rgba("+(150+v)+","+(135+v)+","+(108+v)+",0.22)";
    x.fillRect(Math.random()*w,Math.random()*h,2,2);}
},256,256,3,2);
const texCopper=()=>makeTex(function(x,w,h){
  x.fillStyle="#7ba18f"; x.fillRect(0,0,w,h);
  for(let i=0;i<700;i++){x.fillStyle="rgba("+(rnd(95,150)|0)+","+(rnd(150,185)|0)+","+(rnd(125,160)|0)+",0.14)";
    x.beginPath();x.arc(Math.random()*w,Math.random()*h,rnd(4,18),0,7);x.fill();}
  x.strokeStyle="rgba(54,84,74,0.5)"; x.lineWidth=2;
  for(let sx=0;sx<=w;sx+=16){x.beginPath();x.moveTo(sx,0);x.lineTo(sx,h);x.stroke();}
},256,256,4,2);
const texAsphalt=()=>makeTex(function(x,w,h){
  x.fillStyle="#5d5e61"; x.fillRect(0,0,w,h);
  for(let i=0;i<9000;i++){const v=rnd(-22,22)|0;
    x.fillStyle="rgba("+(96+v)+","+(96+v)+","+(99+v)+",0.5)";
    x.fillRect(Math.random()*w,Math.random()*h,1.5,1.5);}
},256,256,6,6);
const texGrass=()=>makeTex(function(x,w,h){
  x.fillStyle="#7d9d56"; x.fillRect(0,0,w,h);
  for(let i=0;i<10000;i++){const v=rnd(-24,24)|0;
    x.fillStyle="rgba("+(110+v)+","+(150+v)+","+(78+v)+",0.4)";
    x.fillRect(Math.random()*w,Math.random()*h,2,3);}
},256,256,16,16);
const texBark=()=>makeTex(function(x,w,h){
  x.fillStyle="#5b3f28"; x.fillRect(0,0,w,h);
  for(let i=0;i<80;i++){
    const px=Math.random()*w, bw=rnd(2,8), v=rnd(-34,28)|0;
    x.fillStyle="rgba("+(91+v)+","+(63+v*0.55|0)+","+(40+v*0.35|0)+",0.7)";
    x.fillRect(px,0,bw,h);
  }
  x.strokeStyle="rgba(38,24,14,0.45)"; x.lineWidth=1;
  for(let y=0;y<h;y+=rnd(8,18)){
    x.beginPath();
    x.moveTo(0,y);
    for(let px=0;px<=w;px+=16)x.lineTo(px,y+rnd(-4,4));
    x.stroke();
  }
  for(let i=0;i<110;i++){
    x.fillStyle="rgba(25,15,8,0.35)";
    x.beginPath(); x.ellipse(Math.random()*w,Math.random()*h,rnd(2,7),rnd(1,3),rnd(0,3),0,7); x.fill();
  }
},192,256,1,3);
const texLeaves=(r,g,b)=>makeTex(function(x,w,h){
  x.fillStyle="rgb("+r+","+g+","+b+")"; x.fillRect(0,0,w,h);
  for(let i=0;i<1600;i++){
    const v=rnd(-28,30)|0, a=rnd(0.16,0.42);
    x.fillStyle="rgba("+(r+v)+","+(g+v)+","+(b+v)+","+a+")";
    x.beginPath();
    x.ellipse(Math.random()*w,Math.random()*h,rnd(1,5),rnd(3,10),rnd(0,Math.PI),0,7);
    x.fill();
  }
  x.strokeStyle="rgba(230,245,210,0.10)";
  for(let i=0;i<90;i++){
    const px=Math.random()*w, py=Math.random()*h;
    x.beginPath(); x.moveTo(px,py); x.lineTo(px+rnd(-8,8),py+rnd(8,20)); x.stroke();
  }
},192,192,2,2);
const texWindow=()=>makeTex(function(x,w,h){
  x.fillStyle="#e7e1d2"; x.fillRect(0,0,w,h);
  const m=w*0.1, g=x.createLinearGradient(0,0,w*0.6,h);
  g.addColorStop(0,"#9fc0d4");g.addColorStop(.45,"#5b7e92");g.addColorStop(1,"#334a59");
  x.fillStyle=g; x.fillRect(m,m,w-2*m,h-2*m);
  x.fillStyle="#e7e1d2"; x.fillRect(w/2-2,m,4,h-2*m); x.fillRect(m,h/2-2,w-2*m,4);
},128,160,1,1);
function skyTex(){return makeTex(function(x,w,h){
  const g=x.createLinearGradient(0,0,0,h);
  g.addColorStop(0,"#5e9bd0"); g.addColorStop(.55,"#a9cfe8"); g.addColorStop(1,"#e9f3fa");
  x.fillStyle=g; x.fillRect(0,0,w,h);
  // soft sun glow (screen-space; scene.background doesn't rotate with camera)
  const s=x.createRadialGradient(w*0.66,h*0.24,0,w*0.66,h*0.24,w*0.45);
  s.addColorStop(0,"rgba(255,246,220,0.85)"); s.addColorStop(.3,"rgba(255,240,205,0.3)"); s.addColorStop(1,"rgba(255,240,205,0)");
  x.fillStyle=s; x.fillRect(0,0,w,h);
},256,256,1,1);}

const texRoof=()=>makeTex(function(x,w,h){
  // clay tile roof: rows of rounded tiles
  x.fillStyle="#7a3a22"; x.fillRect(0,0,w,h);
  const rows=10, rh=h/rows;
  for(let r=0;r<rows;r++){
    const y=r*rh;
    const shade=110+((r%2)?18:-18);
    x.fillStyle="rgba("+(shade+30)+","+(shade-20)+","+(shade-50)+",1)";
    // half-round tiles
    const cols=12, cw=w/cols;
    for(let c=0;c<cols;c++){
      const cx=c*cw;
      x.beginPath();
      x.ellipse(cx+cw/2, y+rh*0.7, cw*0.55, rh*0.55, 0, 0, Math.PI, true);
      x.fill();
    }
    // mortar line between rows
    x.fillStyle="rgba(60,30,18,0.5)";
    x.fillRect(0,y,w,1.5);
  }
  // weather streaks
  for(let i=0;i<400;i++){x.fillStyle="rgba(40,20,12,0.06)";
    x.fillRect(Math.random()*w,Math.random()*h,1,rnd(3,9));}
},256,256,2,1);

const texStoneBase=()=>makeTex(function(x,w,h){
  // rough granite foundation blocks
  x.fillStyle="#6b6862"; x.fillRect(0,0,w,h);
  const rows=6, cols=5;
  const bh=h/rows, bw=w/cols;
  for(let r=0;r<rows;r++){
    const off=((r%2)?bw/2:0);
    for(let c=-1;c<=cols;c++){
      const bx=c*bw+off, by=r*bh;
      const v=rnd(-14,14)|0;
      x.fillStyle="rgba("+(107+v)+","+(104+v)+","+(98+v)+",1)";
      x.fillRect(bx+1,by+1,bw-2,bh-2);
      x.strokeStyle="rgba(40,38,36,0.7)"; x.lineWidth=1.5;
      x.strokeRect(bx+1,by+1,bw-2,bh-2);
    }
  }
  // speckle
  for(let i=0;i<2000;i++){x.fillStyle="rgba(0,0,0,0.18)";
    x.fillRect(Math.random()*w,Math.random()*h,1,1);}
},256,256,2,1);

const texDoor=()=>makeTex(function(x,w,h){
  // wood-paneled entrance door
  x.fillStyle="#3a2418"; x.fillRect(0,0,w,h);
  // vertical planks
  const pl=4, pw=w/pl;
  for(let p=0;p<pl;p++){
    const v=rnd(-12,8)|0;
    x.fillStyle="rgba("+(58+v)+","+(36+v)+","+(24+v)+",1)";
    x.fillRect(p*pw+1,0,pw-2,h);
  }
  // panel insets
  x.strokeStyle="rgba(20,12,8,0.9)"; x.lineWidth=2;
  for(let p=0;p<pl;p++){
    x.strokeRect(p*pw+6, h*0.12, pw-12, h*0.28);
    x.strokeRect(p*pw+6, h*0.6, pw-12, h*0.28);
  }
  // handles
  x.fillStyle="#c2a14d";
  x.beginPath(); x.arc(w*0.5-4, h*0.5, 2.5, 0, 7); x.fill();
  x.beginPath(); x.arc(w*0.5+4, h*0.5, 2.5, 0, 7); x.fill();
},128,200,1,1);

function mats(){
  // ponytail: same canvas texture doubles as bumpMap — free surface relief, no extra textures
  const bumped=(tex,scale,opts)=>new THREE.MeshStandardMaterial(Object.assign({map:tex,bumpMap:tex,bumpScale:scale},opts));
  M.wall=bumped(texStucco(),0.6,{roughness:.92,metalness:0});
  M.copper=bumped(texCopper(),0.4,{roughness:.55,metalness:.35});
  M.glass=new THREE.MeshPhysicalMaterial({map:texWindow(),roughness:.08,metalness:0,envMapIntensity:2.2,clearcoat:1,clearcoatRoughness:.1});
  M.wood=new THREE.MeshStandardMaterial({color:0x3a2a20,roughness:.8});
  M.stone=new THREE.MeshStandardMaterial({color:0x8d8d8d,roughness:.9});
  M.base=new THREE.MeshStandardMaterial({color:0x9a8a70,roughness:.95});
  M.white=new THREE.MeshStandardMaterial({color:0xeae6da,roughness:.85});
  M.dark=new THREE.MeshStandardMaterial({color:0x20262b,roughness:.5,metalness:.3});
  M.roof=bumped(texRoof(),1.2,{roughness:.85,metalness:.05});
  M.stonebase=bumped(texStoneBase(),1.4,{roughness:.95,metalness:0});
  M.door=bumped(texDoor(),0.8,{roughness:.7,metalness:.15});
  M.bark=bumped(texBark(),1.5,{roughness:1,metalness:0});
  M.branch=new THREE.MeshStandardMaterial({color:0x4a3320,roughness:1,metalness:0});
  M.leafMid=bumped(texLeaves(74,116,54),0.9,{roughness:.96,metalness:0});
  M.leafLight=bumped(texLeaves(94,139,72),0.9,{roughness:.98,metalness:0});
  M.leafDark=bumped(texLeaves(48,88,42),0.9,{roughness:1,metalness:0});
  M.leafShadow=new THREE.MeshBasicMaterial({color:0x35512f,transparent:true,opacity:.24,depthWrite:false});
}
function wall(w,h,d,x,y,z,ry,mat){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat||M.wall);
  m.position.set(x,y,z); if(ry)m.rotation.y=ry;
  m.castShadow=true; m.receiveShadow=true; scene.add(m); return m;
}
function gable(w,h,d,mat,x,y,z,ry,o){
  o=o||0;
  const s=new THREE.Shape(); s.moveTo(-w/2-o,0); s.lineTo(w/2+o,0); s.lineTo(0,h); s.lineTo(-w/2-o,0);
  const g=new THREE.ExtrudeGeometry(s,{depth:d+2*o,bevelEnabled:false}); g.translate(0,0,-(d+2*o)/2);
  const m=new THREE.Mesh(g,mat); m.position.set(x,y,z); if(ry)m.rotation.y=ry;
  m.castShadow=true; m.receiveShadow=true; scene.add(m); return m;
}
function win(x,y,z){const m=new THREE.Mesh(new THREE.PlaneGeometry(1.3,1.8),M.glass);m.position.set(x,y,z);scene.add(m);}
function winRow(x0,y,z,n,dx){for(let i=0;i<n;i++)win(x0+i*dx,y,z);}
// detailed window with frame, sill, and mullions facing +Z
function winFramed(x,y,z){
  const g=new THREE.Group();
  // frame
  const frameMat=new THREE.MeshStandardMaterial({color:0xeae6da,roughness:.7});
  const fThick=0.08;
  const w=1.5, h=2.1;
  const top=new THREE.Mesh(new THREE.BoxGeometry(w+fThick*2,fThick,0.18),frameMat); top.position.y=h/2+fThick/2; g.add(top);
  const bot=new THREE.Mesh(new THREE.BoxGeometry(w+fThick*2,fThick*1.6,0.22),frameMat); bot.position.y=-h/2-fThick*0.8; g.add(bot);
  const lft=new THREE.Mesh(new THREE.BoxGeometry(fThick,h,0.18),frameMat); lft.position.x=-w/2-fThick/2; g.add(lft);
  const rgt=new THREE.Mesh(new THREE.BoxGeometry(fThick,h,0.18),frameMat); rgt.position.x=w/2+fThick/2; g.add(rgt);
  // glass pane
  const pane=new THREE.Mesh(new THREE.PlaneGeometry(w,h),M.glass); pane.position.z=0.05; g.add(pane);
  // mullions (cross)
  const mul=new THREE.Mesh(new THREE.BoxGeometry(fThick*0.7,h,0.1),frameMat); mul.position.z=0.06; g.add(mul);
  const mulh=new THREE.Mesh(new THREE.BoxGeometry(w,fThick*0.7,0.1),frameMat); mulh.position.z=0.06; g.add(mulh);
  // sill ledge (stone)
  const sill=new THREE.Mesh(new THREE.BoxGeometry(w+0.4,0.18,0.35),M.stonebase); sill.position.y=-h/2-0.18; sill.position.z=0.05; sill.castShadow=true; g.add(sill);
  g.position.set(x,y,z);
  g.traverse(function(o){if(o.isMesh){o.castShadow=true;}});
  scene.add(g);
  return g;
}
function winFramedRow(x0,y,z,n,dx){for(let i=0;i<n;i++)winFramed(x0+i*dx,y,z);}
function organicBlobGeometry(radius,sx,sy,sz){
  // weld duplicated verts (PolyhedronGeometry is non-indexed) so normals smooth instead of faceting
  const g=mergeVertices(new THREE.IcosahedronGeometry(radius,3));
  const p=g.attributes.position;
  const ph=rnd(0,7);
  for(let i=0;i<p.count;i++){
    const X=p.getX(i),Y=p.getY(i),Z=p.getZ(i);
    // position-based lumps: duplicated verts displace identically (no cracks), normals stay smooth
    const j=1+0.16*Math.sin(X*2.7/radius+ph)*Math.sin(Z*3.1/radius+Y*1.7/radius+ph);
    p.setXYZ(i,X*sx*j,Y*sy*j,Z*sz*j);
  }
  g.computeVertexNormals();
  return g;
}
function branchBetween(a,b,rTop,rBottom,mat){
  const dir=new THREE.Vector3().subVectors(b,a);
  const len=dir.length();
  const br=new THREE.Mesh(new THREE.CylinderGeometry(rTop,rBottom,len,7),mat);
  br.position.copy(a).add(b).multiplyScalar(0.5);
  br.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());
  br.castShadow=true;
  return br;
}
function tree(x,z,h){
  const tg=new THREE.Group();
  const trunkH=h*0.82;
  const lean=rnd(-0.06,0.06);
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.2,.44,trunkH,12),M.bark);
  trunk.position.set(0,trunkH/2,0);
  trunk.rotation.z=lean;
  trunk.castShadow=true; trunk.receiveShadow=true; tg.add(trunk);

  for(let r=0;r<5;r++){
    const a=r/5*Math.PI*2+rnd(-0.2,0.2);
    const root=branchBetween(
      new THREE.Vector3(Math.cos(a)*0.08,0.18,Math.sin(a)*0.08),
      new THREE.Vector3(Math.cos(a)*rnd(0.55,0.95),0.05,Math.sin(a)*rnd(0.55,0.95)),
      0.05,0.13,M.branch
    );
    tg.add(root);
  }

  for(let b=0;b<9;b++){
    const a=b/9*Math.PI*2+rnd(-0.28,0.28);
    const y=trunkH*rnd(0.48,0.9);
    const len=h*rnd(0.22,0.42);
    const start=new THREE.Vector3(Math.cos(a)*0.08,y,Math.sin(a)*0.08);
    const end=new THREE.Vector3(Math.cos(a)*len,y+h*rnd(0.08,0.28),Math.sin(a)*len);
    tg.add(branchBetween(start,end,rnd(0.035,0.075),rnd(0.09,0.16),M.branch));
  }

  const layers=[
    [0,trunkH+h*0.16,0,h*0.35,1.15,0.78,1.02,M.leafMid],
    [-h*0.25,trunkH+h*0.08,h*0.08,h*0.26,0.98,0.72,0.9,M.leafLight],
    [h*0.25,trunkH+h*0.09,-h*0.04,h*0.28,1.05,0.7,0.96,M.leafDark],
    [-h*0.05,trunkH+h*0.34,-h*0.12,h*0.25,0.9,0.78,0.84,M.leafDark],
    [h*0.15,trunkH+h*0.32,h*0.15,h*0.23,0.88,0.72,0.82,M.leafLight],
    [0,trunkH+h*0.5,0,h*0.18,0.8,0.9,0.74,M.leafMid]
  ];
  layers.forEach(function(p){
    const f=new THREE.Mesh(organicBlobGeometry(p[3],p[4],p[5],p[6]),p[7]);
    f.position.set(p[0],p[1],p[2]);
    f.rotation.set(rnd(-0.12,0.12),rnd(0,Math.PI),rnd(-0.1,0.1));
    f.castShadow=true; f.receiveShadow=true; tg.add(f);
  });
  const leafMats=[M.leafMid,M.leafLight,M.leafDark];
  for(let i=0;i<18;i++){
    const a=Math.random()*Math.PI*2;
    const rr=h*rnd(0.12,0.42);
    const y=trunkH+h*rnd(0.08,0.48);
    const puff=new THREE.Mesh(
      organicBlobGeometry(h*rnd(0.07,0.13),rnd(0.8,1.25),rnd(0.65,1.0),rnd(0.75,1.15)),
      leafMats[i%leafMats.length]
    );
    puff.position.set(Math.cos(a)*rr,y,Math.sin(a)*rr);
    puff.rotation.set(rnd(-0.2,0.2),rnd(0,Math.PI),rnd(-0.2,0.2));
    puff.castShadow=true; puff.receiveShadow=true; tg.add(puff);
  }
  const shade=new THREE.Mesh(new THREE.CircleGeometry(h*0.62,28),M.leafShadow);
  shade.rotation.x=-Math.PI/2;
  shade.position.y=0.03;
  tg.add(shade);
  tg.rotation.y=rnd(0,Math.PI*2);
  tg.position.set(x,0,z); scene.add(tg);
  return tg;
}

function init(){
  scene=new THREE.Scene();
  scene.background=skyTex();
  scene.fog=new THREE.Fog(0xc8def0,70,170);

  camera=new THREE.PerspectiveCamera(42, container.clientWidth/container.clientHeight, .1, 800);
  camera.position.set(-26,16,34);

  renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05;
  container.appendChild(renderer.domElement);

  const pmrem=new THREE.PMREMGenerator(renderer);
  scene.environment=pmrem.fromScene(new RoomEnvironment(),0.04).texture;

  scene.add(new THREE.HemisphereLight(0xdcefff,0x6c7f54,0.55));
  const sun=new THREE.DirectionalLight(0xffedc9,2.2); sun.position.set(24,34,20);
  sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
  sun.shadow.camera.near=1; sun.shadow.camera.far=150;
  sun.shadow.camera.left=-48; sun.shadow.camera.right=48; sun.shadow.camera.top=48; sun.shadow.camera.bottom=-48;
  sun.shadow.bias=-0.0005; sun.shadow.normalBias=0.03; scene.add(sun);

  mats();

  const gT=texGrass();
  const grass=new THREE.Mesh(new THREE.PlaneGeometry(320,320),new THREE.MeshStandardMaterial({map:gT,bumpMap:gT,bumpScale:0.5,roughness:1}));
  grass.rotation.x=-Math.PI/2; grass.receiveShadow=true; scene.add(grass);
  const aT=texAsphalt();
  const road=new THREE.Mesh(new THREE.PlaneGeometry(74,24),new THREE.MeshStandardMaterial({map:aT,bumpMap:aT,bumpScale:0.35,roughness:1}));
  road.rotation.x=-Math.PI/2; road.position.set(0,0.02,19); road.receiveShadow=true; scene.add(road);

  wall(48,0.7,11,1,0.35,-0.5,0,M.base);

  // --- left wing (attached to main hall) ---
  wall(9,4.6,7.5,-10.5,2.3,0.5);
  // stone foundation under left wing
  const lf=new THREE.Mesh(new THREE.BoxGeometry(9.2,0.9,7.7),M.stonebase);
  lf.position.set(-10.5,0.45,0.5); lf.castShadow=true; lf.receiveShadow=true; scene.add(lf);
  gable(7.5,2.0,9,M.roof,-10.5,4.6,0.5,Math.PI/2,0.45);
  const lridge=new THREE.Mesh(new THREE.BoxGeometry(9.6,0.2,0.4),M.roof);
  lridge.position.set(-10.5,6.5,0.5); lridge.castShadow=true; scene.add(lridge);
  winFramedRow(-13.5,2.4,4.35,4,2.0);

  // --- central main hall ---
  wall(18,5.6,9,3,2.8,-0.5);
  const cf=new THREE.Mesh(new THREE.BoxGeometry(18.2,0.9,9.2),M.stonebase);
  cf.position.set(3,0.45,-0.5); cf.castShadow=true; cf.receiveShadow=true; scene.add(cf);
  gable(9,3.2,18,M.roof,3,5.6,-0.5,Math.PI/2,0.6);
  const cridge=new THREE.Mesh(new THREE.BoxGeometry(9.2,0.22,18.2),M.roof);
  cridge.position.set(3,6.4,-0.5); cridge.rotation.y=Math.PI/2; cridge.castShadow=true; scene.add(cridge);
  winFramedRow(-4.5,2.9,4.15,7,2.2);

  // --- tower block ---
  wall(8,6.4,8,12.5,3.2,-1);
  const tf=new THREE.Mesh(new THREE.BoxGeometry(8.2,1,8.2),M.stonebase);
  tf.position.set(12.5,0.5,-1); tf.castShadow=true; tf.receiveShadow=true; scene.add(tf);
  gable(8,2.6,8,M.roof,12.5,6.4,-1,Math.PI/2,0.5);
  const tridge=new THREE.Mesh(new THREE.BoxGeometry(8.2,0.22,8.2),M.roof);
  tridge.position.set(12.5,7.1,-1); tridge.rotation.y=Math.PI/2; tridge.castShadow=true; scene.add(tridge);
  // chimney on tower
  const chim=new THREE.Mesh(new THREE.BoxGeometry(1,3.2,1),M.stonebase);
  chim.position.set(12.5,8.5,-2.5); chim.castShadow=true; scene.add(chim);
  const chimCap=new THREE.Mesh(new THREE.BoxGeometry(1.3,0.3,1.3),M.stonebase);
  chimCap.position.set(12.5,10.2,-2.5); chimCap.castShadow=true; scene.add(chimCap);

  // --- right wing ---
  wall(7,5,7.5,18.5,2.5,0.5);
  const rf=new THREE.Mesh(new THREE.BoxGeometry(7.2,0.9,7.7),M.stonebase);
  rf.position.set(18.5,0.45,0.5); rf.castShadow=true; rf.receiveShadow=true; scene.add(rf);
  gable(7.5,2.2,7,M.roof,18.5,5,0.5,Math.PI/2,0.45);
  const rridge=new THREE.Mesh(new THREE.BoxGeometry(7.2,0.18,7.2),M.roof);
  rridge.position.set(18.5,5.6,0.5); rridge.rotation.y=Math.PI/2; rridge.castShadow=true; scene.add(rridge);
  winFramedRow(16,2.5,4.3,3,1.8);

  // --- bell tower (tall) ---
  wall(8.5,11.5,8.5,9,5.75,-7);
  const bf=new THREE.Mesh(new THREE.BoxGeometry(8.7,1.1,8.7),M.stonebase);
  bf.position.set(9,0.55,-7); bf.castShadow=true; bf.receiveShadow=true; scene.add(bf);
  gable(8.5,1.6,8.5,M.roof,9,11.5,-7,Math.PI/2,0.4);
  const bridge=new THREE.Mesh(new THREE.BoxGeometry(8.7,0.22,8.7),M.roof);
  bridge.position.set(9,12.1,-7); bridge.rotation.y=Math.PI/2; bridge.castShadow=true; scene.add(bridge);
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,5,6),new THREE.MeshStandardMaterial({color:0xb9bcc0,metalness:.6,roughness:.3}));
  pole.position.set(9,14.5,-7); pole.castShadow=true; scene.add(pole);
  // banner/flag on the tower pole
  const banner=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.1),new THREE.MeshStandardMaterial({color:0x6e1023,roughness:.6,side:THREE.DoubleSide,emissive:0x3a0610,emissiveIntensity:0.15}));
  banner.position.set(9.9,15.2,-7); banner.castShadow=true; scene.add(banner);
  banner.userData={baseY:15.2};
  // bell
  const bell=new THREE.Mesh(new THREE.ConeGeometry(0.55,0.9,12,1,true),new THREE.MeshStandardMaterial({color:0xb9bcc0,metalness:.7,roughness:.35}));
  bell.position.set(9,12.6,-7); bell.castShadow=true; scene.add(bell);
  // arched window slots on the tower (4 sides)
  for(let s=0;s<4;s++){
    const aw=new THREE.Mesh(new THREE.PlaneGeometry(1.4,3),M.glass);
    aw.position.set(9,9,-7); aw.position.x+=Math.cos(s*Math.PI/2)*4.1; aw.position.z+=Math.sin(s*Math.PI/2)*4.1;
    aw.lookAt(9,9,-7); scene.add(aw);
  }

  wall(0.9,4.2,0.9,-2.4,2.1,5.4,0,M.stone);
  wall(0.9,4.2,0.9,2.4,2.1,5.4,0,M.stone);
  gable(7.2,3.2,4.6,M.wood,0,4.2,5.4,0,0.35);
  // vestibule connecting the main hall wall to the porch door (door no longer floats)
  wall(5.2,3.9,2.2,0,1.95,5.0);
  // entrance: detailed arched door + stone steps + lanterns
  const doorH=3.4, doorW=2.4;
  const dMain=new THREE.Mesh(new THREE.BoxGeometry(doorW,doorH,0.18),M.door);
  dMain.position.set(0,doorH/2+0.1,6.05); dMain.castShadow=true; scene.add(dMain);
  // stone arch frame
  const archMat=M.stonebase;
  const archSide=new THREE.Mesh(new THREE.BoxGeometry(0.5,doorH+0.4,0.6),archMat);
  archSide.position.set(-doorW/2-0.25,doorH/2+0.1,6.05); archSide.castShadow=true; scene.add(archSide);
  const archSide2=archSide.clone(); archSide2.position.x=doorW/2+0.25; scene.add(archSide2);
  const archTop=new THREE.Mesh(new THREE.BoxGeometry(doorW+1,0.7,0.6),archMat);
  archTop.position.set(0,doorH+0.3,6.05); archTop.castShadow=true; scene.add(archTop);
  // entrance steps
  for(let s=0;s<3;s++){
    const sw=doorW+2.4-s*0.8, sd=0.5;
    const step=new THREE.Mesh(new THREE.BoxGeometry(sw,0.18,sd),M.stonebase);
    step.position.set(0,0.09+s*0.18,6.35+s*sd*0.5); step.castShadow=true; step.receiveShadow=true; scene.add(step);
  }
  // flanking stone lanterns
  function lantern(px){
    const lg=new THREE.Group();
    const post=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.16,1.4,8),M.stonebase);
    post.position.y=0.7; post.castShadow=true; lg.add(post);
    const box=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.7,0.5),new THREE.MeshStandardMaterial({color:0xe7cf86,emissive:0xffb24a,emissiveIntensity:0.5,roughness:.5}));
    box.position.y=1.75; box.castShadow=true; lg.add(box);
    const cap=new THREE.Mesh(new THREE.ConeGeometry(0.42,0.35,4),M.stonebase); cap.position.y=2.25; lg.add(cap);
    lg.position.set(px,0,6.8); scene.add(lg);
  }
  lantern(-doorW/2-1.6); lantern(doorW/2+1.6);

  // front fence + hedge, split with a gate opening at the entrance path
  wall(16.5,1.3,0.5,-11.75,0.75,6.6,0,M.base);
  wall(16.5,1.3,0.5,11.75,0.75,6.6,0,M.base);
  wall(16.5,0.25,0.7,-11.75,1.45,6.6,0,M.white);
  wall(16.5,0.25,0.7,11.75,1.45,6.6,0,M.white);
  for(let px=-19;px<=19;px+=3.8){ if(Math.abs(px)<3.4) continue; wall(0.7,1.7,0.7,px,0.85,6.6,0,M.base); }
  const hedgeMat=new THREE.MeshStandardMaterial({color:0x55733f,roughness:1});
  [-11.75,11.75].forEach(function(hx){
    const hedge=new THREE.Mesh(new THREE.BoxGeometry(16.5,1.3,0.9),hedgeMat);
    hedge.position.set(hx,0.8,7.4); hedge.castShadow=true; hedge.receiveShadow=true; scene.add(hedge);
  });
  // garden flower beds with blooms flanking the entrance
  function flowerBed(px,pz,n){
    for(let i=0;i<n;i++){
      const fx=px+(Math.random()-0.5)*5, fz=pz+(Math.random()-0.5)*1.4;
      const fh=0.3+Math.random()*0.25;
      const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,fh,5),new THREE.MeshStandardMaterial({color:0x4c7a40}));
      stem.position.set(fx,fh/2,fz); scene.add(stem);
      const bloomColors=[0xaa2039,0xe7cf86,0xf4e1e6,0x6e1023,0xc2a14d];
      const bloom=new THREE.Mesh(new THREE.SphereGeometry(0.16,7,6),new THREE.MeshStandardMaterial({color:bloomColors[i%bloomColors.length],roughness:.7}));
      bloom.position.set(fx,fh+0.12,fz); bloom.castShadow=true; scene.add(bloom);
    }
  }
  flowerBed(-7,5.2,14); flowerBed(7,5.2,14);
  // entrance flower urns
  function urn(ux){
    const ug=new THREE.Group();
    const body=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.28,0.6,10),M.stonebase);
    body.position.y=0.3; body.castShadow=true; ug.add(body);
    const soil=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.32,0.1,10),new THREE.MeshStandardMaterial({color:0x3a2a20,roughness:1}));
    soil.position.y=0.6; ug.add(soil);
    for(let f=0;f<5;f++){
      const fl=new THREE.Mesh(new THREE.SphereGeometry(0.14,7,6),new THREE.MeshStandardMaterial({color:[0xaa2039,0xe7cf86,0xf4e1e6][f%3],roughness:.7}));
      fl.position.set(Math.cos(f)*0.18,0.75+Math.random()*0.15,Math.sin(f)*0.18); fl.castShadow=true; ug.add(fl);
    }
    ug.position.set(ux,0.2,6.9); scene.add(ug);
  }
  urn(-3.2); urn(3.2);

  const lineMat=new THREE.MeshStandardMaterial({color:0xe9e9e9,roughness:1});
  for(let i=-4;i<=4;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(0.22,6),lineMat);m.rotation.x=-Math.PI/2;m.position.set(i*3.1,0.04,23);m.receiveShadow=true;scene.add(m);}
  // stone path from road to entrance
  const pathMat=M.stonebase;
  for(let s=0;s<9;s++){
    const stone=new THREE.Mesh(new THREE.BoxGeometry(2.6,0.12,0.9),pathMat);
    stone.position.set(0,0.06,23-s*1.7-1.2);
    stone.position.x=(Math.random()-0.5)*0.25;
    stone.rotation.y=(Math.random()-0.5)*0.06;
    stone.receiveShadow=true; scene.add(stone);
  }

  [
    [-27,8,5.7],[-24,2,6.2],[-22,-5,6.8],[-17,-13,7.6],[-10,-19,6.4],
    [25,8,5.8],[28,1,6.4],[25,-6,6.9],[18,-14,7.5],[10,-20,6.3],
    [-4,-24,7.1],[4,-25,6.7],[15,-25,7.8],[-17,-25,7.4],[28,-20,6.6],
    [-31,18,5.2],[-24,22,5.8],[24,20,5.5],[31,15,5.1],
    [-30,31,4.8],[30,31,4.9]
  ].forEach(function(p){ tree(p[0],p[1],p[2]); });

  function hill(x,z,s,c){const m=new THREE.Mesh(new THREE.SphereGeometry(s,18,12,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:c,roughness:1}));m.position.set(x,-2,z);m.scale.set(2,1,1.5);scene.add(m);}
  hill(-32,-44,18,0x6f8a55); hill(8,-54,24,0x5f7a49); hill(38,-42,16,0x789360);

  function cloud(x,y,z,s){const g=new THREE.Group();const mat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1});[[0,0,0,1],[1.1,-.2,0,.8],[-1.1,-.15,0,.75],[.5,.4,0,.7]].forEach(function(p){const m=new THREE.Mesh(new THREE.SphereGeometry(p[3]*s,10,10),mat);m.position.set(p[0]*s,p[1]*s,p[2]);g.add(m);});g.position.set(x,y,z);g.scale.y=.7;scene.add(g);}
  cloud(-24,28,-36,3.2); cloud(18,32,-48,3.8); cloud(36,25,-22,2.6);

  pin=new THREE.Group();
  const pmMat=new THREE.MeshStandardMaterial({color:0x6e1023,roughness:.4,metalness:.1});
  const head=new THREE.Mesh(new THREE.SphereGeometry(1.05,20,20),pmMat); head.position.y=2.2;
  const tip=new THREE.Mesh(new THREE.ConeGeometry(0.8,2.2,20),pmMat); tip.position.y=0.55; tip.rotation.x=Math.PI;
  const dot=new THREE.Mesh(new THREE.SphereGeometry(0.42,14,14),new THREE.MeshStandardMaterial({color:0xe7cf86,metalness:.4,roughness:.35})); dot.position.y=2.32;
  pin.add(tip,head,dot); pin.position.set(0,10,5); pin.traverse(function(o){if(o.isMesh)o.castShadow=true;}); scene.add(pin);

  controls=new OrbitControls(camera,renderer.domElement);
  controls.target.set(0,3,-1);
  controls.enableDamping=true; controls.dampingFactor=.07;
  controls.autoRotate=true; controls.autoRotateSpeed=.6;
  controls.enablePan=false; controls.minDistance=18; controls.maxDistance=64;
  controls.minPolarAngle=0.35; controls.maxPolarAngle=1.46;
  controls.update();

  addEventListener('resize',onResize);
  started=true;
}
function onResize(){
  if(!renderer)return;
  camera.aspect=container.clientWidth/container.clientHeight; camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}
function loop(){
  if(!running)return;
  raf=requestAnimationFrame(loop);
  const t=performance.now()*0.001;
  if(pin) pin.position.y=10+Math.sin(t*2)*0.4;
  // banner gentle wave
  scene.traverse(function(o){ if(o.userData&&o.userData.baseY&&o.geometry){o.position.y=o.userData.baseY+Math.sin(t*2.5)*0.04; o.rotation.y=Math.sin(t*1.5)*0.12;} });
  controls.update();
  renderer.render(scene,camera);
}
function vh(){ return window.innerHeight || document.documentElement.clientHeight || 0; }
function inView(){ const r=container.getBoundingClientRect(); const H=vh(); return H>0 && r.top < H*0.95 && r.bottom > H*0.05; }
function start(){
  if(!started){ try{ init(); }catch(err){ console.error('venue3d init failed',err); return; } }
  if(!running){ running=true; loop(); }
}
function stop(){ if(running){ running=false; if(raf) cancelAnimationFrame(raf); } }
function maybeStart(){ if(inView()) start(); else stop(); }
addEventListener('scroll',maybeStart,{passive:true});
addEventListener('resize',maybeStart);
let io;
try{
  io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting) start(); else stop(); });
  },{threshold:0.05});
  io.observe(container);
}catch(e){}
maybeStart();
const startTimer=setTimeout(maybeStart,1000);

return function dispose(){
  stop();
  clearTimeout(startTimer);
  removeEventListener('scroll',maybeStart);
  removeEventListener('resize',maybeStart);
  removeEventListener('resize',onResize);
  if(io) io.disconnect();
  if(renderer){
    renderer.dispose();
    const el=renderer.domElement;
    if(el && el.parentNode) el.parentNode.removeChild(el);
  }
};
}
