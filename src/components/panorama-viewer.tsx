"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useI18n } from "./i18n-provider";
import { Expand, Rotate } from "./icons";

export function PanoramaViewer({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const { t } = useI18n();

  useEffect(() => {
    autoRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1100);
    camera.position.set(0, 0, 0.01);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.cursor = "grab";
    container.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(500, 64, 40);
    geometry.scale(-1, 1, 1);
    const material = new THREE.MeshBasicMaterial();
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    let lon = 0;
    let lat = 0;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLon = 0;
    let startLat = 0;
    let frame = 0;
    let last = performance.now();

    const updateCamera = () => {
      lat = Math.max(-85, Math.min(85, lat));
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);
      camera.lookAt(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta),
      );
    };

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      startLon = lon;
      startLat = lat;
      renderer.domElement.style.cursor = "grabbing";
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      lon = startLon - (event.clientX - startX) * 0.16;
      lat = startLat + (event.clientY - startY) * 0.16;
      updateCamera();
    };

    const onPointerUp = (event: PointerEvent) => {
      dragging = false;
      renderer.domElement.style.cursor = "grab";
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      camera.fov = THREE.MathUtils.clamp(
        camera.fov + Math.sign(event.deltaY) * 4,
        35,
        95,
      );
      camera.updateProjectionMatrix();
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointercancel", onPointerUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const texture = loader.load(
      src,
      (loaded) => {
        if (disposed) return;
        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.minFilter = THREE.LinearFilter;
        material.map = loaded;
        material.needsUpdate = true;
        setStatus("ready");
      },
      undefined,
      () => {
        if (!disposed) setStatus("error");
      },
    );

    const animate = (time: number) => {
      const delta = Math.min((time - last) / 1000, 0.1);
      last = time;
      if (autoRef.current && !dragging) {
        lon += delta * 1.4;
        updateCamera();
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };

    updateCamera();
    frame = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      texture.dispose();
      material.dispose();
      geometry.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [src]);

  function goFullscreen() {
    containerRef.current?.requestFullscreen?.().catch(() => undefined);
  }

  return (
    <div
      ref={containerRef}
      className="pano relative aspect-[16/10] w-full overflow-hidden bg-pine-deep md:aspect-[16/9]"
      role="img"
      aria-label={title}
    >
      {status !== "ready" ? (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-pine-deep text-center text-cream/70">
          {status === "loading" ? (
            <div>
              <span className="mx-auto block size-8 animate-spin rounded-full border-2 border-cream/20 border-t-gold-light" />
              <p className="mt-3 text-xs">{t.common.loading}</p>
            </div>
          ) : (
            <div className="pointer-events-auto px-6">
              <p className="font-display text-lg text-cream">
                {t.common.error}
              </p>
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-xs text-gold-light underline underline-offset-4"
              >
                {title}
              </a>
            </div>
          )}
        </div>
      ) : null}

      <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 bg-gradient-to-b from-black/45 to-transparent p-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/70">
            {t.property.panorama}
          </p>
          <p className="mt-0.5 font-display text-lg text-cream">{title}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoRotate((value) => !value)}
            aria-pressed={autoRotate}
            className={`grid size-9 place-items-center rounded-full border backdrop-blur transition ${
              autoRotate
                ? "border-gold-light/60 bg-gold/25 text-cream"
                : "border-cream/25 bg-black/20 text-cream/70 hover:text-cream"
            }`}
            title={t.property.autoRotate}
          >
            <Rotate className="text-base" />
          </button>
          <button
            type="button"
            onClick={goFullscreen}
            className="grid size-9 place-items-center rounded-full border border-cream/25 bg-black/20 text-cream/80 backdrop-blur transition hover:text-cream"
            title={t.property.fullscreen}
          >
            <Expand className="text-base" />
          </button>
        </div>
      </div>

      {status === "ready" ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-wrap items-center gap-x-4 gap-y-1 bg-gradient-to-t from-black/55 to-transparent px-4 pb-3 pt-8 text-[11px] text-cream/75">
          <span>{t.property.dragToLook}</span>
          <span className="text-cream/30">·</span>
          <span>{t.property.scrollToZoom}</span>
        </div>
      ) : null}
    </div>
  );
}
