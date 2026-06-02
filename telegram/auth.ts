import { config } from "../config/conf";

export const isOwner = (id: number) => String(id) === config.TELEGRAM_OWNER_ID.trim();