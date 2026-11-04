import { useEffect, useRef, useState, type PointerEvent } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Rotate3d, Loader2 } from 'lucide-react';
import { useLang } from '../../lib/lang';

type WorldMode = 'both' | 'cats' | 'dogs';

interface BaladiPouch3DViewerProps {
  mode: WorldMode;
  isPaused?: boolean;
  className?: string;
}

export default function BaladiPouch3DViewer({
  mode,
  className = '',
}: BaladiPouch3DViewerProps) {
  const { lang } = useLang();
  const isRtl = lang === 'ar';
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [userRotated, setUserRotated] = useState(false);

  // Keep current mode in ref for 60fps render loop
  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Rotation physics & drag tracking
  const rotRef = useRef({ x: 0, y: 0 });
  const targetRotRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastRotOnDownRef = useRef({ x: 0, y: 0 });

  // 3D scene elements
  const catPouchRef = useRef<THREE.Group | null>(null);
  const dogPouchRef = useRef<THREE.Group | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const pointLightRef = useRef<THREE.PointLight | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth || 520;
    let height = container.clientHeight || 580;

    // 1. Scene & Camera
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 50);
    camera.position.set(0, 0, 4.3);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // 3. Studio Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.3);
    keyLight.position.set(-2.5, 3.5, 3.2);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdcf0ff, 1.4);
    fillLight.position.set(3.2, 1.2, 2.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.9);
    rimLight.position.set(0.5, 3.0, -2.8);
    scene.add(rimLight);

    const pointLight = new THREE.PointLight(0xfbbb21, 1.8, 6);
    pointLight.position.set(0, -1.2, 1.2);
    scene.add(pointLight);
    pointLightRef.current = pointLight;

    // 4. Interactive Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    rootGroupRef.current = rootGroup;

    // 5. Load Both Models in Parallel
    const loader = new GLTFLoader();
    let loaded = 0;
    const checkAllLoaded = () => {
      loaded++;
      if (loaded >= 2) {
        setIsLoading(false);
      }
    };

    // Load Cat GLB
    loader.load(
      '/brand/baladi_pouch_cat.glb',
      (gltf) => {
        const cat = gltf.scene;
        cat.scale.set(0.9, 0.9, 0.9);
        rootGroup.add(cat);
        catPouchRef.current = cat;
        checkAllLoaded();
      },
      undefined,
      (err) => {
        console.error('Cat GLB load error:', err);
        checkAllLoaded();
      }
    );

    // Load Dog GLB
    loader.load(
      '/brand/baladi_pouch_dog.glb',
      (gltf) => {
        const dog = gltf.scene;
        dog.scale.set(0.001, 0.001, 0.001);
        dog.position.set(2, 0, -1);
        dog.visible = false;
        rootGroup.add(dog);
        dogPouchRef.current = dog;
        checkAllLoaded();
      },
      undefined,
      (err) => {
        console.error('Dog GLB load error:', err);
        checkAllLoaded();
      }
    );

    // 6. Smooth Physics Render Loop
    let rafId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentMode = modeRef.current;

      // Smooth damp for rotation
      rotRef.current.x += (targetRotRef.current.x - rotRef.current.x) * 0.12;
      rotRef.current.y += (targetRotRef.current.y - rotRef.current.y) * 0.12;

      // Natural idle float
      const idleY = Math.sin(time * 1.6) * 0.04;
      const idleSway = Math.sin(time * 0.9) * 0.035;

      if (rootGroupRef.current) {
        rootGroupRef.current.position.y = idleY;
        rootGroupRef.current.rotation.x = rotRef.current.x;
        rootGroupRef.current.rotation.y =
          rotRef.current.y + (isDraggingRef.current ? 0 : idleSway);
      }

      // Smooth position & scale transitions between Cat and Dog
      const cat = catPouchRef.current;
      const dog = dogPouchRef.current;

      if (cat && dog) {
        if (currentMode === 'cats') {
          // Cat pouch centered & prominent
          cat.visible = true;
          cat.position.x += (0 - cat.position.x) * 0.12;
          cat.position.z += (0 - cat.position.z) * 0.12;
          cat.rotation.y += (0 - cat.rotation.y) * 0.12;
          cat.scale.lerp(new THREE.Vector3(0.95, 0.95, 0.95), 0.12);

          // Dog pouch hides
          dog.position.x += (2 - dog.position.x) * 0.12;
          dog.scale.lerp(new THREE.Vector3(0.001, 0.001, 0.001), 0.12);
          if (dog.scale.x < 0.05) dog.visible = false;
        } else if (currentMode === 'dogs') {
          // Dog pouch centered & prominent
          dog.visible = true;
          dog.position.x += (0 - dog.position.x) * 0.12;
          dog.position.z += (0 - dog.position.z) * 0.12;
          dog.rotation.y += (0 - dog.rotation.y) * 0.12;
          dog.scale.lerp(new THREE.Vector3(0.95, 0.95, 0.95), 0.12);

          // Cat pouch hides
          cat.position.x += (-2 - cat.position.x) * 0.12;
          cat.scale.lerp(new THREE.Vector3(0.001, 0.001, 0.001), 0.12);
          if (cat.scale.x < 0.05) cat.visible = false;
        } else {
          // DUO MODE: Both pouches standing side-by-side in full 3D!
          cat.visible = true;
          dog.visible = true;

          // Cat on left (slightly turned towards center)
          cat.position.x += (-0.62 - cat.position.x) * 0.12;
          cat.position.z += (0.05 - cat.position.z) * 0.12;
          cat.rotation.y += (0.22 - cat.rotation.y) * 0.12;
          cat.scale.lerp(new THREE.Vector3(0.82, 0.82, 0.82), 0.12);

          // Dog on right (slightly turned towards center)
          dog.position.x += (0.62 - dog.position.x) * 0.12;
          dog.position.z += (0.05 - dog.position.z) * 0.12;
          dog.rotation.y += (-0.22 - dog.rotation.y) * 0.12;
          dog.scale.lerp(new THREE.Vector3(0.82, 0.82, 0.82), 0.12);
        }
      }

      // Color lerp for accent light
      if (pointLightRef.current) {
        const hex =
          currentMode === 'cats'
            ? 0x1e996c
            : currentMode === 'dogs'
            ? 0xe84249
            : 0xfbbb21;
        pointLightRef.current.color.lerp(new THREE.Color(hex), 0.08);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize Observer
    const onResize = () => {
      if (!container || !renderer) return;
      width = container.clientWidth || 520;
      height = container.clientHeight || 580;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []); // Run setup once on mount

  // Pointer Drag Handler (Full 360-degree rotation)
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    lastRotOnDownRef.current = { ...targetRotRef.current };
    setUserRotated(true);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      const deltaX = (e.clientX - dragStartRef.current.x) * 0.009;
      const deltaY = (e.clientY - dragStartRef.current.y) * 0.009;

      targetRotRef.current.y = lastRotOnDownRef.current.y + deltaX;
      targetRotRef.current.x = Math.max(
        -0.45,
        Math.min(0.45, lastRotOnDownRef.current.x + deltaY)
      );
    } else {
      // Subtle tilt towards cursor when hovering
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        targetRotRef.current.x = -py * 0.28;
        targetRotRef.current.y = px * 0.42;
      }
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handlePointerLeave = () => {
    isDraggingRef.current = false;
    if (!userRotated) {
      targetRotRef.current.x = 0;
      targetRotRef.current.y = 0;
    }
  };

  const handleResetRotation = () => {
    targetRotRef.current.x = 0;
    targetRotRef.current.y = 0;
    setUserRotated(false);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      className={`relative flex h-[460px] sm:h-[520px] md:h-[580px] w-full max-w-[580px] items-center justify-center cursor-grab active:cursor-grabbing select-none ${className}`}
    >
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        className="h-full w-full object-contain filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.65)]"
      />

      {/* Loading state indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/40 backdrop-blur-xs rounded-3xl">
          <Loader2 className="h-9 w-9 animate-spin text-baladi-yellow" />
          <span className="text-xs font-black text-white tracking-wider">
            {isRtl ? 'جاري تحميل مجسم الـ 3D...' : 'Loading 3D model...'}
          </span>
        </div>
      )}

      {/* 3D Control Pill & Reset Button */}
      <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-2 pointer-events-none">
        <span className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/15 bg-ink/75 px-3 py-1 text-[11px] font-black text-cream backdrop-blur-md shadow-lg">
          <Rotate3d className="h-3.5 w-3.5 text-baladi-yellow" />
          <span>{isRtl ? 'اسحب لتدوير المجسم ٣٦٠°' : 'Drag to rotate 360°'}</span>
        </span>
        {userRotated && (
          <button
            type="button"
            onClick={handleResetRotation}
            className="pointer-events-auto rounded-full border border-white/15 bg-ink/75 px-2.5 py-1 text-[10.5px] font-black text-baladi-yellow hover:bg-white/15 backdrop-blur-md transition-colors"
          >
            {isRtl ? 'إعادة ضبط' : 'Reset'}
          </button>
        )}
      </div>
    </div>
  );
}
