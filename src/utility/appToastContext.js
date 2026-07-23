import { createContext, useContext } from "react";

export const AppToastContext = createContext(null);

export const useAppToast = () => useContext(AppToastContext);
