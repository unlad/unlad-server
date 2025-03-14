import { readFileSync } from "fs";

import { describe, test, expect } from "@jest/globals";

import { Server } from "./Server";

const key = readFileSync("mock/secrets/ssl/server.key")
const cert = readFileSync("mock/secrets/ssl/server.crt")

describe("server", () => {
    let server: Server
    
    beforeEach(() => { server = new Server() })
    afterEach(() => { server.stop() })

    test("start", async () => {
        expect(async () => { await server.start }).not.toThrow()
    })

    test("start with ssl", async () => {
        const { ssl } = await server.start({ ssl: { key, cert } })
        expect(ssl).toEqual(true)
    })

})