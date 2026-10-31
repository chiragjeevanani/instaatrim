const API_KEY = process.env.SMS_API_KEY || 'Shd7kNGsDE6okDIB8Cajew';
const SENDER_ID = process.env.SMS_SENDER_ID || 'BGADEC';
const DLT_ENTITY_ID = process.env.SMS_PE_ID || '1001164203633432409';
const DLT_TEMPLATE_ID = process.env.SMS_TEMPLATE_ID || '1007282516644508833';
const APP_NAME = process.env.SMS_APP_NAME || 'Drimstyle';

/**
 * Send Dynamic OTP SMS via SMSIndiaHub API
 * @param {string} phone - 10-digit customer mobile number
 * @param {string|number} otp - Dynamic 4-digit OTP
 */
async function sendOtpSMS(phone, otp) {
    try {
        const cleanNumber = String(phone).replace(/[^0-9]/g, '').slice(-10);
        if (cleanNumber.length !== 10) {
            console.error('[SMSIndiaHub] Invalid 10-digit phone number:', phone);
            return { success: false, message: 'Invalid 10-digit phone number' };
        }

        // Exact approved template text with dynamic OTP
        const messageText = `Welcome to the ${APP_NAME} powered by Appzeto.Your OTP for registration is ${otp}.BGADEC`;

        const queryParams = new URLSearchParams({
            APIKey: API_KEY,
            senderid: SENDER_ID,
            channel: 'Trans',
            DCS: '0',
            flashsms: '0',
            number: `91${cleanNumber}`,
            text: messageText,
            route: '1',
            DltEntityId: DLT_ENTITY_ID,
            DltTemplateId: DLT_TEMPLATE_ID
        });

        const requestUrl = `https://cloud.smsindiahub.in/api/mt/SendSMS?${queryParams.toString()}`;
        console.log(`[SMSIndiaHub] Dispatching OTP ${otp} to 91${cleanNumber}...`);

        const response = await fetch(requestUrl);
        const data = await response.json().catch(() => null);

        console.log('[SMSIndiaHub] Gateway Response:', JSON.stringify(data));

        if (data && (data.ErrorCode === '000' || data.ErrorMessage === 'Done' || data.ErrorMessage === 'Success')) {
            console.log(`[SMSIndiaHub] OTP ${otp} successfully sent to 91${cleanNumber}! JobId: ${data.JobId}`);
            return {
                success: true,
                jobId: data.JobId,
                message: 'OTP sent successfully'
            };
        }

        console.error('[SMSIndiaHub] Failed to send OTP:', data);
        return {
            success: false,
            code: data?.ErrorCode,
            message: data?.ErrorMessage || 'Failed to send SMS'
        };

    } catch (error) {
        console.error('[SMSIndiaHub] Network/Service Error:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = {
    sendOtpSMS,
    API_KEY,
    SENDER_ID,
    DLT_ENTITY_ID,
    DLT_TEMPLATE_ID
};
