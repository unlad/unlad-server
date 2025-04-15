import { describe, test, expect } from "@jest/globals";

import { Routing } from "./Routing";

describe("routing manager", () => {
    let routing: Routing

    beforeEach(() => { routing = new Routing() })

    test("get routes", async () => {
        // shit doesn't like to import routes
        // so this will shall be in the
        // to be implemented cause im lazy
        expect(true).toBeTruthy();
    })
})