"use client";

import { useEffect, useRef, useState } from "react";
import { FiPause, FiPlay } from "react-icons/fi";

export type CelestialTradition = "chinese" | "western" | "vedic";

export default function CelestialScene({ tradition, compact = false }: {
  tradition?: CelestialTradition;
  compact?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let cancelled = false;
    let dispose = () => {};
    import("three").then((T) => {
      if (cancelled) return;
      let renderer: InstanceType<typeof T.WebGLRenderer>;
      try {
        renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
      } catch {
        setAvailable(false);
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = T.SRGBColorSpace;
      element.appendChild(renderer.domElement);
      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(34, 1, 0.1, 100);
      camera.position.z = 9;
      scene.add(new T.HemisphereLight(0xf4f7ff, 0x303136, 2.7));
      const key = new T.DirectionalLight(0xffffff, 4.5);
      key.position.set(-3, 5, 6);
      scene.add(key);
      const rim = new T.DirectionalLight(0xbddcff, 3);
      rim.position.set(4, -2, -3);
      scene.add(rim);
      const colors = { chinese: 0xef685b, western: 0x58a8ff, vedic: 0x52d5a0 };
      const kinds: CelestialTradition[] = tradition ? [tradition] : ["chinese", "western", "vedic"];
      const models = kinds.map((kind) => {
        const group = new T.Group();
        const metal = new T.MeshStandardMaterial({ color: colors[kind], metalness: 0.64, roughness: 0.3 });
        const silver = new T.MeshStandardMaterial({ color: 0xe4e5df, metalness: 0.75, roughness: 0.28 });
        const ring = (radius: number, tube: number, x = 0, y = 0, z = 0) => {
          const mesh = new T.Mesh(new T.TorusGeometry(radius, tube, 8, 112), metal);
          mesh.rotation.set(x, y, z);
          group.add(mesh);
          return mesh;
        };
        ring(1.36, 0.024);
        ring(1.44, 0.009);
        // Graduations give the objects the measured detail of celestial instruments.
        for (let i = 0; i < 72; i++) {
          const a = i / 72 * Math.PI * 2;
          const tick = new T.Mesh(new T.BoxGeometry(i % 6 === 0 ? 0.014 : 0.008, i % 6 === 0 ? 0.13 : 0.055, 0.018), silver);
          tick.position.set(Math.sin(a) * 1.29, Math.cos(a) * 1.29, 0);
          tick.rotation.z = -a;
          group.add(tick);
        }
        if (kind === "western") {
          ring(1.12, 0.028, Math.PI / 2.7, 0.3);
          ring(1.12, 0.022, 0.2, Math.PI / 2);
          ring(1.12, 0.015, -0.8, -0.6);
          const globe = new T.Mesh(new T.SphereGeometry(0.48, 40, 24), metal);
          group.add(globe);
          const meridians = new T.LineSegments(new T.WireframeGeometry(new T.SphereGeometry(0.495, 16, 8)), new T.LineBasicMaterial({ color: 0xc2e7ff, transparent: true, opacity: 0.35 }));
          group.add(meridians);
        } else if (kind === "chinese") {
          ring(0.95, 0.035, 0.2, 0.1);
          for (let i = 0; i < 8; i++) {
            const trigram = new T.Group();
            for (let row = 0; row < 3; row++) {
              const broken = (i >> row) & 1;
              for (let side = 0; side < (broken ? 2 : 1); side++) {
                const bar = new T.Mesh(new T.BoxGeometry(broken ? 0.13 : 0.34, 0.036, 0.045), metal);
                bar.position.set(broken ? (side === 0 ? -0.105 : 0.105) : 0, 0.63 + row * 0.085, 0.07);
                trigram.add(bar);
              }
            }
            trigram.rotation.z = i * Math.PI / 4;
            group.add(trigram);
          }
          const dark = new T.MeshStandardMaterial({ color: 0x24272b, metalness: 0.3, roughness: 0.4 });
          for (let i = 0; i < 2; i++) {
            const half = new T.Mesh(new T.SphereGeometry(0.4, 40, 24, i * Math.PI, Math.PI), i ? silver : dark);
            group.add(half);
            const dot = new T.Mesh(new T.SphereGeometry(0.07, 16, 12), i ? dark : silver);
            dot.position.set(0, i ? -0.2 : 0.2, 0.355);
            group.add(dot);
          }
        } else {
          for (let layer = 0; layer < 3; layer++) {
            for (let flip = 0; flip < 2; flip++) {
              const points = Array.from({ length: 4 }, (_, i) => {
                const a = i * Math.PI * 2 / 3 + Math.PI / 2 + flip * Math.PI;
                return new T.Vector3(Math.cos(a) * (1.02 - layer * 0.19), Math.sin(a) * (1.02 - layer * 0.19), (layer - 1) * 0.18);
              });
              for (let edge = 0; edge < 3; edge++) {
                group.add(new T.Mesh(new T.TubeGeometry(new T.LineCurve3(points[edge], points[edge + 1]), 1, 0.018, 6, false), metal));
              }
            }
          }
          group.add(new T.Mesh(new T.OctahedronGeometry(0.2), silver));
        }
        group.rotation.set(-0.16, -0.24, 0.12);
        scene.add(group);
        return group;
      });
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      const target = { x: 0, y: 0 };
      let visible = true;
      let frame = 0;
      let last = 0;
      let phase = 0;
      const resize = () => {
        const { width, height } = element.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        const halfHeight = 1.9;
        camera.position.z = halfHeight / Math.tan(17 * Math.PI / 180);
        const halfWidth = halfHeight * camera.aspect;
        const scale = Math.min(1, (halfWidth * 2 / models.length) / 3.3);
        models.forEach((model, i) => {
          model.scale.setScalar(scale);
          model.position.x = models.length === 1 ? 0 : ((i + 0.5) / models.length * 2 - 1) * halfWidth;
        });
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      };
      const render = (time: number) => {
        frame = requestAnimationFrame(render);
        if (!visible || document.hidden || time - last < 32) return;
        const dt = Math.min((time - last) / 1000, 0.05);
        last = time;
        if (!pausedRef.current && !media.matches) {
          phase += dt;
          models.forEach((model, i) => {
            model.rotation.y = -0.24 + Math.sin(phase * 0.18 + i) * 0.2 + target.x * 0.14;
            model.rotation.x = -0.16 + Math.cos(phase * 0.15 + i) * 0.07 + target.y * 0.1;
          });
        }
        renderer.render(scene, camera);
      };
      const pointer = (event: PointerEvent) => {
        const rect = element.getBoundingClientRect();
        target.x = (event.clientX - rect.left) / rect.width - 0.5;
        target.y = (event.clientY - rect.top) / rect.height - 0.5;
      };
      const reset = () => { target.x = 0; target.y = 0; };
      const observer = new ResizeObserver(resize);
      observer.observe(element);
      const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
      intersection.observe(element);
      element.addEventListener("pointermove", pointer);
      element.addEventListener("pointerleave", reset);
      resize();
      frame = requestAnimationFrame(render);
      dispose = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        intersection.disconnect();
        element.removeEventListener("pointermove", pointer);
        element.removeEventListener("pointerleave", reset);
        const materials = new Set<InstanceType<typeof T.Material>>();
        scene.traverse((object) => {
          if (object instanceof T.Mesh || object instanceof T.LineSegments) {
            object.geometry.dispose();
            (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => materials.add(m));
          }
        });
        materials.forEach(material => material.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    }).catch(() => { if (!cancelled) setAvailable(false); });
    return () => { cancelled = true; dispose(); };
  }, [tradition]);

  return <div className={`celestial-scene${compact ? " celestial-scene--compact" : ""}`} data-tradition={tradition ?? "all"}>
    <div ref={host} className="celestial-scene__canvas" aria-hidden="true" />
    {!available && <div className="celestial-scene__fallback" aria-hidden="true">{tradition === "chinese" ? "☯" : tradition === "vedic" ? "✧" : "☉"}</div>}
    {available && <button type="button" className="celestial-scene__pause" aria-label={paused ? "Retomar movimento" : "Pausar movimento"} title={paused ? "Retomar movimento" : "Pausar movimento"} aria-pressed={paused} onClick={() => { pausedRef.current = !paused; setPaused(!paused); }}>
      {paused ? <FiPlay /> : <FiPause />}
    </button>}
  </div>;
}
