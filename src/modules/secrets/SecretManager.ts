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
            const attrs = [{ name: 'countryName', value: '' }, { shortName: 'ST', value: '.'}, { name: 'organizationName', value: '.'}];

            cert.setSubject(attrs);
            cert.setIssuer(attrs);

            cert.setExtensions([{
                name: 'subjectAltName',
                altNames: [{ type: 6, value: "http://localhost/" }, { type: 7, value: "127.0.0.1" }]
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