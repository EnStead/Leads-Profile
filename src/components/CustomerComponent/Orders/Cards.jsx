import { useEffect, useMemo, useRef, useState } from "react";
import { Dot, Lock, X } from "lucide-react";
import { gsap } from "gsap";
import { useLocation, useNavigate } from "react-router";
import { useClientDashboard } from "../../../context/DashboardContext";
import CardSkeleton from "../../../utility/skeletons/CardSkeleton";
import EmptyState from "../../../utility/EmptyState";
import UsaFlag from "../../../assets/usa.webp";
import CanadaFlag from "../../../assets/canada.png";
import {
  buildOrderDayFiles, 
  inferOrderFolderTitle,
  shouldHideOrderFolder,
} from "./orderSchedule";
import Monday1 from "../../../assets/Monday.png";
import Tuesday1 from "../../../assets/Tuesday.png";
import Wednesday1 from "../../../assets/Wednesday.png";
import Thursday1 from "../../../assets/Thursday.png";
import Friday1 from "../../../assets/Friday.png";
import Suede from "../../../assets/Suede.jpg";
import LeadsEmptystate from "../../../utility/LeadsEmptystate";

const DAY_FILE_BACKGROUNDS = [
  "linear-gradient(140deg, #6dd5b8 0%, #f6c453 45%, #3da8f8 100%)",
  "linear-gradient(160deg, #c68f47 0%, #e7d08f 48%, #65c7ff 100%)",
  "linear-gradient(155deg, #cbb4be 0%, #9ca4bf 45%, #76d5ff 100%)",
  "linear-gradient(165deg, #f9bc89 0%, #db7b68 45%, #4b4f95 100%)",
  "linear-gradient(160deg, #64336f 0%, #1f477c 42%, #18b1e5 100%)",
];

const DAY_IMAGES = {
  Monday: Monday1,
  Tuesday: Tuesday1,
  Wednesday: Wednesday1,
  Thursday: Thursday1,
  Friday: Friday1,
};

const Cards = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    allOrdersData,
    allOrdersLoading,
    allOrdersError,
    recordOrderOpen,
  } = useClientDashboard();

  const [activeOrder, setActiveOrder] = useState(null);
  const [openingOrderId, setOpeningOrderId] = useState(null);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [isFolderFilesVisible, setIsFolderFilesVisible] = useState(true);
  const [promotedFiles, setPromotedFiles] = useState([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const animationTimersRef = useRef([]);
  const sourceFileRefs = useRef({});
  const promotedFileRefs = useRef([]);
  const transitTimelineRef = useRef(null);
  const modalOverlayRef = useRef(null);
  const modalContentRef = useRef(null);

  const folderOpenDuration = prefersReducedMotion ? 70 : 220;
  const heroLiftDuration = prefersReducedMotion ? 110 : 330;
  const transitStartDelay = prefersReducedMotion ? 20 : 60;

  const clearAnimationTimers = () => {
    animationTimersRef.current.forEach((timerId) => clearTimeout(timerId));
    animationTimersRef.current = [];
  };

  const killTransitTimeline = () => {
    if (transitTimelineRef.current) {
      transitTimelineRef.current.kill();
      transitTimelineRef.current = null;
    }
  };

  const setSourceFileRef = (orderId, day, node) => {
    const key = `${orderId}-${day}`;
    if (node) {
      sourceFileRefs.current[key] = node;
      return;
    }
    delete sourceFileRefs.current[key];
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setPrefersReducedMotion(media.matches);

    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!location.state?.autoOpenOrder || allOrdersLoading) return;

    const passedOrder = location.state.autoOpenOrder;
    const passedEvent = location.state.autoOpenEvent;
    const forceOpenFolderModal = Boolean(location.state.forceOpenFolderModal);

    // Safely extract the order ID whether the object is wrapped in an "order" property or not
    const actualOrder = passedOrder?.order || passedOrder;
    const orderId = actualOrder?._id || actualOrder?.id || actualOrder?.publicId;

    const targetOrder = allOrdersData?.data?.find(
      (o) => o._id === orderId || o.id === orderId || o.publicId === orderId
    );

    const targetWeekday = passedEvent?.details?.weekday;

    if (targetOrder && !activeOrder && !openingOrderId) {
      const timer = setTimeout(() => {
        const cardEl = document.getElementById(`order-card-${targetOrder._id || targetOrder.id || orderId}`);
        
        let syntheticEvent = null;
        if (cardEl) {
          cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
          syntheticEvent = { currentTarget: cardEl };
        } else {
          const fakeEl = document.createElement("div");
          fakeEl.getBoundingClientRect = () => ({
            left: window.innerWidth / 2 - 90,
            top: window.innerHeight / 2 - 105,
            width: 180,
            height: 210,
          });
          syntheticEvent = { currentTarget: fakeEl };
        }

        handleOpenFolder(targetOrder, syntheticEvent, {
          targetWeekday,
          forceOpenFolderModal,
        });
        navigate(location.pathname, { replace: true, state: {} });
      }, 300); // Gives time for initial render & animation calculations
      return () => clearTimeout(timer);
    } else if (!targetOrder && !activeOrder && !openingOrderId && orderId) {
      // If the order is on another page, we don't have the files array to show the folder correctly.
      // Fall back to opening the order details directly!
      let route = `/orders/${encodeURIComponent(orderId)}`;
      if (targetWeekday) {
        route += `?day=${encodeURIComponent(targetWeekday)}`;
      }
      navigate(route, { replace: true, state: {} });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.autoOpenOrder, allOrdersLoading, allOrdersData?.data]);

  useEffect(
    () => () => {
      clearAnimationTimers();
      killTransitTimeline();
    },
    [],
  );

  const handleOpenFolder = (item, event, options = {}) => {
    if (openingOrderId || activeOrder) return;

    if (
      event?.target instanceof HTMLElement &&
      event.target.closest("button, [role='menuitem'], [data-order-card-action]")
    ) {
      return;
    }

    clearAnimationTimers();

    const allDayFiles = buildOrderDayFiles(item);
    const targetWeekday = options?.targetWeekday || null;
    const forceOpenFolderModal = Boolean(options?.forceOpenFolderModal);

    // If a specific weekday was requested via an event, jump straight to it!
    if (targetWeekday && !forceOpenFolderModal) {
      const specificFile = allDayFiles.find(f => String(f.day || "").toUpperCase() === String(targetWeekday).toUpperCase());
      if (specificFile && (specificFile.id || specificFile._id)) {
        openOrderDetails(item._id || item.id, specificFile.day, specificFile.id || specificFile._id);
        return;
      }
    }
    
    if (allDayFiles.length === 1 && !forceOpenFolderModal) {
      const file = allDayFiles[0];
      const fileId = file.id ?? file._id ?? null;
      const isFilled = Number(file.filled ?? 0) > 0;
      if (fileId && isFilled) {
        openOrderDetails(item._id || item.id, file.day, fileId);
        return;
      }
    }

    const dayFiles = allDayFiles.slice(0, 5);

    let cardRect = { left: 0, top: 0, width: 0, height: 0 };
    if (event && event.currentTarget) {
      cardRect = event.currentTarget.getBoundingClientRect();
      const x = ((cardRect.left + cardRect.width / 2) / window.innerWidth) * 100;
      const y = ((cardRect.top + cardRect.height / 2) / window.innerHeight) * 100;
      setOrigin({ x, y });
    }

    const isMobile = window.innerWidth < 640;
    const columns = isMobile ? 2 : 3;
    const cardWidth = isMobile ? Math.min(170, window.innerWidth * 0.38) : 180;
    const cardHeight = 210;
    const colGap = isMobile ? 16 : 52;
    const rowGap = isMobile ? 56 : 74;
    const totalItems = dayFiles.length;
    const rows = Math.ceil(totalItems / columns);
    const totalHeight = rows * cardHeight + (rows - 1) * rowGap;
    
    const startY = Math.max(120, (window.innerHeight - totalHeight) / 2 + (isMobile ? 30 : 40));
    const rowCounts = Array.from({ length: rows }, (_, row) =>
      Math.min(columns, totalItems - row * columns),
    );

    const filesWithTargets = dayFiles.map((file, index) => {
      const offset = (index % 2 === 0 ? 1 : -1) * Math.floor((index + 1) / 2);
      const rotate = offset * 12;
      const translateX = offset * 20;
      const translateY = Math.abs(offset) * 5;

      // Extrapolate the exact screen coordinates from CSS custom properties 
      // so they seamlessly hijack the physical location of the hovered folder files!
      const startLeft = cardRect.left + cardRect.width / 2 - 55 + translateX;
      const startTop = cardRect.top + 16 + translateY; 

      const col = index % columns;
      const row = Math.floor(index / columns);
      const rowWidth = rowCounts[row] * cardWidth + (rowCounts[row] - 1) * colGap;
      const rowStartX = (window.innerWidth - rowWidth) / 2;

      return {
        id: file.id ?? file._id ?? null,
        orderId: item._id,
        day: file.day,
        imageSrc: DAY_IMAGES[file.day],
        gradient: DAY_FILE_BACKGROUNDS[index % DAY_FILE_BACKGROUNDS.length],
        publicId: file.publicId,
        filled: file.filled,
        target: file.target,
        locked: file.locked,
        from: {
          left: startLeft,
          top: startTop,
          width: 110,
          height: 130,
          rotation: rotate
        },
        to: {
          left: rowStartX + col * (cardWidth + colGap),
          top: startY + row * (cardHeight + rowGap),
          width: cardWidth,
          height: cardHeight,
          rotation: 0
        },
      };
    });

    setPromotedFiles(filesWithTargets);
    setIsFolderFilesVisible(false);
    setOpeningOrderId(item._id);
    setActiveOrder(item);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        killTransitTimeline();
        const timeline = gsap.timeline();

        const overlayNode = modalOverlayRef.current;
        const contentNode = modalContentRef.current;

        if (overlayNode) gsap.set(overlayNode, { opacity: 0 });
        if (contentNode) gsap.set(contentNode, { opacity: 0, scale: 0.97 });

        filesWithTargets.forEach((file, index) => {
          const node = promotedFileRefs.current[index];
          if (!node) return;

          // Render explicitly at the initial physical hover state
          gsap.set(node, {
            x: 0, y: 0,
            left: file.from.left,
            top: file.from.top,
            width: file.from.width,
            height: file.from.height,
            rotation: file.from.rotation,
            transformOrigin: "bottom center"
          });

          const innerContent = node.querySelector('.file-inner-content');
          if (innerContent) {
              gsap.set(innerContent, { scale: 1.06, y: -24, borderRadius: "12px" });
          }

          const popUpDuration = prefersReducedMotion ? 0.1 : 0.25;
          const spreadDuration = prefersReducedMotion ? 0.2 : 0.55;
          const stagger = prefersReducedMotion ? 0.02 : 0.08;
          
          const phaseStart = index * stagger;

          // 2. Animate the container (node) expanding and positioning into the center
          timeline.to(node, {
            left: file.to.left, 
            top: file.to.top,
            width: file.to.width,
            height: file.to.height,
            rotation: file.to.rotation,
            duration: spreadDuration,
            ease: "power3.inOut"
          }, phaseStart + popUpDuration);

          if (innerContent) {
            // 1. Files smoothly pop vertically all the way out of the glass folder cover
            timeline.to(innerContent, {
              y: -140, 
              scale: 1.06,
              borderRadius: "12px",
              duration: popUpDuration,
              ease: "power2.out"
            }, phaseStart)
            // 3. Files settle smoothly into the final modal grid
            .to(innerContent, {
              y: 0, 
              scale: 1,
              borderRadius: "22px",
              duration: spreadDuration,
              ease: "power2.inOut"
            }, phaseStart + popUpDuration);
          }
        }); 

        // 4. Modal overlay and content fade in confidently ONLY AFTER files arrange
        const totalFileAnimTime = filesWithTargets.length * (prefersReducedMotion ? 0.02 : 0.08) + (prefersReducedMotion ? 0.3 : 0.8);
        
        if (overlayNode) {
          timeline.to(
            overlayNode,
            { opacity: 1, duration: 0.3, ease: "power1.inOut" },
            totalFileAnimTime
          );
        }
        if (contentNode) {
          timeline.to(
            contentNode,
            { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" },
            totalFileAnimTime
          );
        }

        filesWithTargets.forEach((file, index) => {
          const node = promotedFileRefs.current[index];
          if (!node) return;
          const labelContent = node.querySelector('.file-label-content');
          if (labelContent) {
            timeline.to(labelContent, {
              opacity: 1,
              duration: 0.2,
              ease: "power1.inOut"
            }, totalFileAnimTime - 0.2);
          }
        });

        transitTimelineRef.current = timeline;
      });
    });
  };

  const activeOrderFiles = useMemo(
    () => (activeOrder ? buildOrderDayFiles(activeOrder) : []),
    [activeOrder],
  );

  const activeOrderRangeLabel = useMemo(() => {
    if (!activeOrder) return "";
    return inferOrderFolderTitle(activeOrder);
  }, [activeOrder, activeOrderFiles.length]);

  useEffect(() => {
    if (!activeOrder) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeOrder]);

  const getCountryBadge = (order) => {
    const country = String(
      order?.country || order?.countryPool || order?.countryCode || "",
    ).toLowerCase();

    if (country.includes("canada") || country === "ca") {
      return (
        <img
          src={CanadaFlag}
          alt="Canada"
          className="h-8 w-8 rounded-full border border-[#D5E1FF] object-cover"
        />
      );
    }
    if (country.includes("united states") || country === "us") {
      return (
        <img
          src={UsaFlag}
          alt="USA"
          className="h-8 w-8 rounded-full border border-[#D5E1FF] object-cover"
        />
      );
    }
    return (
      <img
          src={UsaFlag}
          alt="USA"
          className="h-8 w-8 rounded-full border border-[#D5E1FF] object-cover"
        />
    );
  };


  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const openOrderDetails = (orderId, day, dayId) => {
    if (!dayId) return;

    const route = `/orders/${orderId}?day=${encodeURIComponent(day || "")}&dayId=${encodeURIComponent(dayId)}`;
    void recordOrderOpen?.({
      orderId,
      fileId: dayId,
      day,
    });
    clearAnimationTimers();
    killTransitTimeline();
    setPromotedFiles([]);
    setIsFolderFilesVisible(true);
    setOpeningOrderId(null);
    setActiveOrder(null);
    navigate(route);
  };

  const handleModalClose = () => {
    // Allow GSAP to play the timeline perfectly backwards to tuck the files back into the folder!
    if (transitTimelineRef.current) {
      transitTimelineRef.current.reverse().eventCallback("onReverseComplete", () => {
        clearAnimationTimers();
        setPromotedFiles([]);
        setIsFolderFilesVisible(true);
        setOpeningOrderId(null);
        setActiveOrder(null);
      });
    } else {
      clearAnimationTimers();
      setPromotedFiles([]);
      setIsFolderFilesVisible(true);
      setOpeningOrderId(null);
      setActiveOrder(null);
    }
  };

  if (allOrdersLoading) {
    return (
      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </section>
    );
  }

  if (allOrdersError) {
    return <p className="text-brand-red">Failed to load dashboard data.</p>;
  }

  return (
    <>
      <style>{`
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .card-animate {
          animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        .order-card {
          perspective: 900px;
          transform-style: preserve-3d;
        }
        .folder-shell {
          transform-origin: center bottom;
        }
        .order-card.order-opening .folder-shell {
          transform: translateY(-3px) scale(0.99);
        }
        .file-card {
          transform: translateX(calc(-50% + var(--tx) * 1)) translateY(calc(var(--ty) * 1)) rotate(calc(var(--rot) * 0.5));
        }
        .group:hover .file-card {
          transform: translateX(calc(-50% + var(--tx))) translateY(var(--ty)) rotate(var(--rot));
        }
        .order-card.order-opening .folder-frontdrop {
          transform: perspective(500px) rotateX(-25deg);
        }
        @media (prefers-reduced-motion: reduce) {
          .card-animate {
            animation-duration: 0.18s;
          }
          .folder-shell,
          .file-card,
          .file-card img,
          .folder-frontdrop {
            transition-duration: 120ms !important;
          }
        }
      `}</style>
      {!allOrdersData?.data.length ? (
        <LeadsEmptystate />
      ) : (
        <section className="grid grid-cols-1 gap-x-3 gap-y-5 sm:grid-cols-2 ml:grid-cols-3 lss:grid-cols-4 xlls:grid-cols-5">
          {Array.isArray(allOrdersData?.data) &&
            allOrdersData?.data.map((item, index) => {
              const dayFiles = buildOrderDayFiles(item);
              const hideFolder = shouldHideOrderFolder(item);

              if (hideFolder) return null;

              return (
                <div
                  key={item._id}
                  className="relative  card-animate"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    id={`order-card-${item._id}`}
                    role="button"
                    tabIndex={0}
                    onClick={(event) => handleOpenFolder(item, event)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleOpenFolder(item, event);
                      }
                    }}
                    className={`order-card group relative h-full min-h-60 cursor-pointer overflow-show px-4 transition-all duration-300 ${
                      openingOrderId === item._id || activeOrder?._id === item._id ? "order-opening" : ""
                    }`}
                  >
                    {/* Blue Folder */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 270 218"
                      fill="none"
                      preserveAspectRatio="none"
                      className="folder-shell pointer-events-none absolute inset-x-0 top-0 h-full w-full transition-transform"
                      style={{ transitionDuration: `${folderOpenDuration}ms` }}
                    >
                      <g filter={`url(#filter_folder_${item._id})`}>
                        <path d="M9 23C9 14.1634 16.1634 7 25 7H103.551C108.559 7 113.277 9.34408 116.302 13.3343L130.198 31.6657C133.223 35.6559 137.941 38 142.949 38H245C253.837 38 261 45.1634 261 54V191C261 199.837 253.837 207 245 207H25C16.1634 207 9 199.837 9 191V23Z" fill="#2F6BFF"/>
                        <image
                          href={Suede}
                          width="270"
                          height="218"
                          preserveAspectRatio="none"
                          clipPath={`url(#clip_folder_${item._id})`}
                          className="mix-blend-soft-light opacity-60"
                        />
                        <path d="M103.552 5.5C109.028 5.50013 114.189 8.06371 117.497 12.4277L131.394 30.7598C134.135 34.3757 138.411 36.4999 142.948 36.5H245C254.665 36.5 262.5 44.335 262.5 54V191C262.5 200.665 254.665 208.5 245 208.5H25C15.335 208.5 7.5 200.665 7.5 191V23L7.50586 22.5479C7.74568 13.0918 15.4862 5.5 25 5.5H103.552Z" stroke="#F9F9F9" strokeWidth="3"/>
                      </g>
                      <defs>
                        <clipPath id={`clip_folder_${item._id}`}>
                          <path d="M9 23C9 14.1634 16.1634 7 25 7H103.551C108.559 7 113.277 9.34408 116.302 13.3343L130.198 31.6657C133.223 35.6559 137.941 38 142.949 38H245C253.837 38 261 45.1634 261 54V191C261 199.837 253.837 207 245 207H25C16.1634 207 9 199.837 9 191V23Z" />
                        </clipPath>
                        <filter id={`filter_folder_${item._id}`} x="0" y="0" width="270" height="218" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                          <feOffset dy="2"/>
                          <feGaussianBlur stdDeviation="3"/>
                          <feColorMatrix type="matrix" values="0 0 0 0 0.0196078 0 0 0 0 0.247059 0 0 0 0 0.14902 0 0 0 0.12 0"/>
                          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_12185_4278"/>
                          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_12185_4278" result="shape"/>
                        </filter>
                      </defs>
                    </svg>
                    
                    {/* Image Files */}
                    <div className="pointer-events-none absolute left-1/2 top-5 h-[62px] w-[122px] -translate-x-1/2">
                      {dayFiles.slice(0, 5).map((file, i) => {
                        // i=0: center, i=1: left 1, i=2: right 1, i=3: left 2, i=4: right 2
                        const offset = (i % 2 === 0 ? 1 : -1) * Math.floor((i + 1) / 2);
                        const rotate = offset * 12;
                        const translateX = offset * 20;
                        const translateY = Math.abs(offset) * 5;
                        const zIndex = 10 - i;
                        const imgSrc = DAY_IMAGES[file.day];
                        const isDrained =
                          activeOrder?._id === item._id && !isFolderFilesVisible;

                        return (
                          <div
                            key={file.day}
                            className="absolute left-1/2 top-4 flex h-[130px] w-[110px] origin-bottom items-center justify-center transition-transform duration-300 ease-out file-card"
                            ref={(node) => setSourceFileRef(item._id, file.day, node)}
                            data-rot={rotate}
                            style={{
                              "--tx": `${translateX}px`,
                              "--ty": `${translateY}px`,
                              "--rot": `${rotate}deg`,
                              zIndex,
                              opacity: isDrained ? 0 : 1,
                            }}
                          >
                            {imgSrc ? (
                              <img 
                                src={imgSrc} 
                                alt={file.day} 
                                className="h-full w-full border-2 border-[#F3F8FF]/70 bg-[#F3F8FF]/70 rounded-[12px] origin-bottom object-cover shadow-[0px_4px_24px_0px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out group-hover:border-[3px] group-hover:bg-[#F3F8FF] group-hover:border-[#F3F8FF] group-hover:-translate-y-6 group-hover:scale-106"
                              />
                            ) : (
                              <div
                                className="relative flex h-full w-full items-center justify-center rounded-[12px] border-2 border-[#F3F8FF]/70"
                                style={{
                                  background:
                                    DAY_FILE_BACKGROUNDS[
                                      i % DAY_FILE_BACKGROUNDS.length
                                    ],
                                }}
                              >
                                <span className="rounded-sm bg-[#dfdfa8]/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#6f3224] shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
                                  {file.day}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* File Frontdrop */}
                    <div 
                      className="folder-frontdrop absolute inset-x-3 bottom-[15px] z-20 flex h-[52%] origin-bottom flex-col justify-between rounded-[14px] bg-[rgba(109,151,255,0.40)] px-3.5 pt-3.5 pb-2 backdrop-blur-md transition-transform ease-out"
                      style={{ transitionDuration: `${folderOpenDuration}ms` }}
                    >
                      <div>
                        <h3 className="font-park font-semibold text-white">
                        Leads: {inferOrderFolderTitle(item)}
                      </h3>
                        <p className="mt-1 text-xs font-light text-[#F9F9F9] flex items-center">
                          {dayFiles.length} {dayFiles.length === 1 ? "File" : "Files"} <Dot/>
                          {" "}Progress: {Number(item.filled ?? 0).toLocaleString()} /{" "}
                          {Number(item.quantity ?? 0).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex pt-3 items-center justify-between font-light text-[10px] text-[#D5E1FF]">
                        <span>
                          Updated on{" "}
                          {formatDate(item.updatedAt || item.createdAt)}
                        </span>
                        {getCountryBadge(item)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </section>
      )} 

      {activeOrder && promotedFiles.length ? (
        <div className="pointer-events-none fixed inset-0 z-[60]">
          {promotedFiles.map((file, index) => (
            <div
              key={file.id}
              ref={(node) => {
                promotedFileRefs.current[index] = node;
              }}
              className="absolute"
              style={{
                left: file.from.left,
                top: file.from.top,
                width: file.from.width,
                height: file.from.height,
              }}
            >
              <button
                type="button"
                disabled={file.locked}
                          onClick={() => openOrderDetails(file.orderId, file.day, file.id)}
                className={`file-inner-content pointer-events-auto relative h-full w-full overflow-hidden rounded-[12px] border-2 border-[#F3F8FF] shadow-[0_4px_24px_0px_rgba(0,0,0,0.12)] transition-shadow ${
                  file.locked
                    ? "cursor-not-allowed opacity-75"
                    : "hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(0,0,0,0.34)]"
                }`}
                style={{
                  background: file.imageSrc ? "transparent" : file.gradient,
                  transform: `translateY(-24px) scale(1.06)`,
                  transformOrigin: "bottom center"
                }}
              >
                {file.imageSrc ? (
                  <img src={file.imageSrc} alt={file.day} className="h-full w-full object-cover" />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_45%)]" />
                    <div className="relative flex h-full items-center justify-center p-5">
                      <div className="rounded-sm bg-[#dfdfa8]/90 px-4 py-3 text-center text-[17px] font-semibold uppercase tracking-wide text-[#6f3224] shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
                        {file.day} Leads
                      </div>
                    </div>
                  </>
                )}

                {file.locked ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-700">
                      <Lock size={20} />
                    </span>
                  </div>
                ) : null}
              </button>
              <div
                className="file-label-content pointer-events-none absolute left-0 right-0 top-[calc(100%+8px)] text-center"
                style={{ opacity: 0 }}
              >
                <p className="text-lg font-semibold leading-none text-white">
                  {file.publicId}
                </p>
                <p className="mt-2 text-sm font-light text-[#f9f9f9]">
                  Progress: {Number(file.filled).toLocaleString()} /{" "}
                  {Number(file.target).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {/* Custom Modal replacing Radix UI */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center ${
          activeOrder ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          ref={modalOverlayRef}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          style={{ opacity: 0 }}
          onClick={handleModalClose}
        />
        <div
          ref={modalContentRef}
          className="relative z-50 flex h-screen w-full flex-col items-center overflow-y-hidden p-5 text-white focus:outline-none sm:p-8"
          style={{ opacity: 0, transform: "scale(0.97)" }}
        > 
          {activeOrder && (
            <div className="m-auto flex w-full max-w-4xl flex-col ">
              <div className="absolute right-74 top-20 z-10">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-blue"
                >
                  <X size={16} />
                  Close
                </button>
              </div>

              <div className="text-center">
                <h3 className="font-park text-3xl font-bold text-white">
                  Leads: {activeOrderRangeLabel}
                </h3>
                <p className="mt-2 text-xs text-white">
                  Last updated on{" "}
                  {activeOrder ? formatDate(activeOrder.updatedAt || activeOrder.createdAt) : ""}
                </p>
              </div>

              <div
                className="mx-auto mt-8 flex w-full flex-wrap justify-center gap-5 pb-4 sm:gap-8"
              >
                {/* Reserve the exact layout space so the overlay perfectly fits the GSAP files */}
                {promotedFiles.map((file) => (
                  <div key={`placeholder-${file.id}`} className="w-[45%] max-w-[180px] h-56 sm:w-[180px] sm:max-w-none" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cards;
