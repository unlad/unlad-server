import { Route, HTTPEndpoint } from "modules/routing/Routing";
import { Server } from "modules/server/Server"
import { AuthenticationMiddleware } from "modules/routing/middlewares/auth.middleware";
import { RankMiddleware } from "modules/routing/middlewares/rank.middleware";
import { Rank } from "modules/server/users/UserManager";

import { join } from "path";
import { existsSync, mkdirSync, readFileSync } from "fs";

import { NextFunction, Request, Response } from "express"
import { UploadedFile } from "express-fileupload"
import { z } from "zod";
import mimetics from "mimetics"
import { v4 } from "uuid";

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "GET",
            handlers: [
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const paramschema = z.object({
                        announcement_uuid: z.string().uuid(),
                        media_uuid: z.string().uuid()
                    })

                    const params = await paramschema.safeParse(req.query)
                    if (!params.success) return res.send({ code: 1 })   

                    const dir = join(global.__dirname, "..", "data", "announcements", params.data.announcement_uuid)
                    if (!existsSync(dir)) return res.send({ code: 2 })

                    const image = join(dir, "media", params.data.media_uuid)
                    if (!existsSync(image)) return res.send({ code: 3 })

                    const result = mimetics.parse(readFileSync(image))
                    if (!result) return res.send({ code: 4 })
                    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(result.mime)) return res.send({ code: 5 })

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
                    const bodyschema = z.object({ uuid: z.string().uuid() })

                    const body = await bodyschema.safeParse(req.body)
                    if (!body.success) return res.send({ code: 1 })
                    
                    const dir = join(global.__dirname, "..", "data", "announcements", body.data.uuid)
                    if (!existsSync(dir)) return res.send({ code: 2 })

                    const fileschema = z.object({ media: z.any() })
                    const files = await fileschema.safeParse(req.files)
                    if (!files.success) return res.send({ code: 3 })
                    
                    const media = files.data.media as UploadedFile

                    const accepted = ["image/jpeg", "image/png", "image/gif", "image/webp"]
                    const result = mimetics.parse(media.data)
                    if (!result || !accepted.includes(result.mime)) return res.send({ code: 4 })
                    
                    const path = join(dir, "media")
                    mkdirSync(path, { recursive: true })

                    const uuid = v4()
                    media.mv(join(path, uuid))
                
                    res.send({ code: 0, uuid })
                },
            ]
        })
    ]
});