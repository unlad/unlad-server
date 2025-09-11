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
import sharp from "sharp"

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "GET",
            handlers: [
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const paramschema = z.object({
                        uuid: z.string().uuid(),
                        size: z.number().refine(size => [128, 192, 256, 384, 512].includes(size)).optional()
                    })

                    const params = await paramschema.safeParse(req.query)
                    if (!params.success) return res.send({ code: 1 })   

                    const query = server.items.resolve(params.data.uuid)
                    if (query.code) return res.send({ code: 2 })

                    const dir = join(global.__dirname, "..", "static", "images", "items", params.data.uuid)
                    if (!existsSync(dir)) return res.send({ code: 3 })

                    const image = join(dir, params.data.size?.toString() ?? "512")
                    if (!existsSync(image)) return res.send({ code: 4 })

                    const result = await fileTypeFromFile(image)
                    if (!result) return res.send({ code: 5 })
                    if (!["image/png", "image/jpeg"].includes(result.mime)) return res.send({ code: 6 })
                    
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
                    const bodyschema = z.object({ 
                        uuid: z.string().uuid(),
                        crop: z.object({
                            x: z.number().min(0),
                            y: z.number().min(0),
                            width: z.number().min(512),
                            height: z.number().min(512),
                        }).optional()
                    })

                    const body = await bodyschema.safeParse(req.body)
                    if (!body.success) return res.send({ code: 1 })

                    const query = server.items.resolve(body.data.uuid)
                    if (query.code) return res.send({ code: 2 })
                    
                    const fileschema = z.object({ image: z.any() })
                    const files = await fileschema.safeParse(req.files)
                    if (!files.success) return res.send({ code: 3 })
                    
                    const image = files.data.image as UploadedFile

                    const accepted = ["image/jpeg", "image/png"]
                    if (!accepted.includes(image.mimetype)) return res.send({ code: 4 })
                    
                    // image.mv(join(path, params.data.uuid))

                    let formatter = sharp(image.data)
                    const metadata = await formatter.metadata()

                    if (metadata.width < 512 || metadata.height < 512) return res.send({ code: 5 })
                    
                    if (!(metadata.width == 512 && metadata.height == 512)) {
                        const max = Math.min(metadata.width, metadata.height)

                        formatter = formatter.extract({
                            left: body.data.crop?.x ?? 0,
                            top: body.data.crop?.y ?? 0,
                            width: body.data.crop?.width ?? max,
                            height: body.data.crop?.height ?? max
                        })
                    }

                    const path = join(global.__dirname, "..", "static", "images", "items", body.data.uuid)
                    mkdirSync(path, { recursive: true })

                    const sizes = [128, 192, 256, 384, 512]
                    for (const size of sizes) {
                        formatter.resize(size, size).toFile(join(path, size.toString()))
                    }

                    res.send({ code: 0 })
                },
            ]
        })
    ]
});