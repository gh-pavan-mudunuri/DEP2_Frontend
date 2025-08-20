import { createContext } from "react";

export type PopupType = { message: string; type?: "success" | "error" | "info" } | null;
const EditProfilePopupContext = createContext<((popup: PopupType) => void) | undefined>(undefined);

export default EditProfilePopupContext;