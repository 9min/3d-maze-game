class MazeGame {
  constructor() {
    this.BLOCK_WIDTH = 90;
    this.BLOCK_HEIGHT = 45;
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

    this.mapSize = null;
    this.collidableObjects = []; // 충돌을 체크하기 위한 객체의 배열
  }

  init() {
    this.initElements();
    this.initEvents();
    this.initSence();
    this.initRenderer();
    this.initCamera();
    this.initControls();
    this.createMazeCubes();
    this.createPerimWalls();
    this.createGround();
    this.addLights();
    this.animate();
  }

  initElements() {
    this.el = {
      container: this.qs("#container"),
      blocker: this.qs("#blocker")
    };
  }

  initEvents() {
    window.addEventListener("resize", this.onWindowResize, false);
    document.onclick = () => {
      this.el.container.requestPointerLock();
    };
    document.addEventListener(
      "pointerlockchange",
      () => this.lockChange(),
      false
    );
  }

  initSence() {
    this.scene = new THREE.Scene();
    // this.scene.fog = new THREE.FogExp2(this.COLOR.FOG, 0.0015);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer();
    // this.renderer.setClearColor(this.scene.fog.color);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.el.container.appendChild(this.renderer.domElement);
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      100, // 60
      window.innerWidth / window.innerHeight,
      10, // 1
      2000 // 2000
    );
    this.camera.position.y = 200; // 20;
    this.camera.position.x = 0; // 0
    this.camera.position.z = 0; // 0

    this.scene.add(this.camera);
  }

  initControls() {
    this.controls = new THREE.PointerLockControls(this.camera);
    this.scene.add(this.controls.getObject());
  }

  createMazeCubes() {
    const map = [
      [0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0],
      [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0]
    ];
    const { BLOCK_WIDTH, BLOCK_HEIGHT } = this;
    const widthOffset = BLOCK_WIDTH / 2; // x축과 z축의 추가 간격
    const heightOffset = BLOCK_HEIGHT / 2; // y축의 추가 간격 (블럭과 바닥 사이의 간격)
    const cubeGeo = new THREE.BoxGeometry(
      BLOCK_WIDTH, // 미로 벽 가로길이
      BLOCK_HEIGHT, // 미로 벽 높이
      BLOCK_WIDTH // 미로 벽 세로길이
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
            (i - totalCubesWide / 2) * BLOCK_WIDTH + widthOffset;
          cube.position.x =
            (j - totalCubesWide / 2) * BLOCK_WIDTH + widthOffset;
          cube.position.y = heightOffset;

          this.scene.add(cube);
          this.collidableObjects.push(cube);
        }
      }
    }

    this.mapSize = totalCubesWide * BLOCK_WIDTH;
  }

  createPerimWalls() {
    const { BLOCK_HEIGHT } = this;
    const halfMap = this.mapSize / 2;
    let sign = 1;

    // 두 번 반복하여 한 번에 두 개의 둘레 벽을 만듭니다.
    for (let i = 0; i < 2; i++) {
      const perimGeo = new THREE.PlaneGeometry(this.mapSize, BLOCK_HEIGHT);
      const perimMat = new THREE.MeshPhongMaterial({
        color: this.COLOR.PERIMETER_WALL,
        side: THREE.DoubleSide
      });
      const perimWallLR = new THREE.Mesh(perimGeo, perimMat);
      const perimWallFB = new THREE.Mesh(perimGeo, perimMat);

      // 왼쪽/오른쪽 외벽 생성
      perimWallLR.position.set(halfMap * sign, BLOCK_HEIGHT / 2, 0);
      // 기본이 가로로 되어있으므로 90도 회전시켜서 세로 방향으로 변경한다
      perimWallLR.rotation.y = this.degreesToRadians(90);

      // 앞/뒤 외벽 생성
      perimWallFB.position.set(0, BLOCK_HEIGHT / 2, halfMap * sign);

      this.scene.add(perimWallLR);
      this.scene.add(perimWallFB);

      this.collidableObjects.push(perimWallLR);
      this.collidableObjects.push(perimWallFB);

      // 1 <-> -1 변경하면서 왼쪽 <-> 오룬쪽, 앞 <-> 뒤 변경
      sign = -1;
    }
  }

  createGround() {
    const groundGeo = new THREE.PlaneGeometry(this.mapSize, this.mapSize);
    const groundMat = new THREE.MeshPhongMaterial({
      color: this.COLOR.GROUND,
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);

    ground.position.set(0, 1, 0);
    ground.rotation.x = this.degreesToRadians(90);

    this.scene.add(ground);
  }

  addLights() {
    const lightOne = new THREE.DirectionalLight(this.COLOR.LIGHT);
    const lightTwo = new THREE.DirectionalLight(this.COLOR.LIGHT, 0.5);

    lightOne.position.set(1, 1, 1);
    lightTwo.position.set(1, -1, -1);

    this.scene.add(lightOne);
    this.scene.add(lightTwo);
  }

  animate() {
    this.render();
    requestAnimationFrame(() => this.animate());
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  lockChange() {
    if (document.pointerLockElement === this.el.container) {
      this.el.blocker.style.display = "none";
      this.controls.enabled = true;
    } else {
      this.el.blocker.style.display = "";
      this.controls.enabled = false;
    }
  }

  onWindowResize() {
    const { innerWidth, innerHeight } = window;

    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(innerWidth, innerHeight);
  }

  qs(name) {
    return document.querySelector(name);
  }

  degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  radiansToDegrees(radians) {
    return (radians * 180) / Math.PI;
  }
}

new MazeGame().init();
