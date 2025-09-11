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

const sizes = [128, 192, 256, 384, 512]

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "GET",
            handlers: [
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const paramschema = z.object({
                        uuid: z.string().uuid(),
                        size: z.string().refine(size => sizes.includes(parseInt(size))).optional()
                    })

                    const params = await paramschema.safeParse(req.query)
                    if (!params.success) return res.send({ code: 1 })   

                    const query = server.items.resolve(params.data.uuid)
                    if (query.code) return res.send({ code: 2 })

                    const dir = join(global.__dirname, "..", "data", "images", "items", params.data.uuid)
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
                        crop: z.string().refine(json => {
                            try {
                                z.object({
                                    x: z.number().min(0),
                                    y: z.number().min(0),
                                    width: z.number().min(512),
                                    height: z.number().min(512),
                                }).parse(JSON.parse(json))

                                return true
                            } catch (e) {
                                console.log(e)
                                return false
                            }
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
                    
                    let formatter = sharp(image.data)
                    const metadata = await formatter.metadata()

                    if (metadata.width < 512 || metadata.height < 512) return res.send({ code: 5 })

                    
                    let cropdata
                    if (body.data.crop) {
                        cropdata = JSON.parse(body.data.crop)

                        if (
                            cropdata.x > metadata.width ||
                            cropdata.y > metadata.height ||
                            cropdata.width > metadata.width ||
                            cropdata.height > metadata.height ||
                            metadata.width - cropdata.x < cropdata.width ||
                            metadata.height - cropdata.y < cropdata.height
                        ) return res.send({ code: 6 })
                    }
                    
                    try {
                        if (!(metadata.width == 512 && metadata.height == 512)) {
                            const max = Math.min(metadata.width, metadata.height)

                            formatter = formatter.extract({
                                left: cropdata?.x ?? 0,
                                top: cropdata?.y ?? 0,
                                width: cropdata?.width ?? max,
                                height: cropdata?.height ?? max
                            })
                        }

                        const path = join(global.__dirname, "..", "data", "images", "items", body.data.uuid)
                        mkdirSync(path, { recursive: true })

                        for (const size of sizes) {
                            formatter.resize(size, size).toFile(join(path, size.toString()))
                        }
                    } catch (e) {
                        return res.send({ code: 7 })
                    }

                    res.send({ code: 0 })
                },
            ]
        })
    ]
});