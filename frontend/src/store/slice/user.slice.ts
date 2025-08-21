import { StateCreator } from "zustand";
import { IUserState } from "../interface/user.interface";
import { onlyCapitalizeFirstLetter } from "@/functions";
import { User } from "@/types";
import { USER_STORAGE_KEY } from "@/constants";

export const UserSlice: StateCreator<IUserState> = (set, get) => ({
  user: null,
  avatarImage: undefined,

  username() {
    const user = get().user;
    // return user ? `${user.first_primary} ${user.last_primary?.[0]}.` : "Guest";
    return user ? `${user.first_primary} ${user.last_primary}` : "Guest";
  },
  useruuid() {
    const user = get().user;
    // return user ? `${user.first_primary} ${user.last_primary?.[0]}.` : "Guest";
    return user ? user.user_uuid : null;
  },
  username_header() {
    const user = get().user;
    return user ? `${user.first_primary} ${user.last_primary?.[0]}.` : "Guest";
    // return user ? `${user.first_primary} ${user.last_primary}` : "Guest";
  },
  shortname() {
    const user = get().user;
    return user
      ? `${onlyCapitalizeFirstLetter(
          user.first_primary || "D"
        )} ${onlyCapitalizeFirstLetter(user.last_primary || "S")}`
      : "Guest";
  },

  isAdmin() {
    return get().user?.is_admin || false;
  },
  isOP_up() {
    const op_up = [
      "OP",
      "LL",
      "TS2",
      "TL",
      "TS1",
      "MGR",
      "PMGR",
      "FM",
      "GM",
      "FD",
    ];
    const position = get().user?.position_shortname || "";
    return op_up.includes(position) || false;
  },
  isTL_up() {
    const tl_up = ["TL", "TS1", "MGR", "PMGR", "FM", "GM", "FD"];
    const position = get().user?.position_shortname || "";
    return tl_up.includes(position) || false;
  },
  isMGR_up() {
    const mgr_up = ["MGR", "PMGR", "FM", "GM", "FD"];
    const position = get().user?.position_shortname || "";
    return mgr_up.includes(position) || false;
  },
  isGM_up() {
    const gm_up = ["FM", "GM", "FD"];
    const position = get().user?.position_shortname || "";
    return gm_up.includes(position) || false;
  },

  isLoggedIn() {
    return get().user != null;
  },

  setUser(user: User) {
    // console.log("setUser() user:", user);

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    // console.log(
    //   "setUser() USER_STORAGE_KEY:",
    //   USER_STORAGE_KEY,
    //   "JSON.stringify(user):",
    //   JSON.stringify(user)
    // );

    set({ user });
  },

  loadUser() {
    const userStr = localStorage.getItem(USER_STORAGE_KEY) ?? null;

    // console.log("loadUser() userStr:", userStr);

    const user = userStr ? JSON.parse(userStr) : null;

    // console.log("loadUser() user", user);

    set({ user });
  },

  clearUser() {
    localStorage.removeItem(USER_STORAGE_KEY);
    set({ user: null });
  },
});
