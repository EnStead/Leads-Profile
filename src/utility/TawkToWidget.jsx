import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import api from "./axios";

const TAWK_SCRIPT_ID = "tawkto-widget-script";
const TAWK_SUPPORT_AUTH_ENDPOINT = "/api/v2/support/tawk/auth";
const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

const getWidgetUrl = (propertyId, widgetId) =>
  `https://embed.tawk.to/${propertyId}/${widgetId}`;

const removeTawkDom = () => {
  if (typeof document === "undefined") return;

  [
    "#tawkchat-container",
    "#tawk-widget",
    "#tawkto-container",
    "iframe[title='chat widget']",
    "iframe[title='Tawk.to chat widget']",
    "iframe[src*='tawk.to']",
  ].forEach((selector) => {
    document.querySelectorAll(selector).forEach((node) => node.remove());
  });
};

const ensureTawkScript = (propertyId, widgetId) => {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (document.getElementById(TAWK_SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = TAWK_SCRIPT_ID;
  script.async = true;
  script.src = getWidgetUrl(propertyId, widgetId);
  script.charset = "UTF-8";
  script.setAttribute("crossorigin", "*");
  document.head.appendChild(script);
};

const getSupportAuth = async (token) => {
  if (!token) return null;

  const response = await api.get(TAWK_SUPPORT_AUTH_ENDPOINT, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response?.data?.data?.visitor ?? null;
};

const toTawkLoginPayload = (visitor) => {
  if (!visitor?.userId || !visitor?.hash) return null;

  return {
    userId: String(visitor.userId).trim(),
    hash: String(visitor.hash).trim(),
    ...(visitor.name ? { name: String(visitor.name).trim() } : {}),
    ...(visitor.email ? { email: String(visitor.email).trim() } : {}),
    ...(visitor.role ? { role: String(visitor.role).trim() } : {}),
    ...(visitor.plan ? { plan: String(visitor.plan).trim() } : {}),
    ...(visitor.accountId ? { accountId: String(visitor.accountId).trim() } : {}),
  };
};

const TawkToWidget = ({ user }) => {
  const location = useLocation();

  const propertyId = import.meta.env.VITE_TAWK_PROPERTY_ID;
  const widgetId = import.meta.env.VITE_TAWK_WIDGET_ID;

  const token = user?.token;
  const role = user?.user?.role;

  const widgetReadyRef = useRef(false);
  const activeUserIdRef = useRef(null);
  const switchingRef = useRef(false);
  const pendingPayloadRef = useRef(null);
  const latestRunIdRef = useRef(0);

  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);
  const shouldEnableWidget = Boolean(token) && role === "client" && !isPublicRoute;

  const getTawk = () => (typeof window !== "undefined" ? window.Tawk_API : undefined);

  const hideWidgetNow = () => {
    const tawk = getTawk();
    tawk?.minimize?.();
    tawk?.hideWidget?.();
    tawk?.hide?.();
  };

  const showWidgetNow = () => {
    const tawk = getTawk();
    tawk?.showWidget?.();
    tawk?.show?.();
  };

  const logoutTawk = () =>
    new Promise((resolve) => {
      const tawk = getTawk();

      hideWidgetNow();

      if (!tawk?.logout) {
        activeUserIdRef.current = null;
        removeTawkDom();
        resolve();
        return;
      }

      tawk.logout(() => {
        activeUserIdRef.current = null;
        removeTawkDom();
        resolve();
      });
    });

  const loginTawk = (payload) =>
    new Promise((resolve, reject) => {
      const tawk = getTawk();

      if (!tawk?.login) {
        reject(new Error("Tawk login API not available yet"));
        return;
      }

      tawk.login(payload, (error) => {
        if (error) {
          reject(error);
          return;
        }

        activeUserIdRef.current = payload.userId;
        resolve();
      });
    });

  const flushPendingLogin = async () => {
    if (!widgetReadyRef.current) return;
    if (switchingRef.current) return;

    const payload = pendingPayloadRef.current;
    if (!payload) return;

    switchingRef.current = true;
    pendingPayloadRef.current = null;

    try {
      hideWidgetNow();

      if (activeUserIdRef.current && activeUserIdRef.current !== payload.userId) {
        await logoutTawk();
      }

      if (activeUserIdRef.current !== payload.userId) {
        await loginTawk(payload);
      }

      showWidgetNow();
    } catch (error) {
      console.error("Tawk session switch failed:", error);
      hideWidgetNow();
    } finally {
      switchingRef.current = false;

      if (
        pendingPayloadRef.current &&
        pendingPayloadRef.current.userId !== activeUserIdRef.current
      ) {
        void flushPendingLogin();
      }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!propertyId || !widgetId) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const previousOnLoad = window.Tawk_API.onLoad;

    window.Tawk_API.onLoad = function () {
      widgetReadyRef.current = true;

      if (typeof previousOnLoad === "function") {
        previousOnLoad();
      }

      if (!shouldEnableWidget) {
        hideWidgetNow();
        return;
      }

      void flushPendingLogin();
    };

    ensureTawkScript(propertyId, widgetId);
  }, [propertyId, widgetId, shouldEnableWidget]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!propertyId || !widgetId) return;

    const runId = ++latestRunIdRef.current;

    const run = async () => {
      if (!shouldEnableWidget) {
        pendingPayloadRef.current = null;
        switchingRef.current = false;
        hideWidgetNow();
        await logoutTawk();
        removeTawkDom();
        return;
      }

      try {
        const visitor = await getSupportAuth(token);
        if (latestRunIdRef.current !== runId) return;

        const payload = toTawkLoginPayload(visitor);
        if (!payload) {
          hideWidgetNow();
          await logoutTawk();
          removeTawkDom();
          return;
        }

        if (activeUserIdRef.current === payload.userId && !switchingRef.current) {
          showWidgetNow();
          return;
        }

        pendingPayloadRef.current = payload;

        if (widgetReadyRef.current) {
          await flushPendingLogin();
        }
      } catch (error) {
        if (latestRunIdRef.current !== runId) return;
        console.error("Failed to initialize Tawk support auth:", error);
        hideWidgetNow();
        await logoutTawk();
        removeTawkDom();
      }
    };

    void run();
  }, [propertyId, widgetId, token, role, shouldEnableWidget]);

  return null;
};

export default TawkToWidget;
