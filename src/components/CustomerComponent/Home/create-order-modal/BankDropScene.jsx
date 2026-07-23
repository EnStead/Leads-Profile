import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Matter from "matter-js";
import BankIcon from "../../../../assets/bank.svg";
import ThumpSound from "../../../../assets/Thump.mp3"; // Change to .wav if it's a WAV file

const CHIP_HEIGHT = 40;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const unique = (list) => Array.from(new Set(list));
const estimateChipWidth = (name) => clamp(name.length * 8 + 48, 120, 300);

const BankDropScene = ({ bankNames, emptyMessage, dropMode = "default" }) => {
  const containerRef = useRef(null);
  const chipRefs = useRef({});
  const sceneRef = useRef(null);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  const fastFilteredDrop = dropMode === "filtered_fast";
  const renderNames = useMemo(() => unique(bankNames), [bankNames]);
  const renderNamesRef = useRef(renderNames);
  const boundsRef = useRef(bounds);

  const syncBodiesToScene = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const { Bodies, Body, World } = scene.helpers;
    const currentNames = renderNamesRef.current;
    const namesSet = new Set(currentNames);
    const currentBounds = boundsRef.current;

    Array.from(scene.bodyMap.keys()).forEach((name) => {
      if (namesSet.has(name)) return;
      World.remove(scene.world, scene.bodyMap.get(name));
      scene.bodyMap.delete(name);
    });

    currentNames.forEach((name, index) => {
      if (scene.bodyMap.has(name)) return;

      const chipWidth = estimateChipWidth(name);
      const minX = chipWidth / 2 + 10;
      const maxX = currentBounds.width - chipWidth / 2 - 10;
      const x = clamp(
        minX + Math.random() * Math.max(20, maxX - minX),
        minX,
        maxX,
      );
      const spawnY = fastFilteredDrop
        ? -22 - (index % 3) * 14
        : -80 - index * 60;

      const body = Bodies.rectangle(x, spawnY, chipWidth, CHIP_HEIGHT, {
        restitution: fastFilteredDrop ? 0.2 : 0.28,
        friction: fastFilteredDrop ? 0.4 : 0.45,
        frictionAir: fastFilteredDrop ? 0.008 : 0.02,
        angle: (Math.random() - 0.5) * 0.25,
        chamfer: { radius: 18 },
      });

      scene.bodyMap.set(name, body);
      World.add(scene.world, body);

      if (fastFilteredDrop) {
        Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 0.35,
          y: 7.5,
        });
      }
    });
  }, [fastFilteredDrop]);

  useEffect(() => {
    renderNamesRef.current = renderNames;
  }, [renderNames]);

  useEffect(() => {
    boundsRef.current = bounds;
  }, [bounds]);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const node = containerRef.current;
    const updateBounds = () => {
      const rect = node.getBoundingClientRect();
      setBounds({
        width: Math.floor(rect.width),
        height: Math.floor(rect.height),
      });
    };

    updateBounds();

    const observer = new ResizeObserver(updateBounds);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    if (bounds.width < 80 || bounds.height < 80) return undefined;

    const { Engine, Bodies, Body, World, Mouse, MouseConstraint, Events } = Matter;
    const engine = Engine.create({
      gravity: { x: 0, y: fastFilteredDrop ? 1.35 : 0.95 },
    });
    const world = engine.world;

    const WALL_HEIGHT = 10000;
    const WALL_OFFSET_Y = bounds.height / 2 - 4000;

    const floor = Bodies.rectangle(bounds.width / 2, bounds.height + 28, bounds.width, 56, {
      isStatic: true,
      label: "floor",
    });
    const left = Bodies.rectangle(-14, WALL_OFFSET_Y, 28, WALL_HEIGHT, {
      isStatic: true,
    });
    const right = Bodies.rectangle(bounds.width + 14, WALL_OFFSET_Y, 28, WALL_HEIGHT, {
      isStatic: true,
    });
    World.add(world, [floor, left, right]);

    const mouse = Mouse.create(containerRef.current);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.22,
        damping: 0.12,
        render: { visible: false },
      },
    });
    World.add(world, mouseConstraint);

    // Keep mouse coordinates in scene-local space (0..container width/height)
    // so MouseConstraint can correctly pick and drag physics bodies.
    Mouse.setOffset(mouse, { x: 0, y: 0 });
    Mouse.setScale(mouse, { x: 1, y: 1 });

    const bodyMap = new Map();
    sceneRef.current = {
      engine,
      world,
      bodyMap,
      helpers: { Bodies, Body, World },
    };

    let soundEnabled = false;
    Events.on(mouseConstraint, "startdrag", () => {
      soundEnabled = true;
    });

    let lastThumpTime = 0;
    Events.on(engine, "collisionStart", (event) => {
      if (!soundEnabled) return;
      
      const now = Date.now();
      // Throttle the sound so it doesn't spam if multiple chips hit at once
      if (now - lastThumpTime < 80) return;

      const hasSignificantCollision = event.pairs.some((pair) => {
        const isFloorA = pair.bodyA.label === "floor";
        const isFloorB = pair.bodyB.label === "floor";
        
        if (isFloorA || isFloorB) {
          const chip = isFloorA ? pair.bodyB : pair.bodyA;
          return chip.speed > 3.5; // Only play if hitting the floor with some speed
        }
        return pair.bodyA.speed > 6 || pair.bodyB.speed > 6; // Or if chips hit each other hard
      });

      if (hasSignificantCollision) {
        lastThumpTime = now;
        const thumpAudio = new Audio(ThumpSound);
        thumpAudio.volume = 0.25; // Keep it subtle
        thumpAudio.play().catch(() => {}); // Catch needed to prevent errors before user interaction
      }
    });

    syncBodiesToScene();

    let rafId = 0;
    const tick = () => {
      Engine.update(engine, 1000 / 60);

      bodyMap.forEach((body, name) => {
        // Soft ceiling: if the user throws a chip too high, heavily dampen its upward velocity
        if (body.position.y < -40 && body.velocity.y < 0) {
          Body.setVelocity(body, { x: body.velocity.x, y: body.velocity.y * 0.7 });
        }

        const element = chipRefs.current[name];
        if (!element) return;

        const width = element.offsetWidth || estimateChipWidth(name);
        const height = element.offsetHeight || CHIP_HEIGHT;
        const leftPosition = body.position.x - width / 2;
        const topPosition = body.position.y - height / 2;
        element.style.transform = `translate3d(${leftPosition}px, ${topPosition}px, 0) rotate(${body.angle}rad)`;
      });

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      Events.off(engine, "collisionStart");
      World.clear(world, false);
      Engine.clear(engine);
      sceneRef.current = null;
      chipRefs.current = {};
    };
  }, [bounds.height, bounds.width, fastFilteredDrop, syncBodiesToScene]);

  useEffect(() => {
    syncBodiesToScene();
  }, [renderNames, bounds.height, bounds.width, syncBodiesToScene]);

  return (
    <div
      ref={containerRef}
      className="relative h-full min-h-[520px] cursor-grab touch-none overflow-hidden rounded-xl bg-brand-lightblue p-4 active:cursor-grabbing"
    >
      {renderNames.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <div>
            <div className="mx-auto mb-5 inline-flex h-30 w-30 items-center justify-center">
              <img src={BankIcon} alt="bank" className="w-full" />
            </div>
            <p className="max-w-[300px] text-lg text-brand-label">{emptyMessage}</p>
          </div>
        </div>
      ) : (
        renderNames.map((name) => (
          <span
            key={name}
            ref={(element) => {
            if (element) {
              chipRefs.current[name] = element;
            } else {
              delete chipRefs.current[name];
            }
          }}
          className="pointer-events-none absolute left-0 top-0 inline-flex h-10 select-none items-center justify-center rounded-full bg-brand-offwhite px-4 text-sm font-park font-semibold text-brand-blackish shadow-sm"
          style={{ width: estimateChipWidth(name) }}
        >
            {name}
          </span>
        ))
      )}
    </div>
  );
};

export default BankDropScene;
