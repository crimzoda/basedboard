/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

const functions = require('firebase-functions');
const fetch = require('node-fetch');

const imageType = ['png', 'jpg', 'jpeg', 'bmp', 'gif'];
const videoType = ['mp4', 'webm'];

const recaptchaSecretKey = '6Lfr958nAAAAAPlGq6852bRTYofqdbcg5FNbuTVN';

const cors = require('cors')({ origin: true });

exports.getMedia = functions
    .region('europe-west1')
    .https.onRequest(async (req, res) => {
        cors(req, res, async () => {
            functions.logger.log('Function started')
            let mediaURL = req.query.url;
            functions.logger.log('Media ulr ' + mediaURL)
            let mediaType = mediaURL.split('.').pop().toLowerCase();
            
            try {
                functions.logger.log('Before fetch')
                let response = await fetch(mediaURL);
        
                if (!response.ok) {
                    functions.logger.log('Failed to fetch media')
                    throw new Error('Failed to fetch media');
                }
        
                const mediaBuffer = await response.buffer();
                if (imageType.includes(mediaType)) {
                    if (mediaType == 'jpg') { mediaType = 'jpeg' };
                    res.type('image/' + mediaType);
                } else if (videoType.includes(mediaType)) {
                    res.type('video/' + mediaType);
                }
                functions.logger.log('Before res.send')
                res.send(mediaBuffer);
            } catch (error) {
                functions.logger.log('Error fetching media: ' + error.message);
                res.status(500).json({ error: 'Error fetching media:: ' + error.message });
            }
        });
    
});

exports.verifyRecaptcha = functions
    .region('europe-west1')
    .https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', 'https://basedboard.net');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method == 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    const recaptchaResponse = req.body.recaptchaResponse;
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify`;
    const verificationParams = new URLSearchParams({
        secret: recaptchaSecretKey,
        response: recaptchaResponse
    });
   
    try {
        const verificationResponse = await fetch(verificationURL, {
            method: 'POST', 
            body: verificationParams 
        });

        const verificationDataText = await verificationResponse.text();
        functions.logger.log("VERIFICATION DATA: ", verificationDataText);

        const verificationData = JSON.parse(verificationDataText);

        if (verificationData.success) {
            res.status(200).json({ success: true });
        } else {
            res.status(200).json( { success: false });
        }

        
    } catch (error) {
        res.status(500).json( { error: 'Error verifying reCAPTCHA' });
    }
});

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
