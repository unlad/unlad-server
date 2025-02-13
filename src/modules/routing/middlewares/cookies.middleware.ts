import { NextFunction, Request, Response } from "express";

export function CookieMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
        switch(req.method) {
            case "GET":
                if (req.query.cookieless) req.headers.cookie = req.query.cookie as string
                break

            case "POST":
                if (req.body.cookieless) req.headers.cookie = req.body.cookie as string
                break
        }

        next()
    }
}