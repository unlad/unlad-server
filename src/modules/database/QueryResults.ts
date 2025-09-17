export namespace QueryResults {
    export namespace Users {
        export type Resolve = {
            code: 0
            data: {
                uuid: string
                id: string
                name: string,
                email: string
                rank: number,
                created: string
            }
        } | { code: 1 | 2 }

        export type List = {
            code: 0
            users: {
                uuid: string
                id: string
                name: string
                email: string
                rank: number,
                created: string
            }[]
        } | { code: 1 }
        
        export type Create = { code: 0 | 1 }
        export type Delete = { code: 0 | 1 }

        export type Hash = { 
            code: 0
            data: { hash: string }
        } | { code: 1 }

        export type UUID = {
            code: 0
            data: { uuid: string }
        } | { code: 1 }

        export type Rank = { code: 0 | 1 }
    }

    export namespace Bank {
        export type Resolve = {
            code: 0
            data: {
                uuid: string
                balance: number
            }
        } | { code: 1 }

        export type Credit = { code: 0 | 1 }
        export type Deduct = { code: 0 | 1 }
        export type Transfer = { code: 0 | 1 }
    }

    export namespace Transactions {
        export type List = {
            code: 0,
            transactions: { 
                uuid: string,
                tid: string,
                items: string,
                comment?: string,
                timestamp: string
            }[]
        } | { code: 1 }

        export type Resolve = {
            code: 0,
            data: {
                uuid: string,
                tid: string,
                items: string,
                comment?: string,
                timestamp: string
            }
        } | { code: 1 }

        export type Add = { code: 0 | 1 }
    }

    export namespace Items {
        export type List = {
            code: 0,
            items: {
                uuid: string,
                name: string,
                type: string,
                description: string,
                price: number
            }[]
        } | { code: 1 }

        export type Create = { code: 0 | 1 }
        export type Delete = { code: 0 | 1 }

        export type Resolve = {
            code: 0,
            data: {
                uuid: string,
                name: string,
                type: string,
                description: string,
                price: number
                stock: number
            }
        } | { code : 1 }

        export type Rename = { code: 0 | 1 }
        export type Retype = { code: 0 | 1 }
        export type Redescribe = { code: 0 | 1 }
        export type Reprice = { code: 0 | 1 }
        export type Restock = { code: 0 | 1 }
    }

    export namespace Notifications {
        export type List = {
            code: 0,
            tokens: {
                uuid: string,
                type: string,
                token: string
            }[]
        } | { code: 1 }

        export type Register = { code: 0 | 1 }
        export type Unregister = { code: 0 | 1 }

        export type Resolve = {
            code: 0,
            tokens: {
                uuid: string,
                type: string,
                token: string
            }[]
        } | { code : 1 }
    }

    export namespace Property {
        export type List = {
            code: 0,
            properties: {
                uuid: string,
                name: string,
                description: string
                status: number,
                recovery: {
                    uuid: string
                    surrendered: boolean
                    message?: string
                    timestamp: number
                } | null
                property: string,
            }[]
        } | { code: 1 }

        export type Register = { code: 0 | 1 }
        export type Unregister = { code: 0 | 1 }
        export type Update = { code: 0 | 1 }

        export type Resolve = {
            code: 0,
            data: {
                uuid: string,
                name: string,
                description: string
                status: number,
                recovery: {
                    uuid: string
                    surrendered: boolean
                    message?: string
                    timestamp: number
                } | null
                property: string,
            }
        } | { code : 1 }
    }
}