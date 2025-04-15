import { describe, test, expect } from "@jest/globals";

import { Database } from "./Database";

describe("database", () => {
    let db: Database

    beforeEach(() => { db = new Database() })

    test("nothing", async () => {
        // i genuinely don't know
        // how to test for this
        expect(true).toBeTruthy();
    })
})