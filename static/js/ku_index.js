/*
   먹이는 마우스 클릭? 키보드? --> 마우스 클릭
   캔버스 내에서 더블클릭을 하면 먹이 render 되고 떨어지게 하기
   x좌표만 얻어오고 z좌표는 랜덤으로 해서 먹이 떨어뜨릴 것!

   line: 255
*/


import * as THREE from "/modules/three/three.module.js";
import { OrbitControls } from "/modules/three/OrbitControls.js";
import { OBJLoader2 } from "/modules/three/OBJLoader2.js";
import { MTLLoader } from "/modules/three/MTLLoader.js";
import { MtlObjBridge } from "/modules/three/obj2/bridge/MtlObjBridge.js";
import * as Fishes from "/js/fishes/fishes.js";
import { Water } from "/assets/Water2.js";

// 녹조 (수정중... 색 변화 X)
//  209 water effect를 감소시키거나, 다른방법으로 구현하거나...

let canvas = document.querySelector("#gl-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

let scene = new THREE.Scene();
// scene.background = new THREE.Color("#000000");
// scene.background = new THREE.Color("skyblue");
scene.background = new THREE.Color(0.8, 0.8, 0.8);

let camera;
let light;
let controls;
// loaders
let mtlLoader;
let objLoader;

let width = canvas.clientWidth;
let height = canvas.clientHeight;
let mousePos = { x: 0, y: 0 };
let bubbles = [];

// 먹이 부분 변수들
let feedTwoPoint = new THREE.Vector2();

const params = {
  // color: "#00ffff",
  color: "#ffffff",
  scale: 4,
  flowX: 1,
  flowY: 1,
};

let loadingFlag = 0;

window.onload = function init() {
  document.addEventListener("mousemove", handleMouseMove, false);
  initThree();
  initObj();
  render();

  // 로딩속도가 느린 장치를 위해서...
  var lodingInterval = setInterval(function () {
    if (loadingFlag == 1) clearTimeout(lodingInterval);
    else {
      loading();
    }
  }, 500);
};

function loading() {
  if (scene.children[15].children[1] != undefined) {
    scene.children[15].children[1].material.opacity = 0.4;
    console.log(scene.children[15].children[1]);
    {
      for (var x = 0; x <= 8; x++) {
        // for loop to create cubes
        var randScale = 5 * Math.random();
        bubbles[x] = new THREE.Mesh(sphereGeometry, clearWhiteTopMaterial);
        bubbles[x].position.set(
          -75 + -25 * Math.random(),
          30 + 20 * Math.random() * 10,
          -75 + -25 * Math.random()
        );
        //bubbles[x].rotation.set(0, 0, 0);
        bubbles[x].scale.set(0.1 * randScale, 0.1 * randScale, 0.1 * randScale);
      //  scene.add(bubbles[x]);
      }
    }
  //  const loadingElem = document.querySelector("#loading");
   // loadingElem.style.display = "none";
    //loadingFlag = 1;
  }
}

var sphereGeometry = new THREE.SphereGeometry(6, 100, 100);

// material for the top of the aquarium structures
var clearWhiteTopMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  shininess: 30,
  specular: 0x111111,
  opacity: 0.5,
});

/**
 * Threejs 초기화 함수
 */
function initThree() {
  const fov = 50;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 100;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);
  console.log(camera);
  controls = new OrbitControls(camera, canvas);
  // controls.autoRotate = true;
  controls.autoRotateSpeed = 0.8;
  controls.enableDamping = true;
  // controls.rotateSpeed = 0.3;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  // console.log(controls);

  addDirectionalLight();
}

let food = 0;
var timer = 0;

function render() {
  // 창 크기에 따라 늘어나는 문제부터 해결해봅시다.
  // 먼저 카메라의 aspect(비율) 속성을 canvas의 화면 크기에 맞춰야 합니다
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  // timer++; // 1초에 60개씩 증가..
  // console.log(timer); //

  if (timer >= 1500 && timer < 1700) {
    scene.children[15].children[1].material.color.r = 0.3;
    scene.children[15].children[1].material.color.g = 1;
    scene.children[15].children[1].material.color.b = 0.5;
  } else if (timer >= 1700) {
    if (confirm("물이 더러워졌습니다. 확인을 누르면 다시 깨끗해집니다.")) {
      scene.children[15].children[1].material.color.r = 1;
      scene.children[15].children[1].material.color.g = 1;
      scene.children[15].children[1].material.color.b = 1;
      timer = 0;
    } else timer -= 150;
  }

  if (food) {
    fishes.update(mousePos);
  } else fishes.move();

  // {
  //   // 1인칭을 위한 작업
  //   var speed = Date.now() * 0.00025;
  //   camera.position.x = Math.cos(speed) * 10;
  //   camera.position.z = Math.sin(speed) * 10;

  //   camera.lookAt(scene.position); //0,0,0
  // }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

/**
 * Objects 초기화 함수
 */
function initObj() {
  // createWater();
  createFishTank();
  createFish();
}

// 광원 효과
function addDirectionalLight() {
  {
    const skyColor = 0xb1e1ff; // light blue
    const groundColor = 0xb97a20; // brownish orange
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }
  {
    const color = 0xffffff;
    const intensity = 1;
    light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    // light.position.x = 5;
    // light.position.y = 5;
    // light.position.z = 5;
    // light.castShadow = true;
    scene.add(light);
    scene.add(light.target);
  }
}

// canvas의 원본 크기와 디스플레이 크기를 비교해 원본 크기를 변경할지 결정하는 함수
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
  const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
  const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5);
  const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
  // compute a unit vector that points in the direction the camera is now
  // in the xz plane from the center of the box
  // 육면체의 중심에서 카메라가 있는 곳으로 향하는 방향 벡터를 계산합니다
  const direction = new THREE.Vector3()
    .subVectors(camera.position, boxCenter)
    .multiply(new THREE.Vector3(1, 0, 1))
    .normalize();

  // move the camera to a position distance units way from the center
  // in whatever direction the camera was from the center already
  // 방향 벡터에 따라 카메라를 육면체로부터 일정 거리에 위치시킵니다
  camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

  // pick some near and far values for the frustum that
  // will contain the box.
  camera.near = boxSize / 100;
  camera.far = boxSize * 100;

  camera.updateProjectionMatrix();

  console.log(boxCenter);

  // point the camera to look at the center of the box
  camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
  console.log(camera);
}

function handleMouseMove(event) {
  const tx = -1 + (event.clientX / width) * 2;
  const ty = -(event.clientY / height) * 2;
  mousePos = { x: tx, y: ty };
}

// 마우스 더블클릭 시 x,y,z 좌표 반환 (단, y좌표는 고정?)
function onDocumentMouseClick(event) {
  // Y좌표를 100? 105? 일단 105으로 해놓고 채현님한테 물어볼 것!

  event.preventDefault();
  feedTwoPoint.x = (event.clientX / canvas.width) * 2 - 1;
  feedTwoPoint.y = -(105 / canvas.height) * 2 + 1;

  const zPoint = Math.random() * 1.0;
  const newVector = new THREE.Vector3(feedTwoPoint.x, feedTwoPoint.y, zPoint);

  return newVector;
}

// 더블클릭을 하게되면?
canvas.addEventListener("dblclick", function(event) {
  const feedThreePoint = onDocumentMouseClick(event);  // x,y,z가 다 담긴 vector 생성
  alert("x: " + feedThreePoint.x + " y: " + feedThreePoint.y + " z: " + feedThreePoint.z); //-> x,y,z 확인!

  // 더블클릭을 했으니 먹이를 생성한다 + 떨어뜨린다
  food = true;
  controls.autoRotate = false;

  setTimeout(function() {
    food = false;
    controls.autoRotate = true;
  }, 10000);
});

/*
  // 추후 더블 클릭시 먹이 생성 및 생성좌표 전달 예정
  canvas.addEventListener("dblclick", function () {
    food = true;
    controls.autoRotate = false;

    setTimeout(function () {
      food = false;
      controls.autoRotate = true;
    }, 10000);
  });
  */


// fishtank의 투명도를 낮추고....확대????
function createFishTank() {
  mtlLoader = new MTLLoader();
  mtlLoader.load("/resources/fishTank2/fishTank.mtl", mtlParseResult => {
    const materials = MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
    console.log(materials);
    for (const material of Object.values(materials)) {
      material.side = THREE.DoubleSide;
    }
    objLoader = new OBJLoader2();
    objLoader.addMaterials(materials);
    objLoader.load("/resources/fishTank2/fishTank.obj", root => {
      root.rotation.x = Math.PI * -0.5;
      root.scale.set(7, 15, 7);

      scene.add(root);

      // compute the box that contains all the stuff
      // from root and below
      const box = new THREE.Box3().setFromObject(root);
      // const height = Math.max(box.size().y, box.size().x);
      // const dist = height / (2 * Math.tan((camera.fov * Math.PI) / 360));
      const boxSize = box.getSize(new THREE.Vector3()).length();
      const boxCenter = box.getCenter(new THREE.Vector3());

      // set the camera to frame the box
      frameArea(boxSize * 1.2, boxSize, boxCenter, camera);

      // update the Trackball controls to handle the new size
      controls.target.copy(boxCenter);
      // controls.target.set(0, 70, 20);
      controls.minDistance = 5;
      controls.maxDistance = boxSize * 1.2;
    });
  });
}

let water;
function createWater() {
  // water
  const waterGeometry = new THREE.PlaneBufferGeometry(20, 20);

  water = new Water(waterGeometry, {
    color: params.color,
    // scale: params.scale,
    // flowDirection: new THREE.Vector2(params.flowX, params.flowY),
    textureWidth: 1024,
    textureHeight: 1024,
  });

  water.position.set(0, 65, 60);
  water.scale.set(10.5, 5.5, 10);
  water.rotation.set(0, 0, 0);
  // water.rotation.x = Math.PI * -0.5;
  scene.add(water);
  console.log(water);
}

let fishes;
function createFish() {
  fishes = new Fishes.Fishes();
  fishes.createFishes(scene);
}
