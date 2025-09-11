import { Route, HTTPEndpoint } from "modules/routing/Routing";
import { Server } from "modules/server/Server"
import { AuthenticationMiddleware } from "modules/routing/middlewares/auth.middleware";
import { RankMiddleware } from "modules/routing/middlewares/rank.middleware";
import { Rank } from "modules/server/users/UserManager";

import { join } from "path";
import { existsSync, mkdirSync } from "fs";

import { NextFunction, Request, Response } from "express"
import { UploadedFile } from "express-fileupload"
import { z } from "zod";
import { fileTypeFromFile } from "file-type"

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "GET",
            handlers: [
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const paramschema = z.object({ uuid: z.string().uuid() })
                    const params = await paramschema.safeParse(req.query)
                    if (!params.success) return res.send({ code: 1 })   

                    const query = server.items.resolve(params.data.uuid)
                    if (query.code) return res.send({ code: 2 })

                    const image = join(global.__dirname, "..", "static", "images", "items", params.data.uuid)
                    if (!existsSync(image)) return res.send({ code: 3 })

                    const result = await fileTypeFromFile(image)
                    if (!result) return res.send({ code: 4 })
                    if (!["image/png", "image/jpeg"].includes(result.mime)) return res.send({ code: 5 })
                    
                    res.setHeader("Content-type", result.mime)
                    res.sendFile(image)
                },
            ]
        }),

        new HTTPEndpoint({
            method: "POST",
            handlers: [
                AuthenticationMiddleware("HTTP"),
                RankMiddleware("HTTP", Rank.ADMIN),
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const paramschema = z.object({ uuid: z.string().uuid() })
                    const params = await paramschema.safeParse(req.body)
                    if (!params.success) return res.send({ code: 1 })

                    const query = server.items.resolve(params.data.uuid)
                    if (query.code) return res.send({ code: 2 })
                    
                    const bodyschema = z.object({ image: z.any() })
                    const body = await bodyschema.safeParse(req.files)
                    if (!body.success) return res.send({ code: 3 })
                    
                    const image = body.data.image as UploadedFile

                    const accepted = ["image/jpeg", "image/png"]
                    if (!accepted.includes(image.mimetype)) return res.send({ code: 4 })

                    const path = join(global.__dirname, "..", "static", "images", "items")
                    mkdirSync(path, { recursive: true })
                    image.mv(join(path, params.data.uuid))

                    res.send({ code: 0 })
                },
            ]
        })
    ]
});