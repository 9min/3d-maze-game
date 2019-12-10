class MazeGame {
  constructor() {
    this.BLOCK_WIDTH = 90;
    this.BLOCK_HEIGHT = 45;
    this.DINO_SCALE = 20;
    this.DINO_MODEL_PATH = "./models/dino.json";
    this.DINO_SPEED = 1000;
    this.PALYER_SPEED = 1500;
    this.PLAYER_COLLISION_DISTANCE = 30;
    this.DINO_COLLISION_DISTANCE = 70;
    this.CATCH_OFFSET = 120;
    this.COLOR = {
      FOG: "#cccccc",
      LIGHT: "#ffffff",
      CUBE: "#1279e0",
      GROUND: "#001230",
      PERIMETER_WALL: "#353535"
    };

    this.el = null;
    this.camera = null;
    this.scene = null;
    this.renderer = null;
    this.controls = null;
    this.loader = null;

    // 충돌을 체크하기 위한 객체의 배열
    this.collidableObjects = [];
    this.mapSize = null;
    this.moveDirection = {
      forward: false,
      backward: false,
      left: false,
      right: false
    };
    this.dinoVelocity = new THREE.Vector3();
    this.playerVelocity = new THREE.Vector3();
    // 이 개체는 새 프레임을 렌더링 하는 데 걸리는 시간(delta)을 추적하기 위해 사용됩니다.
    // 케릭터를 프레임마다 일정하게 움직이게 하기 위해서 해당 값을 곱합니다.
    this.clock = new THREE.Clock();
    this.dino = null;
    this.gameOver = false;
  }

  init = () => {
    this.initElements();
    this.initEvents();
    this.initSence();
    this.initRenderer();
    this.initCamera();
    this.initControls();
    this.initLoader();
    this.createMazeCubes();
    this.createPerimWalls();
    this.createGround();
    this.addLights();
  };

  initElements = () => {
    this.el = {
      container: this.qs("#container"),
      blocker: this.qs("#blocker"),
      instructions: this.qs("#instructions"),
      dinoAlert: this.qs("#dino-alert")
    };
  };

  initEvents = () => {
    window.addEventListener("resize", this.onWindowResize);
    document.addEventListener("click", this.onDocumentClick);
    document.addEventListener("pointerlockchange", this.onPointerLockChange);
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);
  };

  initSence = () => {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(this.COLOR.FOG, 0.0015);
  };

  initRenderer = () => {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(this.scene.fog.color);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.el.container.appendChild(this.renderer.domElement);
  };

  initCamera = () => {
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );
    this.camera.position.y = 20;
    this.camera.position.x = 0;
    this.camera.position.z = 0;

    this.scene.add(this.camera);
  };

  initControls = () => {
    this.controls = new THREE.PointerLockControls(this.camera);
    this.scene.add(this.controls.getObject());
  };

  initLoader = () => {
    this.loader = new THREE.JSONLoader();
    this.loader.load(this.DINO_MODEL_PATH, this.createDinoModel);
  };

  createMazeCubes = () => {
    const map = [
      [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1],
      [0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0],
      [1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0],
      [0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0]
    ];
    const widthOffset = this.BLOCK_WIDTH / 2; // x축과 z축의 추가 간격
    const heightOffset = this.BLOCK_HEIGHT / 2; // y축의 추가 간격 (블럭과 바닥 사이의 간격)
    const cubeGeo = new THREE.BoxGeometry(
      this.BLOCK_WIDTH, // 미로 벽 가로길이
      this.BLOCK_HEIGHT, // 미로 벽 높이
      this.BLOCK_WIDTH // 미로 벽 세로길이
    );
    const cubeMat = new THREE.MeshPhongMaterial({
      color: this.COLOR.CUBE
    });
    const totalCubesWide = map[0].length;

    for (let i = 0; i < totalCubesWide; i++) {
      for (let j = 0, len = map[i].length; j < len; j++) {
        if (map[i][j]) {
          const cube = new THREE.Mesh(cubeGeo, cubeMat);

          cube.position.z =
            (i - totalCubesWide / 2) * this.BLOCK_WIDTH + widthOffset;
          cube.position.x =
            (j - totalCubesWide / 2) * this.BLOCK_WIDTH + widthOffset;
          cube.position.y = heightOffset;

          this.scene.add(cube);
          this.collidableObjects.push(cube);
        }
      }
    }

    this.mapSize = totalCubesWide * this.BLOCK_WIDTH;
  };

  createPerimWalls = () => {
    const halfMap = this.mapSize / 2;
    let sign = 1;

    // 두 번 반복하여 한 번에 두 개의 둘레 벽을 만듭니다.
    for (let i = 0; i < 2; i++) {
      const perimGeo = new THREE.PlaneGeometry(this.mapSize, this.BLOCK_HEIGHT);
      const perimMat = new THREE.MeshPhongMaterial({
        color: this.COLOR.PERIMETER_WALL,
        side: THREE.DoubleSide
      });
      const perimWallLR = new THREE.Mesh(perimGeo, perimMat);
      const perimWallFB = new THREE.Mesh(perimGeo, perimMat);

      // 왼쪽/오른쪽 외벽 생성
      perimWallLR.position.set(halfMap * sign, this.BLOCK_HEIGHT / 2, 0);
      // 기본이 가로로 되어있으므로 90도 회전시켜서 세로 방향으로 변경한다
      perimWallLR.rotation.y = this.degreesToRadians(90);

      // 앞/뒤 외벽 생성
      perimWallFB.position.set(0, this.BLOCK_HEIGHT / 2, halfMap * sign);

      this.scene.add(perimWallLR);
      this.scene.add(perimWallFB);

      this.collidableObjects.push(perimWallLR);
      this.collidableObjects.push(perimWallFB);

      // 1 <-> -1 변경하면서 왼쪽 <-> 오룬쪽, 앞 <-> 뒤 변경
      sign = -1;
    }
  };

  createGround = () => {
    const groundGeo = new THREE.PlaneGeometry(this.mapSize, this.mapSize);
    const groundMat = new THREE.MeshPhongMaterial({
      color: this.COLOR.GROUND,
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);

    ground.position.set(0, 1, 0);
    ground.rotation.x = this.degreesToRadians(90);

    this.scene.add(ground);
  };

  addLights = () => {
    const lightOne = new THREE.DirectionalLight(this.COLOR.LIGHT);
    const lightTwo = new THREE.DirectionalLight(this.COLOR.LIGHT, 0.5);

    lightOne.position.set(1, 1, 1);
    lightTwo.position.set(1, -1, -1);

    this.scene.add(lightOne);
    this.scene.add(lightTwo);
  };

  createDinoModel = (geometry, materials) => {
    const dinoObject = new THREE.Mesh(
      geometry,
      new THREE.MultiMaterial(materials)
    );

    dinoObject.scale.set(this.DINO_SCALE, this.DINO_SCALE, this.DINO_SCALE);
    dinoObject.rotation.y = this.degreesToRadians(-60);
    dinoObject.position.set(0, 0, -400);
    dinoObject.name = "dino";

    this.scene.add(dinoObject);
    this.dino = this.scene.getObjectByName("dino");
    this.el.instructions.innerHTML = `
      <strong>Click to start!</strong>
      <p>W,A,S,D/arrow keys to move</p>
      <p>mouse to look</p>
    `;

    this.animate();
  };

  animate = () => {
    const deleta = this.clock.getDelta();

    this.render();
    this.triggerChase();

    if (
      this.dino.position.distanceTo(this.controls.getObject().position) <
      this.CATCH_OFFSET
    ) {
      this.caught();
    } else {
      this.animatePlayer(deleta);
      this.animateDino(deleta);
    }

    window.requestAnimationFrame(this.animate);
  };

  animatePlayer = delta => {
    const { forward, backward, left, right } = this.moveDirection;
    const addPlayerVelocity = 10 * delta;
    const addPlayerSpeed = this.PALYER_SPEED * delta;

    // 일정한 프레임으로 이동
    this.playerVelocity.x -= this.playerVelocity.x * addPlayerVelocity;
    this.playerVelocity.z -= this.playerVelocity.z * addPlayerVelocity;

    // 충돌하지 않았을 때에만 이동
    if (!this.detectPlayerCollision()) {
      if (forward) {
        this.playerVelocity.z -= addPlayerSpeed;
      }
      if (backward) {
        this.playerVelocity.z += addPlayerSpeed;
      }
      if (left) {
        this.playerVelocity.x -= addPlayerSpeed;
      }
      if (right) {
        this.playerVelocity.x += addPlayerSpeed;
      }
    }

    // 방향키를 누르지 않으면 정지
    if ([forward, backward, left, right].every(v => !v)) {
      this.playerVelocity.x = 0;
      this.playerVelocity.z = 0;
    }

    this.controls.getObject().translateX(this.playerVelocity.x * delta);
    this.controls.getObject().translateZ(this.playerVelocity.z * delta);
  };

  animateDino = delta => {
    const addDinoVelocity = 10 * delta;

    // 일정한 프레임으로 이동
    this.dinoVelocity.x -= this.dinoVelocity.x * addDinoVelocity;
    this.dinoVelocity.z -= this.dinoVelocity.z * addDinoVelocity;

    // 정면에 있는 오브젝트와 충돌했으면
    if (this.detectDinoCollision()) {
      const directionMultiples = [-1, 1, 2];
      const randomIndex = this.getRandomInt({ min: 0, max: 2 });
      const randomDirection = this.degreesToRadians(
        90 * directionMultiples[randomIndex]
      );

      this.dinoVelocity.z += this.DINO_SPEED * delta;
      this.dino.rotation.y += randomDirection;
    } else {
      // 공룡 이동
      this.dinoVelocity.z += this.DINO_SPEED * delta;
    }

    this.dino.translateZ(this.dinoVelocity.z * delta);
  };

  triggerChase = () => {
    // 공룡과 플레이어의 거리가 300 미만이면
    if (
      this.dino.position.distanceTo(this.controls.getObject().position) < 300
    ) {
      const lookTarget = new THREE.Vector3();

      lookTarget.copy(this.controls.getObject().position);
      lookTarget.y = this.dino.position.y;

      // 공룡이 플레이어를 바라보게 설정
      this.dino.lookAt(lookTarget);

      // 공룡과 플레이어의 거리가 CATCH_OFFSET 보다 작으면 화면에 거리를 표시해줍니다.
      const distanceFrom =
        Math.round(
          this.dino.position.distanceTo(this.controls.getObject().position)
        ) - this.CATCH_OFFSET;

      this.el.dinoAlert.innerHTML =
        "Dino has spotted you! Distance from you: " + distanceFrom;
      this.el.dinoAlert.style.display = "block";

      return true;
    } else {
      this.el.dinoAlert.style.display = "none";

      return false;
    }
  };

  render = () => {
    this.renderer.render(this.scene, this.camera);
  };

  onWindowResize = () => {
    const { innerWidth, innerHeight } = window;

    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(innerWidth, innerHeight);
  };

  onDocumentClick = () => {
    this.el.container.requestPointerLock();
  };

  onPointerLockChange = () => {
    if (document.pointerLockElement === this.el.container) {
      this.el.blocker.style.display = "none";
      this.controls.enabled = true;
    } else {
      this.el.blocker.style.display = "";
      this.controls.enabled = false;

      if (this.gameOver) {
        window.location.reload();
      }
    }
  };

  onChangeKeyCode = ({ keyCode, boolean }) => {
    switch (keyCode) {
      case 38: // up
      case 87: // w
        this.moveDirection.forward = boolean;
        break;
      case 37: // left
      case 65: // a
        this.moveDirection.left = boolean;
        break;
      case 40: // down
      case 83: // s
        this.moveDirection.backward = boolean;
        break;
      case 39: // right
      case 68: // d
        this.moveDirection.right = boolean;
        break;
    }
  };

  onKeyDown = ({ keyCode }) => {
    this.onChangeKeyCode({ keyCode, boolean: true });
  };

  onKeyUp = ({ keyCode }) => {
    this.onChangeKeyCode({ keyCode, boolean: false });
  };

  detectPlayerCollision = () => {
    const { backward, left, right } = this.moveDirection;
    const cameraDirection = this.controls
      .getDirection(new THREE.Vector3(0, 0, 0))
      .clone();
    let rotationMatrix = null;

    if (backward) {
      rotationMatrix = new THREE.Matrix4();
      rotationMatrix.makeRotationY(this.degreesToRadians(180));
    } else if (left) {
      rotationMatrix = new THREE.Matrix4();
      rotationMatrix.makeRotationY(this.degreesToRadians(90));
    } else if (right) {
      rotationMatrix = new THREE.Matrix4();
      rotationMatrix.makeRotationY(this.degreesToRadians(270));
    }

    // 플레이어가 앞으로 이동하지 않을 때 행렬 매트릭스 적용 (플레이어가 바라보는 카메라 방향 전환)
    if (rotationMatrix) {
      cameraDirection.applyMatrix4(rotationMatrix);
    }

    // 플레이어가 보는 카메라 방향에 광선을 적용
    const rayCaster = new THREE.Raycaster(
      this.controls.getObject().position,
      cameraDirection
    );

    // 광선이 PLAYER_COLLISION_DISTANCE 거리 안에 있는 오브젝트에 부딪혔으면 true, 아니면 false
    if (
      this.rayIntersect({
        ray: rayCaster,
        distance: this.PLAYER_COLLISION_DISTANCE
      })
    ) {
      return true;
    } else {
      return false;
    }
  };

  detectDinoCollision = () => {
    // 항상 공룡의 정면에서 raycaster가 나옵니다.
    // 플레이어 충돌처럼 회전할 필요가 없습니다.
    const matrix = new THREE.Matrix4();
    const directionFront = new THREE.Vector3(0, 0, 1);

    matrix.extractRotation(this.dino.matrix);
    directionFront.applyMatrix4(matrix);

    // 공룡이 보는 카메라 방향에 광선을 적용
    const rayCasterFront = new THREE.Raycaster(
      this.dino.position,
      directionFront
    );

    // 광선이 DINO_COLLISION_DISTANCE 거리 안에 있는 오브젝트에 부딪혔으면 true, 아니면 false
    if (
      this.rayIntersect({
        ray: rayCasterFront,
        distance: this.DINO_COLLISION_DISTANCE
      })
    ) {
      return true;
    } else {
      return false;
    }
  };

  caught = () => {
    this.el.blocker.style.display = "";
    this.el.instructions.innerHTML = `
      <strong>GAME OVER!</strong>
      <p>Press ESC to restart</p>
    `;
    this.el.instructions.style.display = "";
    this.el.dinoAlert.style.display = "none";

    this.gameOver = true;
  };

  qs = name => {
    return document.querySelector(name);
  };

  degreesToRadians = degrees => {
    return (degrees * Math.PI) / 180;
  };

  radiansToDegrees = radians => {
    return (radians * 180) / Math.PI;
  };

  rayIntersect = ({ ray, distance }) => {
    const intersects = ray.intersectObjects(this.collidableObjects);

    for (let i = 0, len = intersects.length; i < len; i++) {
      if (intersects[i].distance < distance) {
        return true;
      }
    }
    return false;
  };

  getRandomInt = ({ min, max }) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  };
}

new MazeGame().init();
