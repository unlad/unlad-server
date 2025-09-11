import { Route, HTTPEndpoint } from "modules/routing/Routing";
import { Server } from "modules/server/Server"
import { AuthenticationMiddleware } from "modules/routing/middlewares/auth.middleware";
import { RankMiddleware } from "modules/routing/middlewares/rank.middleware";
import { Rank } from "modules/server/users/UserManager";

import { join } from "path";
import { mkdirSync, writeFileSync } from "fs";

import { NextFunction, Request, Response } from "express"
import { z } from "zod"
import { v4 } from "uuid"
import { UploadedFile } from "express-fileupload";

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "POST",
            handlers: [
                AuthenticationMiddleware("HTTP"),
                RankMiddleware("HTTP", Rank.ADMIN),
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const bodyschema = z.object({
                        title: z.string(),
                        author: z.string(),
                    })
                    
                    const fileschema = z.object({ content: z.any().refine(file => file && file.mimetype == "text/markdown") })
                    const files = await fileschema.safeParse(req.files)
                    if (!files.success) return res.send({ code: 1 })

                    const body = bodyschema.safeParse(req.body)
                    if (!body.success) return res.send({ code: 2 })

                    const uuid = v4()
                    const path = join(global.__dirname, "..", "data", "announcements", uuid)
                    mkdirSync(path, { recursive: true })

                    const { title, author } = body.data
                    const date = Date.now()
                    const filedata = { uuid, title, author, created: date, modified: date }

                    const content = req.files?.content as UploadedFile
                    
                    try {
                        writeFileSync(join(path, "meta"), JSON.stringify(filedata))
                        await content.mv(join(path, "content"))
                    } catch (e) {
                        return res.send({ code: 3 })
                    }

                    return res.send({ code: 0, uuid })
                },  
            ]
        })
    ]
});