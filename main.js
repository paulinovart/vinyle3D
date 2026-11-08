// appeller le dossier "public, là ou on mets "
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { color } from "three/tsl";

const scene = new THREE.Scene(); // scene : comme le viewport ds blender
const viewport = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//const bufferGeometry = new BufferGeometry();

let onOffButton, vinyle,isoRoom;
const objects = [];

let onState = true;

/*
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
CAMERA
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
 */

const camera = new THREE.PerspectiveCamera(
  45, // field of view (fov) ==> focale de la camera
  viewport.width / viewport.height, // aspect ratio ()
  0.2, // plan de clip proche (near)  ==> à quel point on voit loin ou proche dans une scene
  1000 // plan de clip loin(far)
);

//camera.position.set(1, 1, 1);

/*
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
LUMIERE
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
 */

const ambLight = new THREE.AmbientLight(0xffffff, 1);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(2, 1, 0);
dirLight.target.position.set(0, 0, 0);
dirLight.castShadow = true;
ambLight.castShadow = true;
scene.add(ambLight, dirLight);

/*
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
RENDERER
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
 */

const renderer = new THREE.WebGLRenderer({antialias:true}); // rendre ce que voit la camera
renderer.setSize(viewport.width, viewport.height); // taille du rendu, attention, ça doit etre coherent avec l'aspect ratio

document.body.appendChild(renderer.domElement); // ça crée un Canvas

/*
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
ENVMAP
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
 */

const hdrLoader = new HDRLoader();
const envMap = await hdrLoader.loadAsync( '/hdris/comfy_cafe_1k.hdr' );
envMap.mapping = THREE.EquirectangularReflectionMapping;
scene.environment = envMap;
scene.background = envMap;

/*
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
DRACOLOADER
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
 */


const dracoloader = new DRACOLoader();
dracoloader.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
);





/*
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
CONTROLS
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
 */

const controls = new OrbitControls(camera, renderer.domElement)
controls.enablePan;
controls.cursorStyle = "grab";
//controls.autoRotate = true;
controls.autoRotateSpeed = true;
controls.enableDamping = true;

/*
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
SCENE
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
 */

const material = new THREE.MeshPhysicalMaterial({ color: "blue" });

const imgMaterial = new THREE.MeshBasicMaterial({
  //map: texture
});


const loader = new GLTFLoader();
loader.setDRACOLoader(dracoloader);


loader.load("/models/iso-music-room.glb",(gltf) =>{
  isoRoom = gltf.scene;


     //déplacer le point d'origine du modele
     const box = new THREE.Box3().setFromObject(isoRoom);
     const center = box.getCenter(new THREE.Vector3());
   
     // Déplacer le modèle pour que son centre coïncide avec (0, 0, 0) de son parent
     isoRoom.position.sub(center);

  isoRoom.castShadow = true;
  isoRoom.receiveShadow = true;
  isoRoom.position.set(0.08,-0.32,0.2)
  isoRoom.scale.set(0.3,0.3,0.3)
  isoRoom.rotation.y = THREE.MathUtils.degToRad(53);
  

  console.log(isoRoom)
  scene.add(gltf.scene);
 
})





loader.load("models/record-player.glb", (gltf) => {
    const model = gltf.scene;

    //déplacer le point d'origine du modele
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
  
    // Déplacer le modèle pour que son centre coïncide avec (0, 0, 0) de son parent
    model.position.sub(center);


  /*
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
RECUPERER LES NOMS DES PARTIES DU MODELE 3D
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
 */

  gltf.scene.traverse((child) => {
    objects.push(child);

    if (child.name === "on-off-button") {
      onOffButton = child;
    }

    if (child.name === "vinyle") {
      vinyle = child;
    }
  });
console.log(objects);


  /*
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
GESTION GENERALE DES ELEMENTS 3D
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
 */

  gltf.scene.position.y = 0;
  camera.lookAt(gltf.scene.position);

  gltf.scene.castShadow = true;
  gltf.scene.receiveShadow = true;
  scene.add(gltf.scene);

  renderer.render(scene, camera);
});

/*
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
SOL
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
 */


const floorMaterial = new THREE.MeshBasicMaterial( { color: 0x654321, side: THREE.DoubleSide } );
const floorGeometry = new THREE.PlaneGeometry(2,2)

const floor = new THREE.Mesh (floorGeometry, floorMaterial)
//scene.add(floor)
floor.rotateX (Math.PI/2)



/*
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
RAYCASTER AU CLICK
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
 */

const mouse = new THREE.Vector2(10, 10);
const raycaster = new THREE.Raycaster(undefined, undefined);
let clicked = null;

window.addEventListener("click", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const hits = raycaster.intersectObjects(scene.children);

  if (hits.length > 0) {
    const clicked = hits[0].object;
    // console.log('Objet cliqué :', clicked);

    //RECUPERER LE NOM DE L'OBJET CLIQUE ET AGIR EN CONSEQUENCE

    //1 ON OFF BUTTON

    if (clicked.name === "on-off-button") {
      //console.log("on off cliqué")
      onOffClicked();
      onState = onState == true ? false : true; //en gros ça toggle le boolean
      console.log(onState);
    }
  }
});


var myAudio = document.createElement("audio");
myAudio.src = "/sons/billie-eilish- ellyache.mp3";

console.log(myAudio)

function onOffClicked() {
    if (onState == true) {
        onOffButton.position.z = 0.002;
        myAudio.play();
    } else {
        onOffButton.position.z = 0.008;
        myAudio.pause();
  }
}

/*
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
RESIZE
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
 */

camera.position.z = 1; //attention, sur 3js, z cla profondeur, il faut inverser z eu y en gros par rapport à blender
camera.position.y = 0.4;

window.onresize = () => {
  viewport.width = window.innerWidth;
  viewport.height = window.innerHeight;
  camera.aspect = viewport.width / viewport.height;
  camera.updateProjectionMatrix();

  renderer.setSize(viewport.width, viewport.height);

  renderer.render(scene, camera); //il faut le mettre à chaque fois qu'il y a un nouveau parametre, comm le resize
};

/*
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
ANIMATE
-------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------
 */

function animate(time) {
  //rendu à chaque frame du canvas
  //onOffClicked();
  controls.update();

  if (onState == false) {
    vinyle.rotation.y = time * 0.0005;

    //console.log(vinyle)
  } else {
  }

  renderer.render(scene, camera);
}

//RENDERER

renderer.setAnimationLoop(animate);

renderer.render(scene, camera);
