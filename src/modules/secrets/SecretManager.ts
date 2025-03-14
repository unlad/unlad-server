import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { randomBytes } from "crypto";
import { join } from "path";

import forge from "node-forge";

export type SecretsLoadOptions = {
    source: string,
    ssl?: boolean
}

export type SecretsGenerateOptions = {
    source: string,
    altnames?: {
        ips?: string[],
        uris?: string[]
    }
} & ({
    commonname?: string,
    generate?: ("session")[]
} | {
    commonname: string,
    generate?: ("ssl" | "session")[]
})

export class SecretManager {
    ssl?: { key: Buffer, cert: Buffer }
    session?: { secret: Buffer }

    load(options: SecretsLoadOptions) {
        options.ssl = options.ssl ?? false

        if (options.ssl) this.ssl = {
            key: readFileSync(join(options.source, "ssl", "server.key")),
            cert: readFileSync(join(options.source, "ssl", "server.crt"))
        }

        this.session = {
            secret: readFileSync(join(options.source, "session", "secret"))
        }
    }

    generate(options: SecretsGenerateOptions) {
        options.altnames = options.altnames ?? {}
        options.altnames.ips = options.altnames.ips ?? []
        options.altnames.uris = options.altnames.uris ?? []
        options.generate = options.generate ?? ["session"]

        if (options.generate.includes("ssl") && (!existsSync(join(options.source, "ssl", "server.key")) || existsSync(join(options.source, "ssl", "server.crt")))) {
            const keys = forge.pki.rsa.generateKeyPair(2048);
            const cert = forge.pki.createCertificate();
            cert.publicKey = keys.publicKey;

            cert.serialNumber = '01' + randomBytes(19).toString("hex");
            cert.validity.notBefore = new Date();
            cert.validity.notAfter = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365);
            const attrs = [{ name: "commonName", value: options.commonname }];

            cert.setSubject(attrs);
            cert.setIssuer(attrs);

            cert.setExtensions([{
                name: 'subjectAltName',
                altNames: [
                    ...options.altnames.uris.map(value => { return { type: 6, value } }),
                    ...options.altnames.ips.map(ip => { return { type: 7, ip } })
                ]
            }, {
                name: "basicConstraints",
                cA: true
            }]);

            cert.sign(keys.privateKey);

            const key = forge.pki.privateKeyToPem(keys.privateKey)
            const pem = forge.pki.certificateToPem(cert);
            
            mkdirSync(join(options.source, "ssl"), { recursive: true })
            writeFileSync(join(options.source, "ssl", "server.key"), key)
            writeFileSync(join(options.source, "ssl", "server.crt"), pem)
        }

        if (options.generate.includes("session") && !existsSync(join(options.source, "session", "secret"))) {
            const secret = randomBytes(32).toString("hex")
            mkdirSync(join(options.source, "session"), { recursive: true })
            writeFileSync(join(options.source, "session", "secret"), secret)
        }
    }
}