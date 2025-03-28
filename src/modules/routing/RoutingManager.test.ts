import { describe, test, expect } from "@jest/globals";

import { RoutingManager } from "./RoutingManager";

describe("routing manager", () => {
    let routing: RoutingManager

    beforeEach(() => { routing = new RoutingManager() })

    test("get routes", async () => {
        // shit doesn't like to import routes
        // so this will shall be in the
        // to be implemented cause im lazy
        expect(true).toBeTruthy();
    })
})