let passwordCorrect = false;

function checkPassword(){
  const pwd = document.getElementById('pwdInput').value;
  if(pwd === '0102' || pwd === '0000'){
    document.getElementById('passwordOverlay').style.display='none';
    initScene();
    document.getElementById('bgMusic').play();
  } else alert('Wrong Password');
}

// THREE.js scene
let scene, camera, renderer, controls, sunflower, rose, heart, happyText;

function initScene(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 7);

  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('canvasContainer').appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff,0.8);
  const dirLight = new THREE.DirectionalLight(0xffffff,1);
  dirLight.position.set(5,10,7);
  scene.add(ambient, dirLight);

  // Sunflower
  sunflower = new THREE.Group();
  const center = new THREE.Mesh(new THREE.SphereGeometry(0.3,32,32), new THREE.MeshStandardMaterial({color:0x331100}));
  sunflower.add(center);

  const petalMat = new THREE.MeshStandardMaterial({color:0xffcc00, metalness:0.3, roughness:0.5});
  for(let i=0;i<20;i++){
    const petal = new THREE.Mesh(new THREE.ConeGeometry(0.05,0.6,16), petalMat);
    petal.position.set(Math.cos(i*Math.PI/10)*0.5,0,Math.sin(i*Math.PI/10)*0.5);
    petal.rotation.x=Math.PI/2;
    sunflower.add(petal);
  }
  scene.add(sunflower);

  // Small heart
  const heartShape = new THREE.Shape();
  heartShape.moveTo(0,0);
  heartShape.bezierCurveTo(0,0.25,-0.25,0.5,0,0.75);
  heartShape.bezierCurveTo(0.25,0.5,0,0.25,0,0);
  const heartGeo = new THREE.ExtrudeGeometry(heartShape,{depth:0.05, bevelEnabled:true, bevelThickness:0.01, bevelSize:0.01});
  heart = new THREE.Mesh(heartGeo,new THREE.MeshStandardMaterial({color:0xff3366}));
  heart.scale.set(0.5,0.5,0.5);
  heart.position.set(0,0.2,0);
  sunflower.add(heart);

  heart.userData.clickable = true;
  window.addEventListener('click', onClick);

  happyText = document.getElementById('happyText');

  // Gyroscope support
  if(window.DeviceOrientationEvent){
    window.addEventListener('deviceorientation', e=>{
      const gamma = e.gamma/30; // left-right tilt
      const beta = e.beta/30;   // front-back tilt
      sunflower.rotation.y = gamma;
      sunflower.rotation.x = beta;
      if(rose) rose.rotation.y = gamma;
    });
  }

  animate();
}

function onClick(event){
  event.preventDefault();
  const mouse = new THREE.Vector2((event.clientX/window.innerWidth)*2-1, -(event.clientY/window.innerHeight)*2+1);
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse,camera);
  const intersects = raycaster.intersectObjects([heart], true);
  if(intersects.length>0) transformSunflowerToRose();
}

function transformSunflowerToRose(){
  sunflower.children.forEach(c=>{ if(c.geometry.type==='ConeGeometry') sunflower.remove(c); });

  // Rose
  rose = new THREE.Group();
  const colors = [0xff0033,0xffcc00,0xff99ff,0xffffff]; // red, yellow, pink, white
  for(let i=0;i<25;i++){
    const p = new THREE.TorusGeometry(0.3-i*0.01,0.05,16,100,Math.PI*2);
    const petal = new THREE.Mesh(p,new THREE.MeshStandardMaterial({color:colors[i%4], metalness:0.2, roughness:0.6}));
    petal.rotation.x=Math.PI/2;
    petal.rotation.z=i*0.25;
    rose.add(petal);
  }
  rose.position.copy(sunflower.position);
  scene.add(rose);

  gsap.to(happyText,{opacity:1,duration:2,delay:1});
}

function animate(){
  requestAnimationFrame(animate);
  if(sunflower) sunflower.rotation.y += 0.002;
  if(rose) rose.rotation.y += 0.001;
  renderer.render(scene,camera);
}
