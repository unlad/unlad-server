import { Rank } from "modules/routing/middlewares/rank.middleware";

declare module 'express-session' {
    interface SessionData {
        uuid: string
        rank: Rank
    }
}

export {};