import { join } from "path";
import { existsSync, rmSync } from "fs";

import { describe, test, expect } from "@jest/globals";

import { Secrets } from "./Secrets";

describe("secrets", () => {
    let secrets: Secrets

    beforeEach(() => { secrets = new Secrets() })

    test("load", async () => {
        const source = join("mock", "secrets")

        expect(() => secrets.load({ source })).not.toThrow()

        expect(secrets.session).toBeDefined()
        expect(secrets.session?.secret).toBeDefined()
    })

    test("load with ssl", async () => {
        const source = join("mock", "secrets")

        expect(() => secrets.load({ source, ssl: true })).not.toThrow()

        expect(secrets.ssl).toBeDefined()
        expect(secrets.ssl?.key).toBeDefined()
        expect(secrets.ssl?.cert).toBeDefined()
        expect(secrets.session).toBeDefined()
        expect(secrets.session?.secret).toBeDefined()
    })

    test("generate secrets", async () => {
        const source = join("mock", "temp", "secrets")

        expect(() => secrets.generate({ source })).not.toThrow()

        expect(() => {
            expect(existsSync(join(source, "session", "secret"))).toEqual(true)
        }).not.toThrow()
    })

    test("generate secrets", async () => {
        const source = join("mock", "temp", "secrets")

        expect(() => secrets.generate({ source, commonname: "localhost", generate: ["ssl", "session"] })).not.toThrow()

        expect(() => {
            expect(existsSync(join(source, "ssl", "server.key"))).toEqual(true)
            expect(existsSync(join(source, "ssl", "server.crt"))).toEqual(true)
            expect(existsSync(join(source, "session", "secret"))).toEqual(true)
        }).not.toThrow()
    })
})