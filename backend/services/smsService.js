/**
 * SMSIndiaHub Service for Drimstyle
 * DLT Template Details:
 * Sender ID / Header: BGADEC
 * PE ID: 1001164203633432409
 * Template ID: 1007282516644508833
 * Message: Welcome to the Drimstyle powered by Appzeto.Your OTP for registration is <OTP>.BGADEC
 */

const API_KEY = process.env.SMS_API_KEY || 'Shd7kNGsDE6okDIB8Cajew';
const SENDER_ID = process.env.SMS_SENDER_ID || 'BGADEC';
const PE_ID = process.env.SMS_PE_ID || '1001164203633432409';
const TEMPLATE_ID = process.env.SMS_TEMPLATE_ID || '1007282516644508833';
const APP_NAME = process.env.SMS_APP_NAME || 'Drimstyle';

/**
 * Send OTP SMS using SMSIndiaHub API
 * @param {string} phone 10-digit mobile number
 * @param {string|number} otp 4-digit OTP
 */
async function sendOtpSMS(phone, otp) {
    try {
        // Format destination number (clean 10 digits)
        const cleanNumber = String(phone).replace(/[^0-9]/g, '').slice(-10);
        if (cleanNumber.length !== 10) {
            console.error('[SMSIndiaHub] Invalid phone number:', phone);
            return { success: false, message: 'Invalid phone number' };
        }

        // Exact approved template text:
        // Welcome to the ##var## powered by Appzeto.Your OTP for registration is ##var##.BGADEC
        const messageText = `Welcome to the ${APP_NAME} powered by Appzeto.Your OTP for registration is ${otp}.BGADEC`;

        // SMSIndiaHub provides SendSMS endpoint
        // Method 1: REST JSON POST to https://cloud.smsindiahub.in/api/mt/SendSMS
        const postData = {
            Account: {
                APIKey: API_KEY,
                SenderId: SENDER_ID,
                Channel: 'Trans',
                DCS: '0',
                FlashSms: '0',
                Route: 1,
                PEId: PE_ID,
                TemplateId: TEMPLATE_ID
            },
            Messages: [
                {
                    Number: `91${cleanNumber}`,
                    Text: messageText
                }
            ]
        };

        const postResponse = await fetch('https://cloud.smsindiahub.in/api/mt/SendSMS', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });

        const postResult = await postResponse.json().catch(() => null);
        console.log('[SMSIndiaHub] POST Response:', postResult);

        // If POST was successful (ErrorCode 000 or Success)
        if (postResult && (postResult.ErrorCode === '000' || postResult.ErrorMessage === 'Success')) {
            return { success: true, result: postResult };
        }

        // Fallback: Query String / GET API format if POST fails or returns code
        const encodedMsg = encodeURIComponent(messageText);
        const getUrl = `https://cloud.smsindiahub.in/api/mt/SendSMS?APIKey=${encodeURIComponent(API_KEY)}&senderid=${encodeURIComponent(SENDER_ID)}&channel=Trans&DCS=0&flashsms=0&number=91${cleanNumber}&text=${encodedMsg}&route=1&PEId=${encodeURIComponent(PE_ID)}&TemplateId=${encodeURIComponent(TEMPLATE_ID)}`;

        const getResponse = await fetch(getUrl);
        const getResult = await getResponse.json().catch(() => null);
        console.log('[SMSIndiaHub] GET Response:', getResult);

        return { success: true, result: getResult || postResult };
    } catch (error) {
        console.error('[SMSIndiaHub] Error sending SMS:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    sendOtpSMS,
    API_KEY,
    SENDER_ID,
    PE_ID,
    TEMPLATE_ID,
    APP_NAME
};

