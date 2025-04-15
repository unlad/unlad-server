import pg from "pg"

export class Database {
    pool: pg.Pool = new pg.Pool({
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,

        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
    })

    async call<ReturnData extends Record<string, any>>(name: string, args: unknown[]) {
        const { rows, fields } = await this.pool.query({
            text: `SELECT "${name}"(${args.map((_, i) => `$${++i}`).join(',')})`,
            values: args
        })

        return rows[0][fields[0].name] as ReturnData;
    }

    async connect() {
        await this.pool.connect()
        console.log("Connected to database")
    }
}