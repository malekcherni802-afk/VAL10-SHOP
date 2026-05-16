import { useEffect, useRef, useState } from 'react';

export default function ProductViewer3D({ modelUrl }) {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!modelUrl || typeof window === 'undefined') return;

    let renderer, scene, camera, model, animId;
    let isMouseDown = false;
    let lastX = 0, lastY = 0;
    let autoRotate = true;

    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth;
    const H = mount.clientHeight;

    async function init() {
      try {
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');

        // Scene
        scene = new THREE.Scene();
        scene.background = null;

        // Camera
        camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
        camera.position.set(0, 0, 3);

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        mount.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
        keyLight.position.set(5, 5, 5);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xc0a060, 0.4);
        fillLight.position.set(-5, 0, -5);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xaaaaff, 0.3);
        rimLight.position.set(0, -5, -3);
        scene.add(rimLight);

        // Load model
        const loader = new GLTFLoader();
        loader.load(
          modelUrl,
          (gltf) => {
            model = gltf.scene;

            // Center and scale model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2 / maxDim;

            model.position.sub(center);
            model.scale.setScalar(scale);

            scene.add(model);
            setLoading(false);
          },
          undefined,
          (err) => {
            console.error('3D load error:', err);
            setError('Failed to load 3D model');
            setLoading(false);
          }
        );

        // Animation loop
        const animate = () => {
          animId = requestAnimationFrame(animate);
          if (model && autoRotate && !isMouseDown) {
            model.rotation.y += 0.005;
          }
          renderer.render(scene, camera);
        };
        animate();

        // Mouse controls
        const onDown = (e) => {
          isMouseDown = true;
          autoRotate = false;
          lastX = e.clientX || e.touches?.[0]?.clientX;
          lastY = e.clientY || e.touches?.[0]?.clientY;
          setIsDragging(true);
        };

        const onUp = () => {
          isMouseDown = false;
          setIsDragging(false);
          setTimeout(() => { autoRotate = true; }, 2000);
        };

        const onMove = (e) => {
          if (!isMouseDown || !model) return;
          const x = e.clientX || e.touches?.[0]?.clientX;
          const y = e.clientY || e.touches?.[0]?.clientY;
          const dx = (x - lastX) * 0.008;
          const dy = (y - lastY) * 0.008;
          model.rotation.y += dx;
          model.rotation.x += dy;
          lastX = x;
          lastY = y;
        };

        const onWheel = (e) => {
          e.preventDefault();
          camera.position.z = Math.max(1, Math.min(8, camera.position.z + e.deltaY * 0.005));
        };

        renderer.domElement.addEventListener('mousedown', onDown);
        renderer.domElement.addEventListener('touchstart', onDown);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('touchend', onUp);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('touchmove', onMove);
        renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

        // Resize
        const onResize = () => {
          if (!mount) return;
          const w = mount.clientWidth;
          const h = mount.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener('resize', onResize);

      } catch (err) {
        console.error('Three.js init error:', err);
        setError('3D viewer failed to initialize');
        setLoading(false);
      }
    }

    init();

    return () => {
      cancelAnimationFrame(animId);
      if (renderer) {
        renderer.dispose();
        if (mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement);
        }
      }
    };
  }, [modelUrl]);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent)',
          gap: 16,
        }}>
          <div style={{
            width: 40,
            height: 40,
            border: '1px solid rgba(192,160,96,0.3)',
            borderTop: '1px solid var(--accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <div style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
          }}>
            LOADING 3D MODEL
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(180,50,50,0.8)',
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1rem',
        }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: 'Cinzel, serif',
          fontSize: '0.6rem',
          letterSpacing: '0.2em',
          color: 'rgba(192,160,96,0.4)',
          pointerEvents: 'none',
        }}>
          DRAG TO ROTATE · SCROLL TO ZOOM
        </div>
      )}
    </div>
  );
}
