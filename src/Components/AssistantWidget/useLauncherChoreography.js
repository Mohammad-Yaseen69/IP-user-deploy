import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

export const ORB_SIZE = 56;
const INTRO_SCALE = 1.25;
const HOVER_SCALE = 1.06;
const DROP_PX = 180;
// The intro's beats, exported so the tests follow them when they are tuned.
export const QUIET_MS = 2500;
export const QUIET_AFTER_MODAL_MS = 600;
export const BUBBLE_DELAY_MS = 600;
export const WINK_AT_MS = 2300;
export const WINK_MS = 500;
export const INTRO_MS = 3200;
const REST = { x: 0, y: 0 };

const COVER_SELECTOR = [
  ".modal.show", // reactstrap / react-bootstrap
  ".modal-backdrop", // Bootstrap backdrop, present until the fade ends
  ".offcanvas.show",
  ".MuiModal-root:not([aria-hidden='true'])", // MUI Dialog, Modal, Drawer, Menu, Popover
  "[role='dialog'][aria-modal='true']",
].join(", ");

export const isScreenCovered = () =>
  document.body.style.overflow === "hidden" ||
  document.body.classList.contains("modal-open") ||
  Boolean(document.querySelector(COVER_SELECTOR));

/**
 * Layout position of `node` inside `ancestor`, ignoring CSS transforms — so a
 * panel still mid-slide reports where it will land, not where it is.
 */
const offsetWithin = (node, ancestor) => {
  let x = 0;
  let y = 0;
  let current = node;
  while (current && current !== ancestor) {
    x += current.offsetLeft;
    y += current.offsetTop;
    current = current.offsetParent;
  }
  return { x, y };
};

/** Viewport centre of the orb's resting spot: the root's bottom-right corner. */
const restCentre = (root) => {
  const rect = root.getBoundingClientRect();
  return { x: rect.right - ORB_SIZE / 2, y: rect.bottom - ORB_SIZE / 2 };
};

/**
 * Drives the launcher's acts on every page load: the orb waits for the screen
 * to be clear of modals, drops in from above and floats mid-screen with a
 * greeting, docks into the corner, and flies into the panel header whenever
 * the chat is open. Returns motion props for the orb plus what else belongs on
 * screen.
 */
export const useLauncherChoreography = ({ enabled, isOpen, hovered, rootRef, slotRef }) => {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState("idle");
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [winking, setWinking] = useState(false);
  const [stage, setStage] = useState(null);
  const [header, setHeader] = useState(null);
  const [pageLoaded, setPageLoaded] = useState(() => document.readyState === "complete");
  const coveredOnce = useRef(false);

  const dock = useCallback(() => {
    setBubbleVisible(false);
    setPhase("docked");
  }, []);

  useEffect(() => {
    if (pageLoaded) return undefined;
    const onLoad = () => setPageLoaded(true);
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, [pageLoaded]);

  useEffect(() => {
    if (!enabled) return;
    setPhase((current) => (current !== "idle" ? current : reduceMotion ? "docked" : "waiting"));
  }, [enabled, reduceMotion]);

  // Opening the chat before the orb has docked ends the intro — it has
  // somewhere to be.
  useEffect(() => {
    if (isOpen && (phase === "waiting" || phase === "intro")) dock();
  }, [dock, isOpen, phase]);

  // The intro starts once the page has finished loading and nothing has covered
  // it for a quiet period. On a clean load that period is long: a drop-in that
  // runs while the browser is still painting the dashboard loses its frames and
  // is never seen. Once something has covered the page the period is short —
  // by the time a modal is dismissed the page has long settled. Mid-intro, a
  // modal sends the orb back to waiting so the whole thing replays when the
  // screen clears.
  useEffect(() => {
    if (phase !== "waiting" && phase !== "intro") return undefined;
    let quiet = null;
    const check = () => {
      const covered = isScreenCovered();
      if (covered) coveredOnce.current = true;
      if (!pageLoaded || covered) {
        clearTimeout(quiet);
        quiet = null;
        setBubbleVisible(false);
        setPhase((current) => (current === "intro" ? "waiting" : current));
      } else if (!quiet) {
        quiet = setTimeout(
          () => {
            quiet = null;
            setPhase((current) => (current === "waiting" ? "intro" : current));
          },
          coveredOnce.current ? QUIET_AFTER_MODAL_MS : QUIET_MS,
        );
      }
    };
    // Two observers: modals mount and unmount somewhere in the tree, while the
    // scroll lock is an attribute on body itself. Watching attributes across
    // the whole tree would fire on the orb's own animation frames.
    const mounts = new MutationObserver(check);
    const bodyAttributes = new MutationObserver(check);
    mounts.observe(document.body, { childList: true, subtree: true });
    bodyAttributes.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    check();
    return () => {
      mounts.disconnect();
      bodyAttributes.disconnect();
      clearTimeout(quiet);
    };
  }, [pageLoaded, phase]);

  // The intro's beats: greet, wink goodbye, then leave the stage.
  useEffect(() => {
    if (phase !== "intro") return undefined;
    const bubble = setTimeout(() => setBubbleVisible(true), BUBBLE_DELAY_MS);
    const winkStart = setTimeout(() => setWinking(true), WINK_AT_MS);
    const winkEnd = setTimeout(() => setWinking(false), WINK_AT_MS + WINK_MS);
    const end = setTimeout(dock, INTRO_MS);
    return () => {
      [bubble, winkStart, winkEnd, end].forEach(clearTimeout);
      setWinking(false);
    };
  }, [dock, phase]);

  // Where mid-screen is, relative to the resting spot, kept fresh on resize.
  useLayoutEffect(() => {
    if (phase !== "intro") return undefined;
    const measure = () => {
      if (!rootRef.current) return;
      const rest = restCentre(rootRef.current);
      setStage({ x: window.innerWidth / 2 - rest.x, y: window.innerHeight * 0.42 - rest.y });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [phase, rootRef]);

  // The header slot is located by layout offsets rather than bounding rects, so
  // the panel's entrance transform cannot skew the target.
  useLayoutEffect(() => {
    if (!isOpen) return undefined;
    const measure = () => {
      const root = rootRef.current;
      const slot = slotRef.current;
      if (!root || !slot) return;
      const rect = root.getBoundingClientRect();
      const offset = offsetWithin(slot, root);
      const size = slot.offsetWidth || ORB_SIZE;
      const rest = restCentre(root);
      setHeader({
        x: rect.left + offset.x + size / 2 - rest.x,
        y: rect.top + offset.y + size / 2 - rest.y,
        scale: size / ORB_SIZE,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isOpen, rootRef, slotRef]);

  const orb = useMemo(() => {
    if (phase === "idle" || phase === "waiting" || (phase === "intro" && !stage)) return null;

    const inHeader = Boolean(isOpen && header);
    const onStage = phase === "intro";
    const move = inHeader ? { x: header.x, y: header.y } : onStage ? stage : REST;
    const scale = inHeader ? header.scale : onStage ? INTRO_SCALE : hovered ? HOVER_SCALE : 1;
    // A looser spring for the landing on stage; a firmer one for dock and header.
    const transition = reduceMotion
      ? { duration: 0.15, opacity: { duration: 0.15 } }
      : onStage
        ? { type: "spring", stiffness: 150, damping: 18, mass: 1, opacity: { duration: 0.35 } }
        : { type: "spring", stiffness: 210, damping: 26, mass: 0.9, opacity: { duration: 0.2 } };

    return {
      // The intro drops in from above; a docked mount just pops into the corner.
      initial: onStage
        ? { x: stage.x, y: stage.y - DROP_PX, scale: 0.5, opacity: 0 }
        : { ...REST, scale: 0.6, opacity: 0 },
      animate: { ...move, scale, opacity: 1 },
      transition,
      float: reduceMotion || isOpen ? 0 : onStage ? 7 : 2.5,
      wink: onStage && winking,
    };
  }, [header, hovered, isOpen, phase, reduceMotion, stage, winking]);

  return {
    phase,
    orb,
    bubbleVisible: phase === "intro" && bubbleVisible,
    labelVisible: phase === "docked" && !isOpen,
    reduceMotion,
  };
};
