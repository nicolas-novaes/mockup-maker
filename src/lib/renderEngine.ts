import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { Device, BackgroundConfig } from './types';
import { getPhoneModelData } from './phoneModels';

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
 * Three.js RenderEngine para renderizar modelos 3D
 */
export class RenderEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private canvas: HTMLCanvasElement;

  private phoneContainer: THREE.Group;
  private screenMesh: THREE.Mesh | null = null;

  private isDragging = false;
  private isMiddleDragging = false;
  private isTwoFingerDragging = false;
  private activeTouches: Map<number, { x: number; y: number }> = new Map();
  private previousMousePosition = { x: 0, y: 0 };
  private cameraRotation = { alpha: 0, beta: 0 };
  private cameraTarget = { x: 0, y: 0, z: 0 };
  private isSpaceDown = false;
  private initialCameraDistance = 0;
  private currentCameraDistance = 0;
  private isLoading = false;
  private animationFrameId: number | null = null;

  private pendingScreenshotCanvas: HTMLCanvasElement | null = null;
  private currentScreenshotDataURL: string | null = null;
  private currentDevice: Device | null = null;
  private debugMode = false;

  private userScreenRotation = 0;
  private userScreenFlip = false;
  private directionalLight: THREE.DirectionalLight | null = null;
  private pointLight: THREE.PointLight | null = null;
  private shadowGroundPlane: THREE.Mesh | null = null;
  private abortController = new AbortController();

  constructor(canvas: HTMLCanvasElement, _options: RenderEngineOptions = {}) {
    console.log('%c[RenderEngine] Constructor called', 'color: blue; font-weight: bold;');
    this.canvas = canvas;

    const width = canvas.clientWidth || 800;
    const height = canvas.clientHeight || 600;

    // Criar renderer Three.js
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x08080c, 1.0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    console.log('Renderer created, size:', width, 'x', height);

    // Criar scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x08080c);

    // Criar camera
    const fov = 75;
    const aspect = width / height;
    const near = 0.1;
    const far = 10000;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(0, 0, 500);
    this.camera.lookAt(0, 0, 0);

    // Container para o phone
    this.phoneContainer = new THREE.Group();
    this.phoneContainer.name = 'phoneContainer';
    this.scene.add(this.phoneContainer);

    // Setup lighting
    this.setupLighting();

    // Setup mouse interaction
    this.setupMouseInteraction();

    // Setup debug mode (click meshes to identify them)
    this.setupDebugMode();

    // Handle resize
    window.addEventListener('resize', () => this.handleResize(), { signal: this.abortController.signal });

    // Iniciar render loop
    this.startRenderLoop();

    console.log('RenderEngine initialized successfully');
  }

  /**
   * Setup lighting
   */
  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    // Directional light
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.directionalLight.position.set(600, 600, 600);
    this.directionalLight.target.position.set(0, 0, 0);
    this.scene.add(this.directionalLight);
    this.scene.add(this.directionalLight.target);

    // Point light para fill
    this.pointLight = new THREE.PointLight(0xffffff, 0.8);
    this.pointLight.position.set(-300, -300, 300);
    this.scene.add(this.pointLight);

    // Shadow setup
    this.setupShadow();

    console.log('Lighting setup complete');
  }

  /**
   * Set light position using spherical coordinates
   * @param azimuth - horizontal angle in degrees (0-360)
   * @param elevation - vertical angle in degrees (0-90)
   * @param distance - distance from origin (default 400)
   */
  public setLightPosition(azimuth: number, elevation: number, distance = 800): void {
    const azRad = (azimuth * Math.PI) / 180;
    const elRad = (elevation * Math.PI) / 180;

    const x = distance * Math.cos(elRad) * Math.sin(azRad);
    const y = distance * Math.sin(elRad);
    const z = distance * Math.cos(elRad) * Math.cos(azRad);

    if (this.directionalLight) {
      this.directionalLight.position.set(x, y, z);
    }

    // Fill light at opposite position (softer)
    if (this.pointLight) {
      this.pointLight.position.set(-x * 0.7, -y * 0.5, z * 0.8);
    }

  }

  /**
   * Set directional light intensity
   */
  public setLightIntensity(intensity: number): void {
    if (this.directionalLight) {
      this.directionalLight.intensity = intensity;
    }
  }

  /**
   * Set user screenshot transform (rotation + flip) and re-apply
   */
  public setScreenshotTransform(rotation: number, flipped: boolean): void {
    this.userScreenRotation = rotation;
    this.userScreenFlip = flipped;
    if (this.currentScreenshotDataURL) {
      this.loadScreenshotFromDataURL(this.currentScreenshotDataURL);
    }
  }

  public setShadowEnabled(enabled: boolean): void {
    if (this.shadowGroundPlane) {
      this.shadowGroundPlane.visible = enabled;
    }
    if (this.directionalLight) {
      this.directionalLight.castShadow = enabled;
    }
  }

  /**
   * Set scene background
   */
  public setBackground(config: BackgroundConfig): void {
    switch (config.type) {
      case 'solid': {
        const color = new THREE.Color(config.color);
        this.scene.background = color;
        this.renderer.setClearColor(color, 1);
        break;
      }
      case 'gradient': {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;

        let gradient: CanvasGradient;
        if (config.gradientType === 'radial') {
          const cx = config.centerX * canvas.width;
          const cy = config.centerY * canvas.height;
          const radius = Math.max(canvas.width, canvas.height) * 0.7;
          gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        } else {
          const angleRad = (config.angle * Math.PI) / 180;
          const x1 = 0.5 - Math.sin(angleRad) * 0.5;
          const y1 = 0.5 - Math.cos(angleRad) * 0.5;
          const x2 = 0.5 + Math.sin(angleRad) * 0.5;
          const y2 = 0.5 + Math.cos(angleRad) * 0.5;
          gradient = ctx.createLinearGradient(
            x1 * canvas.width, y1 * canvas.height,
            x2 * canvas.width, y2 * canvas.height
          );
        }
        gradient.addColorStop(0, config.colorStart);
        gradient.addColorStop(1, config.colorEnd);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        this.scene.background = texture;
        this.renderer.setClearColor(0x000000, 1);
        break;
      }
      case 'image': {
        const img = new Image();
        img.onload = () => {
          const texture = new THREE.Texture(img);
          texture.needsUpdate = true;
          texture.colorSpace = THREE.SRGBColorSpace;
          this.scene.background = texture;
          this.renderer.setClearColor(0x000000, 1);
        };
        img.src = config.dataURL;
        break;
      }
      case 'transparent': {
        this.scene.background = null;
        this.renderer.setClearColor(0x000000, 0);
        break;
      }
    }
  }

  /**
   * Carrega um device e sua geometria 3D
   */
  private loadResolve: (() => void) | null = null;

  public loadDevice(device: Device): Promise<void> {
    console.log('%c=== LOADING DEVICE ===', 'color: blue; font-weight: bold;');
    console.log('Device ID:', device.id);
    console.log('Device Name:', device.name);
    console.log('Model URL:', device.modelUrl);

    // Reset screen mesh reference and store current device
    this.screenMesh = null;
    this.currentDevice = device;

    // Limpar meshes antigos
    while (this.phoneContainer.children.length > 0) {
      const child = this.phoneContainer.children[0];
      this.phoneContainer.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    }

    // Resetar câmera
    this.cameraRotation.alpha = 0;
    this.cameraRotation.beta = 0;

    // Tentar carregar modelo GLTF
    if (device.modelUrl) {
      console.log('%c→ Loading GLTF model...', 'color: green;');
      return new Promise<void>((resolve) => {
        this.loadResolve = resolve;
        this.loadGLTFModel(device);
      });
    } else {
      console.log('%c→ Using procedural geometry', 'color: orange;');
      this.createPhoneGeometry(device);
      this.setupCameraForDevice(device);

      // Apply pending screenshot if available
      if (this.pendingScreenshotCanvas) {
        console.log('[RenderEngine] Applying pending screenshot after procedural geometry');
        this.loadScreenshot(this.pendingScreenshotCanvas);
      }
      return Promise.resolve();
    }
  }

  /**
   * Carrega modelo GLTF
   */
  private loadGLTFModel(device: Device): void {
    if (!device.modelUrl) {
      console.log('No modelUrl provided, using procedural geometry');
      this.createPhoneGeometry(device);
      this.setupCameraForDevice(device);
      return;
    }

    const baseUrl = import.meta.env.BASE_URL;
    const modelPath = `${baseUrl}${device.modelUrl.startsWith('/') ? device.modelUrl.slice(1) : device.modelUrl}`;
    console.log('Attempting to load GLTF model from:', modelPath);

    this.isLoading = true;
    const loader = new GLTFLoader();

    loader.load(
      modelPath,
      (gltf) => {
        this.isLoading = false;
        console.log('✓ GLTF model loaded successfully. Meshes:', gltf.scene.children.length);

        // Adicionar modelo à scene
        this.phoneContainer.add(gltf.scene);


        // Apply initial rotation to standardize model orientation
        if (device.initialRotation) {
          gltf.scene.rotation.set(device.initialRotation.x, device.initialRotation.y, device.initialRotation.z);
        }


        // Recursively find all meshes in the scene
        const meshes: THREE.Mesh[] = [];
        const findMeshes = (object: THREE.Object3D) => {
          if (object instanceof THREE.Mesh) {
            meshes.push(object);
          }
          object.children.forEach(child => findMeshes(child));
        };
        findMeshes(gltf.scene);

        console.log('Found meshes (recursive):', meshes.length);
        meshes.forEach((mesh, idx) => {
          const bbox = new THREE.Box3().setFromObject(mesh);
          const size = bbox.getSize(new THREE.Vector3());
          const area = size.x * size.y;
          console.log(`  [${idx}] "${mesh.name}" - material: ${(mesh.material as any)?.constructor.name}, area: ${area.toFixed(0)}, z: ${mesh.position.z.toFixed(2)}`);
        });

        // Strategy 1a: Check if device specifies screenMeshName
        if (device.screenMeshName) {
          const namedMesh = meshes.find(m => m.name === device.screenMeshName);
          if (namedMesh) {
            this.screenMesh = namedMesh;
            console.log('[Strategy 1a] Found screen mesh by device.screenMeshName:', namedMesh.name);
          }
        }

        // Strategy 1b: Check if device specifies screenMaterialName
        if (!this.screenMesh && device.screenMaterialName) {
          console.log('[Strategy 1b] Searching for material:', device.screenMaterialName);
          console.log('[Strategy 1b] Available materials:', meshes.map(m => {
            const mat = m.material as any;
            if (Array.isArray(mat)) return mat.map((mt: any) => mt.name);
            return mat?.name;
          }));
          const meshByMat = meshes.find(m => {
            const mat = m.material as any;
            if (Array.isArray(mat)) {
              return mat.some((mt: any) => mt.name === device.screenMaterialName);
            }
            return mat?.name === device.screenMaterialName;
          });
          if (meshByMat) {
            this.screenMesh = meshByMat;
            console.log('[Strategy 1b] Found screen mesh by device.screenMaterialName:', meshByMat.name);
          } else {
            console.warn('[Strategy 1b] No mesh found with material name:', device.screenMaterialName);
          }
        }

        // Strategy 2: Look for keywords in mesh name
        if (!this.screenMesh) {
          const screenByName = meshes.find(m =>
            (m.name || '').toLowerCase().includes('screen') ||
            (m.name || '').toLowerCase().includes('display') ||
            (m.name || '').toLowerCase().includes('lcd') ||
            (m.name || '').toLowerCase().includes('face') ||
            (m.name || '').toLowerCase().includes('glass')
          );
          if (screenByName) {
            this.screenMesh = screenByName;
            console.log('[Strategy 2] Found screen mesh by name keyword:', screenByName.name);
          }
        }

        // Strategy 3: Look for mesh with most "screen-like" properties
        if (!this.screenMesh && meshes.length > 0) {
          const meshWithMetrics = meshes.map(mesh => {
            const bbox = new THREE.Box3().setFromObject(mesh);
            const size = bbox.getSize(new THREE.Vector3());
            const center = bbox.getCenter(new THREE.Vector3());
            const area = size.x * size.y;

            // Get material properties for color analysis
            let materialColor = null;
            let isWhiteOrDark = false;
            if (mesh.material && !Array.isArray(mesh.material)) {
              const mat = mesh.material as any;
              // Check material color
              if (mat.color) {
                materialColor = mat.color;
                // Check if color is white, light gray, dark gray, or black (typical for displays)
                const r = materialColor.r ?? 0;
                const g = materialColor.g ?? 0;
                const b = materialColor.b ?? 0;
                // White, light gray (>0.7), dark gray/black (<0.3)
                const brightness = (r + g + b) / 3;
                isWhiteOrDark = brightness > 0.7 || brightness < 0.3;
              }
            }

            // Calculate "screenness" score
            let score = 0;

            // MOST IMPORTANT: Screen is the mesh with largest surface area among thin meshes
            // Filter: only consider meshes that are planar (z < 1.5)
            if (size.z < 1.5) {
              // Surface area is the primary discriminator
              score += Math.min(50, area / 2); // Larger surface = higher score

              // BONUS: Material is white or dark (typical display color)
              if (isWhiteOrDark) score += 25;

              // Prefer meshes that are not too thin (z > 0.1 usually means glass/display, not a border)
              if (size.z > 0.1) score += 20;
              if (size.z > 0.5) score += 15;

              // Screen is centered horizontally
              score += Math.max(0, 15 - Math.abs(center.x));

              // Screen is centered vertically
              score += Math.max(0, 15 - Math.abs(center.y));

              // Prefer meshes closer to front (positive Z)
              if (center.z > 0) score += Math.min(5, center.z);
            }

            return { mesh, score, size, center, area, materialColor, isWhiteOrDark };
          });

          // Sort by score, then by lightness (more white/clear = screen), then by thickness, then by area
          meshWithMetrics.sort((a, b) => {
            if (Math.abs(b.score - a.score) > 0.1) {
              return b.score - a.score; // Different scores
            } else {
              // Same score: prefer lighter/whiter colors (screens are usually light/white)
              let aBrightness = 999;
              let bBrightness = 999;
              if (a.materialColor) {
                aBrightness = (a.materialColor.r + a.materialColor.g + a.materialColor.b) / 3;
              }
              if (b.materialColor) {
                bBrightness = (b.materialColor.r + b.materialColor.g + b.materialColor.b) / 3;
              }

              if (Math.abs(aBrightness - bBrightness) > 0.02) {
                return bBrightness - aBrightness; // LIGHTER is better (higher brightness = whiter)
              } else if (Math.abs(b.size.z - a.size.z) > 0.01) {
                return b.size.z - a.size.z; // Prefer thicker mesh (actual display)
              } else {
                return b.area - a.area; // Same lightness and thickness, prefer larger area
              }
            }
          });
          const bestMesh = meshWithMetrics[0];

          this.screenMesh = bestMesh.mesh;
          console.log(`[Strategy 3] Found screen mesh by heuristic: "${bestMesh.mesh.name}"`);
          console.log(`  - Size: ${bestMesh.size.x.toFixed(1)} x ${bestMesh.size.y.toFixed(1)} x ${bestMesh.size.z.toFixed(1)}`);
          console.log(`  - Center: ${bestMesh.center.x.toFixed(1)}, ${bestMesh.center.y.toFixed(1)}, ${bestMesh.center.z.toFixed(1)}`);
          console.log(`  - Area: ${bestMesh.area.toFixed(1)}`);
          console.log(`  - Score: ${bestMesh.score.toFixed(1)}`);

          console.log('Top 10 candidates (planar meshes only):');
          meshWithMetrics.slice(0, 10).forEach((item, idx) => {
            if (item.score > 0) {
              const colorStr = item.materialColor
                ? `rgb(${(item.materialColor.r * 255).toFixed(0)}, ${(item.materialColor.g * 255).toFixed(0)}, ${(item.materialColor.b * 255).toFixed(0)})`
                : 'unknown';
              console.log(
                `  ${idx + 1}. "${item.mesh.name}" - score: ${item.score.toFixed(1)}, ` +
                `color: ${colorStr} ${item.isWhiteOrDark ? '(WHITE/DARK ✓)' : '(colored)'}, ` +
                `size: ${item.size.x.toFixed(1)}x${item.size.y.toFixed(1)}x${item.size.z.toFixed(1)}, ` +
                `area: ${item.area.toFixed(1)}`
              );
            }
          });
        }

        // Calcular bounding box para ajustar câmera
        this.phoneContainer.updateMatrixWorld(true);
        const bbox = new THREE.Box3().setFromObject(this.phoneContainer);
        const size = bbox.getSize(new THREE.Vector3());
        const center = bbox.getCenter(new THREE.Vector3());

        console.log('Model size:', size);
        console.log('Model center:', center);

        // Centralizar modelo - offset the scene within the container
        // so the model center is at the container's local origin
        gltf.scene.position.sub(center);
        this.phoneContainer.position.set(0, 0, 0);

        // Calcular distância apropriada
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = this.camera.fov * (Math.PI / 180); // convert vertical fov to radians
        let cameraDistance = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraDistance *= 1.5; // adicionar margem

        console.log('Calculated camera distance:', cameraDistance);

        // Posicionar câmera
        this.camera.position.set(0, 0, cameraDistance);
        this.camera.lookAt(0, 0, 0);
        this.initialCameraDistance = cameraDistance;
        this.currentCameraDistance = cameraDistance;

        // Atualizar near/far planes
        this.camera.near = cameraDistance / 100;
        this.camera.far = cameraDistance * 100;
        this.camera.updateProjectionMatrix();

        console.log('Device loaded successfully');

        // Export mesh info for debugging (copy the JSON from console)
        this.exportMeshInfo();

        // Re-apply screenshot after device switch (delay one frame so matrices are updated)
        requestAnimationFrame(() => {
          if (this.currentScreenshotDataURL) {
            console.log('[RenderEngine] Re-applying screenshot after device load');
            this.loadScreenshotFromDataURL(this.currentScreenshotDataURL);
          } else if (this.pendingScreenshotCanvas) {
            console.log('[RenderEngine] Applying pending screenshot canvas after device load');
            this.loadScreenshot(this.pendingScreenshotCanvas);
          }
        });

        if (this.loadResolve) {
          this.loadResolve();
          this.loadResolve = null;
        }
      },
      (progress) => {
        if (progress.total > 0) {
          const percentComplete = (progress.loaded / progress.total) * 100;
          console.log('GLTF loading progress:', Math.round(percentComplete) + '%');
        }
      },
      (error: unknown) => {
        this.isLoading = false;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('✗ Failed to load GLTF model:', errorMessage);
        console.log('%cFalling back to procedural geometry', 'color: orange; font-weight: bold;');

        this.createPhoneGeometry(device);
        this.setupCameraForDevice(device);

        // Apply pending screenshot if available
        if (this.pendingScreenshotCanvas) {
          console.log('[RenderEngine] Applying pending screenshot after fallback geometry');
          this.loadScreenshot(this.pendingScreenshotCanvas);
        }

        if (this.loadResolve) {
          this.loadResolve();
          this.loadResolve = null;
        }
      }
    );
  }

  /**
   * Configurar câmera para o device
   */
  private setupCameraForDevice(device: Device): void {
    const halfWidth = device.width / 2;
    const halfHeight = device.height / 2;
    const distance = Math.max(halfWidth, halfHeight) * 2.5;

    console.log('Setting camera distance to:', distance);
    this.cameraTarget = { x: 0, y: 0, z: 0 };
    this.camera.position.set(0, 0, distance);
    this.camera.lookAt(0, 0, 0);
    this.initialCameraDistance = distance;
    this.currentCameraDistance = distance;


    console.log('Device setup complete. Phone container meshes:', this.phoneContainer.children.length);
  }

  /**
   * Cria geometria 3D procedural do smartphone (fallback)
   */
  private createPhoneGeometry(device: Device): void {
    console.log('Creating procedural phone geometry for:', device.name);

    const modelData = getPhoneModelData(device.id);

    const modelWidth = modelData?.width || device.width;
    const modelHeight = modelData?.height || device.height;
    const bodyColor = modelData?.bodyColor || { r: 0.15, g: 0.15, b: 0.15 };
    const cornerRadius = device.cornerRadius / 4;

    // Corpo principal
    const bodyGeometry = new THREE.BoxGeometry(
      modelWidth - cornerRadius * 2,
      modelHeight - cornerRadius * 2,
      14
    );

    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(bodyColor.r, bodyColor.g, bodyColor.b),
      shininess: 100,
      emissive: new THREE.Color(bodyColor.r, bodyColor.g, bodyColor.b),
    });

    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bodyMesh.position.z = -8;
    this.phoneContainer.add(bodyMesh);

    // Tela (plano branco)
    const screenGeometry = new THREE.PlaneGeometry(modelWidth, modelHeight);
    const screenMaterial = new THREE.MeshPhongMaterial({
      color: 0x222222,
      emissive: 0x111111,
    });
    const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
    screenMesh.position.z = 8;
    this.phoneContainer.add(screenMesh);
    this.screenMesh = screenMesh;

    console.log('Procedural geometry created');
  }

  /**
   * Setup mouse interaction
   */
  private setupMouseInteraction(): void {
    const signal = this.abortController.signal;

    this.canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') {
        this.activeTouches.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (this.activeTouches.size === 2) {
          this.isTwoFingerDragging = true;
          this.isDragging = false;
        } else if (this.activeTouches.size === 1) {
          this.isDragging = true;
        }
      } else if (e.button === 1) {
        // Middle mouse button: rotate model
        e.preventDefault();
        this.isMiddleDragging = true;
      } else {
        this.isDragging = true;
      }
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }, { signal });

    // Prevent default middle-click behavior (auto-scroll)
    this.canvas.addEventListener('auxclick', (e) => {
      if (e.button === 1) e.preventDefault();
    }, { signal });

    this.canvas.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') {
        this.activeTouches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      if (!this.isDragging && !this.isMiddleDragging && !this.isTwoFingerDragging) return;

      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      if (this.isMiddleDragging || this.isTwoFingerDragging) {
        // Rotate model on its own axis
        this.phoneContainer.rotation.y += deltaX * 0.01;
        this.phoneContainer.rotation.x += deltaY * 0.01;
      } else if (this.isSpaceDown) {
        // Pan mode: move camera target
        const distance = this.camera.position.distanceTo(
          new THREE.Vector3(this.cameraTarget.x, this.cameraTarget.y, this.cameraTarget.z)
        );
        const panSpeed = distance * 0.002;
        const right = new THREE.Vector3();
        const up = new THREE.Vector3();
        this.camera.getWorldDirection(new THREE.Vector3());
        right.setFromMatrixColumn(this.camera.matrixWorld, 0);
        up.setFromMatrixColumn(this.camera.matrixWorld, 1);

        this.cameraTarget.x -= right.x * deltaX * panSpeed + up.x * -deltaY * panSpeed;
        this.cameraTarget.y -= right.y * deltaX * panSpeed + up.y * -deltaY * panSpeed;
        this.cameraTarget.z -= right.z * deltaX * panSpeed + up.z * -deltaY * panSpeed;

        this.updateCameraPosition();
      } else {
        // Rotate mode
        this.cameraRotation.alpha -= deltaX * 0.01;
        this.cameraRotation.beta += deltaY * 0.01;

        // Limitar rotação vertical
        this.cameraRotation.beta = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.cameraRotation.beta));

        this.updateCameraPosition();
      }

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }, { signal });

    this.canvas.addEventListener('pointerup', (e) => {
      this.isDragging = false;
      this.isMiddleDragging = false;
      this.activeTouches.delete(e.pointerId);
      if (this.activeTouches.size < 2) {
        this.isTwoFingerDragging = false;
      }
    }, { signal });

    this.canvas.addEventListener('pointerleave', (e) => {
      this.isDragging = false;
      this.isMiddleDragging = false;
      this.activeTouches.delete(e.pointerId);
      if (this.activeTouches.size < 2) {
        this.isTwoFingerDragging = false;
      }
    }, { signal });

    // Zoom with scroll/pinch
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      // Skip zoom if device hasn't loaded yet (initialCameraDistance not set)
      if (!this.initialCameraDistance) return;

      const zoomSpeed = 0.1;
      const target = new THREE.Vector3(this.cameraTarget.x, this.cameraTarget.y, this.cameraTarget.z);
      const distance = this.camera.position.distanceTo(target);
      const delta = e.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;
      let newDistance = distance * delta;

      // Limit zoom range: initial position is max zoom out, user can only zoom in
      const minDistance = this.initialCameraDistance * 0.1;
      const maxDistance = this.initialCameraDistance;
      newDistance = Math.max(minDistance, Math.min(maxDistance, newDistance));

      if (Math.abs(newDistance - distance) < 0.01) return;

      this.currentCameraDistance = newDistance;
      const direction = new THREE.Vector3();
      direction.subVectors(this.camera.position, target).normalize();
      this.camera.position.copy(target).addScaledVector(direction, newDistance);
    }, { passive: false, signal });

    // Keyboard: space for pan, X for reset
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.isSpaceDown = true;
      }
      if (e.code === 'KeyX') {
        this.resetCamera();
      }
    }, { signal });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.isSpaceDown = false;
      }
    }, { signal });
  }

  /**
   * Reset camera to initial position
   */
  public resetCamera(): void {
    this.cameraRotation.alpha = 0;
    this.cameraRotation.beta = 0;
    this.cameraTarget = { x: 0, y: 0, z: 0 };
    this.phoneContainer.rotation.set(0, 0, 0);
    this.currentCameraDistance = this.initialCameraDistance;
    this.camera.position.set(0, 0, this.initialCameraDistance);
    this.camera.lookAt(0, 0, 0);
  }

  /**
   * Apply a camera preset (camera rotation + model rotation)
   */
  public applyPreset(preset: { cameraAlpha: number; cameraBeta: number; modelRotationX: number; modelRotationY: number; modelRotationZ: number }): void {
    this.cameraRotation.alpha = preset.cameraAlpha;
    this.cameraRotation.beta = preset.cameraBeta;
    this.cameraTarget = { x: 0, y: 0, z: 0 };
    this.phoneContainer.rotation.set(preset.modelRotationX, preset.modelRotationY, preset.modelRotationZ);
    this.updateCameraPosition();
  }

  /**
   * Atualiza posição da câmera baseado em rotação
   */
  private updateCameraPosition(): void {
    const target = new THREE.Vector3(this.cameraTarget.x, this.cameraTarget.y, this.cameraTarget.z);
    const distance = this.currentCameraDistance || this.camera.position.distanceTo(target);

    const x = Math.sin(this.cameraRotation.alpha) * Math.cos(this.cameraRotation.beta) * distance;
    const y = Math.sin(this.cameraRotation.beta) * distance;
    const z = Math.cos(this.cameraRotation.alpha) * Math.cos(this.cameraRotation.beta) * distance;

    this.camera.position.set(
      this.cameraTarget.x + x,
      this.cameraTarget.y + y,
      this.cameraTarget.z + z
    );
    this.camera.lookAt(target);
  }

  /**
   * Iniciar render loop
   */
  private startRenderLoop(): void {
    const render = () => {
      this.updateShadow();
      this.renderer.render(this.scene, this.camera);
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
    console.log('Render loop started');
  }

  private setupShadow(): void {
    // Configure directional light for shadow casting
    if (this.directionalLight) {
      this.directionalLight.castShadow = true;
      this.directionalLight.shadow.mapSize.width = 2048;
      this.directionalLight.shadow.mapSize.height = 2048;
      this.directionalLight.shadow.bias = -0.001;
      this.directionalLight.shadow.normalBias = 0.02;
      this.directionalLight.shadow.radius = 4;
      // Initial frustum (will be updated dynamically)
      this.directionalLight.shadow.camera.left = -500;
      this.directionalLight.shadow.camera.right = 500;
      this.directionalLight.shadow.camera.top = 500;
      this.directionalLight.shadow.camera.bottom = -500;
      this.directionalLight.shadow.camera.near = 0.1;
      this.directionalLight.shadow.camera.far = 3000;
      this.directionalLight.shadow.camera.updateProjectionMatrix();
    }

    // Ground plane that receives shadows — large, positioned at y=0 initially
    const groundGeo = new THREE.PlaneGeometry(5000, 5000);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    this.shadowGroundPlane = new THREE.Mesh(groundGeo, groundMat);
    this.shadowGroundPlane.rotation.x = -Math.PI / 2;
    this.shadowGroundPlane.position.y = 0;
    this.shadowGroundPlane.receiveShadow = true;
    this.scene.add(this.shadowGroundPlane);
  }

  private updateShadow(): void {
    if (!this.shadowGroundPlane || !this.directionalLight) return;
    if (this.phoneContainer.children.length === 0) {
      this.shadowGroundPlane.visible = false;
      return;
    }
    this.shadowGroundPlane.visible = true;

    // Get model bounds
    this.phoneContainer.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(this.phoneContainer);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    // Enable castShadow on all model meshes
    this.phoneContainer.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
      }
    });

    // Position ground plane at model base
    this.shadowGroundPlane.position.y = box.min.y;

    // Point light target at model center so shadow camera looks at model
    this.directionalLight.target.position.set(center.x, center.y, center.z);
    this.directionalLight.target.updateMatrixWorld();

    // Configure shadow camera frustum based on light distance and model size
    const shadow = this.directionalLight.shadow;
    const lightDist = this.directionalLight.position.distanceTo(center);
    const frustumSize = maxDim * 2;
    shadow.camera.left = -frustumSize;
    shadow.camera.right = frustumSize;
    shadow.camera.top = frustumSize;
    shadow.camera.bottom = -frustumSize;
    shadow.camera.near = lightDist - maxDim * 2;
    shadow.camera.far = lightDist + maxDim * 2;
    shadow.camera.updateProjectionMatrix();

    // Shadow softness based on light elevation
    const lightDir = this.directionalLight.position.clone().normalize();
    const elevation = Math.max(0.1, lightDir.y);
    shadow.radius = 3 + (1 - elevation) * 5;

    // Shadow opacity based on intensity
    const mat = this.shadowGroundPlane.material as THREE.ShadowMaterial;
    mat.opacity = Math.min(0.4, this.directionalLight.intensity * 0.16);
  }

  /**
   * Handle resize (private)
   */
  private handleResize(): void {
    this.resize();
  }

  /**
   * Resize renderer and camera (public)
   */
  public resize(): void {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  /**
   * Set device transform (position, rotation, scale, opacity)
   */
  public setDeviceTransform(transform: DeviceTransform): void {
    if (this.phoneContainer) {
      this.phoneContainer.position.set(transform.position.x, transform.position.y, transform.position.z);
      this.phoneContainer.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
      this.phoneContainer.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
    }
  }

  /**
   * Load screenshot from a data URL, handling letterboxing to match mesh dimensions
   */
  public loadScreenshotFromDataURL(dataURL: string): void {
    // Always store the current screenshot so it can be re-applied on device switch
    this.currentScreenshotDataURL = dataURL;

    const img = new Image();
    img.onload = () => {
      console.log('[RenderEngine] Image loaded:', img.width, 'x', img.height);

      if (!this.screenMesh) {
        console.warn('[RenderEngine] No screenMesh available, storing as pending');
        return;
      }

      // Use device's known screen dimensions for aspect ratio (most reliable)
      const deviceW = this.currentDevice?.width || 440;
      const deviceH = this.currentDevice?.height || 956;
      const meshAspect = deviceW / deviceH;

      console.log('[RenderEngine] Using device aspect ratio:', meshAspect.toFixed(3), '(' + deviceW + 'x' + deviceH + ')');

      // Create canvas matching device screen aspect ratio
      const canvasWidth = 1024;
      const canvasHeight = Math.round(canvasWidth / meshAspect);

      const rotation = this.currentDevice?.screenRotation || 0;

      // Apply user rotation/flip to source image first
      const userRot = this.userScreenRotation;
      const userFlip = this.userScreenFlip;
      let srcImg: HTMLImageElement | HTMLCanvasElement = img;

      if (userRot !== 0 || userFlip) {
        const tmpCanvas = document.createElement('canvas');
        const isUserRotated90 = (userRot === 90 || userRot === 270);
        tmpCanvas.width = isUserRotated90 ? img.height : img.width;
        tmpCanvas.height = isUserRotated90 ? img.width : img.height;
        const tmpCtx = tmpCanvas.getContext('2d')!;
        tmpCtx.translate(tmpCanvas.width / 2, tmpCanvas.height / 2);
        if (userFlip) tmpCtx.scale(-1, 1);
        tmpCtx.rotate((userRot * Math.PI) / 180);
        tmpCtx.drawImage(img, -img.width / 2, -img.height / 2);
        srcImg = tmpCanvas as unknown as HTMLImageElement;
      }

      const canvas = document.createElement('canvas');

      if (rotation === 90 || rotation === 270) {
        // For 90° rotated UVs: the mesh reads the texture sideways
        // So we provide a landscape canvas with the image rotated 90°
        // The mesh's rotated UVs will then display it correctly as portrait
        const cW = canvasHeight; // swap: landscape canvas
        const cH = canvasWidth;
        canvas.width = cW;
        canvas.height = cH;

        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, cW, cH);

        // Rotate image 90° CW and draw it into the landscape canvas
        ctx.translate(cW / 2, cH / 2);
        ctx.rotate(rotation === 90 ? Math.PI / 2 : -Math.PI / 2);

        // After rotation, the drawing space is effectively portrait (cH x cW)
        const drawSpaceW = cH;
        const drawSpaceH = cW;
        const imgAspect = srcImg.width / srcImg.height;
        const spaceAspect = drawSpaceW / drawSpaceH;

        let drawWidth: number, drawHeight: number, offsetX = 0, offsetY = 0;
        if (imgAspect > spaceAspect) {
          drawWidth = drawSpaceW;
          drawHeight = drawSpaceW / imgAspect;
          offsetY = (drawSpaceH - drawHeight) / 2;
        } else {
          drawHeight = drawSpaceH;
          drawWidth = drawSpaceH * imgAspect;
          offsetX = (drawSpaceW - drawWidth) / 2;
        }

        ctx.drawImage(srcImg, -drawSpaceW / 2 + offsetX, -drawSpaceH / 2 + offsetY, drawWidth, drawHeight);
      } else {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const ctx = canvas.getContext('2d')!;

        // Flip canvas vertically: UV V=0 is at bottom, but canvas y=0 is at top
        // So we flip the canvas so the image top maps to high V values
        ctx.translate(0, canvasHeight);
        ctx.scale(1, -1);

        if (this.currentDevice?.screenFlipX) {
          ctx.translate(canvasWidth, 0);
          ctx.scale(-1, 1);
        }

        if (rotation === 180) {
          ctx.translate(canvasWidth, canvasHeight);
          ctx.rotate(Math.PI);
        }

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw image to fill the entire screen
        ctx.drawImage(srcImg, 0, 0, canvasWidth, canvasHeight);
      }

      console.log('[RenderEngine] Canvas ready, rotation:', rotation);

      this.applyTextureFromCanvas(canvas);
    };
    img.src = dataURL;
  }

  /**
   * Apply a canvas as texture to the screen mesh
   */
  private applyTextureFromCanvas(canvas: HTMLCanvasElement): void {
    if (!this.screenMesh) return;

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    texture.colorSpace = THREE.SRGBColorSpace;

    // Use flipY = false — we'll handle orientation via planar UV projection
    texture.flipY = false;

    // Replace mesh UVs with planar projection from geometry positions.
    // Auto-detects which plane the screen lies in (XY, XZ, or YZ).
    const geometry = this.screenMesh.geometry;
    const posAttr = geometry.getAttribute('position');
    if (posAttr) {
      // Ensure world matrices are up to date for the entire phone hierarchy
      this.phoneContainer.updateMatrixWorld(true);

      const worldMatrix = this.screenMesh.matrixWorld;
      const tempVec = new THREE.Vector3();

      // First pass: compute world-space bounds directly from vertices
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      let minZ = Infinity, maxZ = -Infinity;

      const worldPositions: { x: number; y: number; z: number }[] = [];
      for (let i = 0; i < posAttr.count; i++) {
        tempVec.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
        tempVec.applyMatrix4(worldMatrix);
        worldPositions.push({ x: tempVec.x, y: tempVec.y, z: tempVec.z });
        minX = Math.min(minX, tempVec.x); maxX = Math.max(maxX, tempVec.x);
        minY = Math.min(minY, tempVec.y); maxY = Math.max(maxY, tempVec.y);
        minZ = Math.min(minZ, tempVec.z); maxZ = Math.max(maxZ, tempVec.z);
      }

      const rangeX = maxX - minX;
      const rangeY = maxY - minY;
      const rangeZ = maxZ - minZ;

      // Find the two largest axes — those form the screen plane
      const axes = [
        { axis: 'x' as const, range: rangeX, min: minX },
        { axis: 'y' as const, range: rangeY, min: minY },
        { axis: 'z' as const, range: rangeZ, min: minZ },
      ].sort((a, b) => b.range - a.range);

      // axes[0] = largest (height), axes[1] = second (width), axes[2] = thickness
      const heightAxis = axes[0];
      const widthAxis = axes[1];

      console.log('[RenderEngine] Screen plane detected:', widthAxis.axis.toUpperCase(), '(width=' + widthAxis.range.toFixed(3) + ') x', heightAxis.axis.toUpperCase(), '(height=' + heightAxis.range.toFixed(3) + '). Thickness:', axes[2].axis.toUpperCase(), '(' + axes[2].range.toFixed(4) + ')');

      // Second pass: compute UVs from world positions
      const uvArray = new Float32Array(posAttr.count * 2);
      for (let i = 0; i < posAttr.count; i++) {
        const wp = worldPositions[i];
        const wCoord = wp[widthAxis.axis];
        const hCoord = wp[heightAxis.axis];

        const u = widthAxis.range > 0.0001 ? (wCoord - widthAxis.min) / widthAxis.range : 0.5;
        const v = heightAxis.range > 0.0001 ? (hCoord - heightAxis.min) / heightAxis.range : 0.5;
        uvArray[i * 2] = u;
        uvArray[i * 2 + 1] = v;
      }

      const newUvAttr = new THREE.BufferAttribute(uvArray, 2);
      geometry.setAttribute('uv', newUvAttr);
      console.log('[RenderEngine] Planar UVs applied (' + posAttr.count + ' vertices)');
    }

    const screenMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      toneMapped: false,
    });

    // Dispose old material
    const material = this.screenMesh.material;
    if (Array.isArray(material)) {
      material.forEach(mat => mat.dispose());
    } else if (material) {
      (material as THREE.Material).dispose();
    }

    this.screenMesh.material = screenMaterial;
    this.screenMesh.visible = true;

    // Hide any glass overlay meshes that darken the screen
    const meshes: THREE.Mesh[] = [];
    const findMeshes = (object: THREE.Object3D) => {
      if (object instanceof THREE.Mesh) meshes.push(object);
      object.children.forEach(child => findMeshes(child));
    };
    findMeshes(this.phoneContainer);

    meshes.forEach(m => {
      if (m === this.screenMesh) return;
      const mat = m.material as any;
      if (mat && !Array.isArray(mat) && mat.name &&
        (mat.name.includes('Glass') || mat.name.includes('glass'))) {
        m.visible = false;
      }
    });

    console.log('[RenderEngine] Screenshot texture applied successfully');
  }

  /**
   * Load screenshot texture onto screen mesh (legacy canvas method)
   */
  public loadScreenshot(canvas: HTMLCanvasElement): void {
    if (!this.screenMesh) {
      this.pendingScreenshotCanvas = canvas;
      return;
    }
    this.pendingScreenshotCanvas = null;
    this.applyTextureFromCanvas(canvas);
  }

  /**
   * Remove screenshot texture and restore original material
   */
  public clearScreenshotTexture(): void {
    this.currentScreenshotDataURL = null;
    this.pendingScreenshotCanvas = null;

    if (this.screenMesh) {
      const mat = this.screenMesh.material as THREE.MeshStandardMaterial;
      if (mat.map) {
        mat.map.dispose();
        mat.map = null;
        mat.needsUpdate = true;
      }
    }
    this.render();
  }

  /**
   * Render the scene
   */
  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Export the current scene as an image at the specified resolution
   */
  public exportImage(width: number, height: number, format: 'png' | 'jpeg', transparent = false): string {
    // Save original state using CSS dimensions (not pixel dimensions which include devicePixelRatio)
    const origCssWidth = this.canvas.clientWidth || this.canvas.width;
    const origCssHeight = this.canvas.clientHeight || this.canvas.height;
    const origBackground = this.scene.background;
    const origClearAlpha = this.renderer.getClearAlpha();
    const origCameraPos = this.camera.position.clone();
    const origCameraLookAt = new THREE.Vector3(this.cameraTarget.x, this.cameraTarget.y, this.cameraTarget.z);
    const origPixelRatio = this.renderer.getPixelRatio();

    // Force pixel ratio 1 for consistent export quality
    this.renderer.setPixelRatio(1);

    // Set up transparent background if requested
    if (transparent && format === 'png') {
      // Fit camera to model so it fills the frame at max quality
      this.fitCameraToModel(width / height);
      this.scene.background = null;
      this.renderer.setClearAlpha(0);
    }

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);

    let dataURL: string;

    if (transparent && format === 'png') {
      // Crop to content bounding box (model + shadow only)
      dataURL = this.cropTransparentExport(width, height);
    } else {
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      dataURL = this.renderer.domElement.toDataURL(mimeType, 0.95);
    }

    // Restore original state
    this.camera.position.copy(origCameraPos);
    this.camera.lookAt(origCameraLookAt);
    this.renderer.setPixelRatio(origPixelRatio);
    if (transparent && format === 'png') {
      this.scene.background = origBackground;
      this.renderer.setClearAlpha(origClearAlpha);
    }
    this.renderer.setSize(origCssWidth, origCssHeight);
    this.camera.aspect = origCssWidth / origCssHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);

    return dataURL;
  }

  /**
   * Position camera to fit the phone model tightly in the frame
   */
  private fitCameraToModel(aspect: number): void {
    // Compute bounding box of the phone model (excluding shadow ground plane)
    const box = new THREE.Box3();
    this.phoneContainer.traverse((child) => {
      if (child instanceof THREE.Mesh && child !== this.shadowGroundPlane) {
        box.expandByObject(child);
      }
    });

    if (box.isEmpty()) return;

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Use the diagonal of the bounding box to account for rotation
    const diagonal = Math.sqrt(size.x * size.x + size.y * size.y + size.z * size.z);
    const fov = this.camera.fov * (Math.PI / 180);

    // Calculate distance needed to fit the model with generous padding (40%)
    const padding = 1.4;
    let distance: number;
    if (aspect >= 1) {
      // Landscape: height is limiting
      distance = (diagonal * padding) / (2 * Math.tan(fov / 2));
    } else {
      // Portrait: width is limiting
      distance = (diagonal * padding) / (2 * Math.tan(fov / 2) * aspect);
    }

    // Move camera to the computed distance, keeping the same direction
    const target = new THREE.Vector3(this.cameraTarget.x, this.cameraTarget.y, this.cameraTarget.z);
    const direction = new THREE.Vector3().subVectors(this.camera.position, target).normalize();
    this.camera.position.copy(center).addScaledVector(direction, distance);
  }

  /**
   * Crop transparent export to the bounding box of visible pixels (model + shadow)
   */
  private cropTransparentExport(width: number, height: number): string {
    const ctx = document.createElement('canvas').getContext('2d')!;
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    ctx.drawImage(this.renderer.domElement, 0, 0);

    const imageData = ctx.getImageData(0, 0, width, height);
    const { data } = imageData;

    // Find bounding box of non-transparent pixels
    let minX = width, minY = height, maxX = 0, maxY = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 0) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // If no visible pixels, return full canvas
    if (maxX < minX || maxY < minY) {
      return this.renderer.domElement.toDataURL('image/png');
    }

    // Add small padding (2% of the crop dimensions)
    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;
    const padX = Math.round(cropW * 0.02);
    const padY = Math.round(cropH * 0.02);

    const x0 = Math.max(0, minX - padX);
    const y0 = Math.max(0, minY - padY);
    const x1 = Math.min(width, maxX + 1 + padX);
    const y1 = Math.min(height, maxY + 1 + padY);

    const finalW = x1 - x0;
    const finalH = y1 - y0;

    // Create cropped canvas
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = finalW;
    cropCanvas.height = finalH;
    const cropCtx = cropCanvas.getContext('2d')!;
    cropCtx.drawImage(ctx.canvas, x0, y0, finalW, finalH, 0, 0, finalW, finalH);

    return cropCanvas.toDataURL('image/png');
  }

  /**
   * Dispose
   */
  public dispose(): void {
    if (this.isLoading) {
      console.log('⏳ Still loading, delaying dispose...');
      setTimeout(() => this.dispose(), 100);
      return;
    }

    console.log('Disposing RenderEngine');

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.renderer.dispose();
    this.abortController.abort();
  }

  /**
   * Get scene
   */
  public getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * Setup debug mode: click on meshes to identify them
   */
  private setupDebugMode(): void {
    this.canvas.addEventListener('click', (event: MouseEvent) => {
      if (!this.debugMode) return;

      // Get click position
      const rect = this.canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Create ray caster
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);

      // Get all meshes
      const meshes: THREE.Mesh[] = [];
      const findMeshes = (object: THREE.Object3D) => {
        if (object instanceof THREE.Mesh) {
          meshes.push(object);
        }
        object.children.forEach(child => findMeshes(child));
      };
      findMeshes(this.phoneContainer);

      // Find intersections
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        const info = {
          name: clickedMesh.name,
          position: clickedMesh.position,
          color: (clickedMesh.material as any)?.color
        };

        const matName = (clickedMesh.material as any)?.name || 'unknown';
        console.log('🖱️ CLICKED MESH:', info.name);
        console.log('Material name:', matName);
        console.log('Color:', info.color ? `rgb(${Math.round(info.color.r * 255)}, ${Math.round(info.color.g * 255)}, ${Math.round(info.color.b * 255)})` : 'unknown');
        console.log('Use this material name in screenMaterialName!');

        // Highlight the mesh temporarily
        const originalColor = (clickedMesh.material as any)?.color?.clone();
        (clickedMesh.material as any).color.setHex(0xff0000); // Red highlight
        setTimeout(() => {
          if (originalColor) {
            (clickedMesh.material as any).color.copy(originalColor);
          }
        }, 200);
      }
    }, { signal: this.abortController.signal });

    // Debug mode can be enabled manually in console if needed
    // console.log('✅ DEBUG MODE READY - Click on the phone to identify meshes!');
  }

  /**
   * Debug: Export mesh information for manual inspection
   */
  public exportMeshInfo(): void {
    const meshes: THREE.Mesh[] = [];
    const findMeshes = (object: THREE.Object3D) => {
      if (object instanceof THREE.Mesh) {
        meshes.push(object);
      }
      object.children.forEach(child => findMeshes(child));
    };
    findMeshes(this.phoneContainer);

    const meshInfo = meshes.map(mesh => {
      const bbox = new THREE.Box3().setFromObject(mesh);
      const size = bbox.getSize(new THREE.Vector3());
      const center = bbox.getCenter(new THREE.Vector3());

      let color = null;
      if (mesh.material && !Array.isArray(mesh.material)) {
        const mat = mesh.material as any;
        if (mat.color) {
          color = {
            r: Math.round(mat.color.r * 255),
            g: Math.round(mat.color.g * 255),
            b: Math.round(mat.color.b * 255),
            rgb: `rgb(${Math.round(mat.color.r * 255)}, ${Math.round(mat.color.g * 255)}, ${Math.round(mat.color.b * 255)})`
          };
        }
      }

      return {
        name: mesh.name,
        size: {
          x: size.x.toFixed(2),
          y: size.y.toFixed(2),
          z: size.z.toFixed(2)
        },
        area: (size.x * size.y).toFixed(1),
        center: {
          x: center.x.toFixed(2),
          y: center.y.toFixed(2),
          z: center.z.toFixed(2)
        },
        color: color
      };
    });

    console.log('=== COMPLETE MESH INFORMATION ===');
    console.table(meshInfo);
    console.log('COPY THIS FOR REFERENCE:');
    console.log(JSON.stringify(meshInfo, null, 2));
  }
}
