import crypto from 'crypto';
import { exec } from 'child_process';
import '../config/envConfig.js';

function verifySignature(req, res, buf, encoding) {
    const signature = req.headers['x-hub-signature-256']; // GitHub sends the signature here

    if (!signature) {
        console.log('No signature found on request');
        return false;
    }

    const hmac = crypto.createHmac('sha256', process.env.REPO_WEBHOOK_SECRET);
    const digest = 'sha256=' + hmac.update(buf).digest('hex');

    if (signature !== digest) {
        console.log('Signature does not match');
        return false;
    }

    console.log('Signature is valid');
    return true;
}

export const deployController = (req, res) => {
    const buf = JSON.stringify(req.body); // The raw body of the request
    const isValid = verifySignature(req, res, buf);

    
    if (!isValid) {
        return res.status(401).send(`Invalid signature ${req.headers['x-hub-signature-256']}`);
    }

    if (req.body.action !== 'closed') {
        return res.status(200).send(`Pull request not closed`);
    }

    if (req.body.pull_request.base.ref === 'main') {
        deploy(res);
    } else {
        return res.status(200).send(`Pull request not merged to main`);
    }
}

function deploy(res) {
    try {
        let user = process.env.USER;
        exec(`cd /home/${user}/frappe-bench/apps/ai_chat_assist/ai_chat_assist/node_file_backend/src/shellScripts && ./updateApplication.sh`, { encoding: "utf-8" });
        res.status(200).send(`Deployed successfully, optimistic response`);
    } catch (error) {
        console.error(`Deployment failed: ${error.message}`);
        return res.status(500).send(`Deployment failed: ${error.message}`);
    }
}
