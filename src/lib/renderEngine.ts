import * as THREE from 'three';

export interface RenderEngineOptions {
  width?: number;
  height?: number;
  antialias?: boolean;
  alpha?: boolean;
}

export interface DeviceTransform {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  opacity: number;
}

/**
 * Three.js RenderEngine for rendering device with 3D transformations
 */
export class RenderEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  private deviceGroup: THREE.Group;
  private screenMesh: THREE.Mesh;
  private notchMesh: THREE.Mesh;
  private bodyMesh: THREE.Mesh;

  private screenTexture: THREE.CanvasTexture | null = null;

  constructor(canvas: HTMLCanvasElement, options: RenderEngineOptions = {}) {

    const width = options.width || canvas.clientWidth;
    const height = options.height || canvas.clientHeight;

    // Initialize scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1e293b);

    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 600;

    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: options.antialias !== false,
      alpha: options.alpha !== false,
      preserveDrawingBuffer: true,
    });

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    // Create device group
    this.deviceGroup = new THREE.Group();
    this.scene.add(this.deviceGroup);

    // Create device body mesh
    this.bodyMesh = this.createDeviceBody();
    this.deviceGroup.add(this.bodyMesh);

    // Create screen mesh
    this.screenMesh = this.createScreenMesh();
    this.deviceGroup.add(this.screenMesh);

    // Create notch mesh
    this.notchMesh = this.createNotchMesh();
    this.deviceGroup.add(this.notchMesh);

    // Setup lighting
    this.setupLighting();
  }

  /**
   * Create device body mesh (black phone shape)
   */
  private createDeviceBody(): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(390, 844, 20);
    const material = new THREE.MeshPhongMaterial({
      color: 0x000000,
      shininess: 100,
      flatShading: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.z = -10;

    return mesh;
  }

  /**
   * Create screen mesh (plane for screenshot)
   */
  private createScreenMesh(): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(390, 844);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0x000000,
      shininess: 50,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.z = 5;

    return mesh;
  }

  /**
   * Create notch mesh (black bar at top)
   */
  private createNotchMesh(): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(214, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0x000000,
      emissive: 0x000000,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.position.z = 6;
    mesh.position.y = 406; // Half of 844 - half of 32

    return mesh;
  }

  /**
   * Setup lighting for 3D effect
   */
  private setupLighting(): void {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light for shadows and highlights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(200, 200, 400);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 2000;
    directionalLight.shadow.camera.left = -500;
    directionalLight.shadow.camera.right = 500;
    directionalLight.shadow.camera.top = 500;
    directionalLight.shadow.camera.bottom = -500;

    this.scene.add(directionalLight);
  }

  /**
   * Load screenshot texture onto screen mesh
   */
  public loadScreenshot(canvas: HTMLCanvasElement): void {
    // Create texture from canvas
    this.screenTexture = new THREE.CanvasTexture(canvas);
    this.screenTexture.minFilter = THREE.LinearFilter;
    this.screenTexture.magFilter = THREE.LinearFilter;

    if (this.screenMesh.material instanceof THREE.MeshPhongMaterial) {
      this.screenMesh.material.map = this.screenTexture;
      this.screenMesh.material.needsUpdate = true;
    }
  }

  /**
   * Update device transform from keyframe data
   */
  public setDeviceTransform(transform: DeviceTransform): void {
    // Apply position
    this.deviceGroup.position.x = transform.position.x;
    this.deviceGroup.position.y = transform.position.y;
    this.deviceGroup.position.z = transform.position.z;

    // Apply rotation (convert degrees to radians)
    this.deviceGroup.rotation.x = THREE.MathUtils.degToRad(transform.rotation.x);
    this.deviceGroup.rotation.y = THREE.MathUtils.degToRad(transform.rotation.y);
    this.deviceGroup.rotation.z = THREE.MathUtils.degToRad(transform.rotation.z);

    // Apply scale
    this.deviceGroup.scale.x = transform.scale.x;
    this.deviceGroup.scale.y = transform.scale.y;
    this.deviceGroup.scale.z = transform.scale.z;

    // Apply opacity
    this.deviceGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            if ('opacity' in mat) {
              mat.opacity = transform.opacity;
              mat.transparent = transform.opacity < 1;
            }
          });
        } else if ('opacity' in child.material) {
          child.material.opacity = transform.opacity;
          child.material.transparent = transform.opacity < 1;
        }
      }
    });
  }

  /**
   * Render the scene
   */
  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Handle canvas resize
   */
  public resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    this.geometry?.forEach((g) => g.dispose());
    this.materials?.forEach((mat) => mat.dispose());
    this.screenTexture?.dispose();
    this.renderer.dispose();
  }

  /**
   * Get the renderer's canvas
   */
  public getCanvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  /**
   * Get the scene
   */
  public getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * Helper to clean up resources
   */
  private get geometry() {
    const geometries: THREE.BufferGeometry[] = [];
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        geometries.push(obj.geometry);
      }
    });
    return geometries;
  }

  /**
   * Helper to get all materials
   */
  private get materials() {
    const materials: THREE.Material[] = [];
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        if (Array.isArray(obj.material)) {
          materials.push(...obj.material);
        } else {
          materials.push(obj.material);
        }
      }
    });
    return materials;
  }
}
