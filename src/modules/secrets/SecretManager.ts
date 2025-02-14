import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { randomBytes } from "crypto";
import forge from "node-forge";


export class SecretManager {    
    ssl: {
        key: Buffer,
        cert: Buffer
    }

    session: Buffer

    constructor() {
        if (!existsSync("secrets/ssl/server.key") || existsSync("secrets/ssl/server.crt")) {
            const keys = forge.pki.rsa.generateKeyPair(2048);
            const cert = forge.pki.createCertificate();
            cert.publicKey = keys.publicKey;

            cert.serialNumber = '01' + randomBytes(19).toString("hex");
            cert.validity.notBefore = new Date();
            cert.validity.notAfter = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365);
            const attrs = [{ name: "commonName", value: "localhost" }];

            cert.setSubject(attrs);
            cert.setIssuer(attrs);

            cert.setExtensions([{
                name: 'subjectAltName',
                altNames: [
                    ...process.env.WEB_URIS!.split(";").map(uri => uri.trim()).map(uri => { return { type: 6, value: uri } }),
                    ...process.env.WEB_IPS!.split(";").map(ip => ip.trim()).map(ip => { return { type: 7, ip } })
                ]
            }, {
                name: "basicConstraints",
                cA: true
            }]);

            cert.sign(keys.privateKey);

            const key = forge.pki.privateKeyToPem(keys.privateKey)
            const pem = forge.pki.certificateToPem(cert);
            
            mkdirSync("secrets/ssl", { recursive: true })
            writeFileSync("secrets/ssl/server.key", key)
            writeFileSync("secrets/ssl/server.crt", pem)
        }

        if (!existsSync("secrets/session/secret")) {
            const secret = randomBytes(16).toString("hex")
            mkdirSync("secrets/session", { recursive: true })
            writeFileSync("secrets/session/secret", secret)
        }

        this.ssl = {
            key: readFileSync("secrets/ssl/server.key"),
            cert: readFileSync("secrets/ssl/server.crt")
        }

        this.session = readFileSync("secrets/session/secret")
    }
}