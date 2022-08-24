import User from "../interfaces/User";
import { shortenAddress } from "./shortenAddress";

export const displayName = (user: User) => {
    return user.username || shortenAddress(user.publicKey)
}