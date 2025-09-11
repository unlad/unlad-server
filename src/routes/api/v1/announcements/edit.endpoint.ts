import { Route, HTTPEndpoint } from "modules/routing/Routing";
import { Server } from "modules/server/Server"
import { AuthenticationMiddleware } from "modules/routing/middlewares/auth.middleware";
import { RankMiddleware } from "modules/routing/middlewares/rank.middleware";
import { Rank } from "modules/server/users/UserManager";

import { join } from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

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
                        uuid: z.string().uuid(),
                        title: z.string().optional(),
                        author: z.string().optional(),
                    })
                    
                    const fileschema = z.object({ content: z.any().refine(file => file && file.mimetype == "text/markdown").optional() }).optional()
                    const files = await fileschema.safeParse(req.files)
                    if (!files.success) return res.send({ code: 1 })

                    const body = bodyschema.safeParse(req.body)
                    if (!body.success) return res.send({ code: 2 })

                    const dir = join(global.__dirname, "..", "data", "announcements", body.data.uuid)
                    if (!existsSync(dir)) return res.send({ code: 3 })

                    const file = join(dir, "meta")
                    if (!existsSync(file)) return res.send({ code: 3 })

                    try {
                        const rawdata = readFileSync(file).toString()
                        const metadata = JSON.parse(rawdata)

                        if (body.data.title) metadata.title = body.data.title
                        if (body.data.author) metadata.author = body.data.author

                        if (files.data?.content) {
                            const content = req.files?.content as UploadedFile
                            await content.mv(join(dir, "content"))
                        }

                        metadata.modified = Date.now()

                        writeFileSync(file, JSON.stringify(metadata))
                    } catch (e) {
                        return res.send({ code: 4 })
                    }
                    
                    

                    return res.send({ code: 0 })
                },  
            ]
        })
    ]
});