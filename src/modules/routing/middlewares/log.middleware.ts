import { NextFunction, Request, Response } from "express";

export function LogMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
        const original = res.send.bind(res);

        res.send = (body) => {
            console.log(`${req.method} ${req.path} ${JSON.stringify(req.query)} ${JSON.stringify(req.body)} => ${JSON.stringify(body)}`)
            return original(body);
        };

        next();
    }
}