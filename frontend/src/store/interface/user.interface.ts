import { User } from "@/types";

export interface IUserState {
  user: User | null;
  avatarImage?: string;

  username: () => string;
  useruuid: () => string | null;
  username_header: () => string;
  shortname: () => string;
  isAdmin: () => boolean;
  isOP_up: () => boolean;
  isTL_up: () => boolean;
  isMGR_up: () => boolean;
  isGM_up: () => boolean;
  isLoggedIn: () => boolean;

  setUser: (user: User) => void;
  loadUser: () => void;
  clearUser: () => void;
}
