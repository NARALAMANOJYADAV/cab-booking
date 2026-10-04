export interface SmsSendResult {
  sent: boolean;
  provider: string;
  messageId?: string;
  note?: string;
}

export class SmsService {
  /**
   * Dispatch physical SMS OTP via configured SMS Gateway
   * Supported providers:
   * 1. Fast2SMS (Indian gateway, route=otp): FAST2SMS_API_KEY
   * 2. Twilio (Global carrier gateway): TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
   * 3. MSG91 (Indian DLT gateway): MSG91_AUTH_KEY, MSG91_TEMPLATE_ID
   */
  static async sendOtpSms(phone: string, otp: string): Promise<SmsSendResult> {
    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    const standardPhone = `+91${cleanDigits}`;

    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
    const msg91Key = process.env.MSG91_AUTH_KEY;

    // 1. Fast2SMS Integration (Instant Indian SMS)
    if (fast2smsKey && fast2smsKey !== 'your_fast2sms_api_key' && fast2smsKey !== 'sms_provider_mock_api_key_2026') {
      try {
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': fast2smsKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            route: 'otp',
            variables_values: otp,
            numbers: cleanDigits
          })
        });
        const resData: any = await response.json();
        console.log(`[SmsService] Fast2SMS dispatched to ${cleanDigits}:`, resData);
        if (resData?.return === true) {
          return { sent: true, provider: 'Fast2SMS', messageId: resData?.request_id };
        }
      } catch (err: any) {
        console.error(`[SmsService] Fast2SMS dispatch failed:`, err.message);
      }
    }

    // 2. Twilio Integration (Global Carrier Gateway)
    if (twilioSid && twilioAuth && twilioFrom && !twilioSid.includes('mock')) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
        const params = new URLSearchParams();
        params.append('To', standardPhone);
        params.append('From', twilioFrom);
        params.append('Body', `Your FairRide verification code is ${otp}. Valid for 10 minutes.`);

        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });
        const resData: any = await response.json();
        console.log(`[SmsService] Twilio dispatched to ${standardPhone}:`, resData?.sid);
        if (resData?.sid) {
          return { sent: true, provider: 'Twilio', messageId: resData?.sid };
        }
      } catch (err: any) {
        console.error(`[SmsService] Twilio dispatch failed:`, err.message);
      }
    }

    // 3. MSG91 Integration
    if (msg91Key && !msg91Key.includes('mock')) {
      try {
        const templateId = process.env.MSG91_TEMPLATE_ID || '';
        const response = await fetch(
          `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=91${cleanDigits}&authkey=${msg91Key}&otp=${otp}`,
          { method: 'POST' }
        );
        const resData: any = await response.json();
        console.log(`[SmsService] MSG91 dispatched to ${cleanDigits}:`, resData);
        if (resData?.type === 'success') {
          return { sent: true, provider: 'MSG91', messageId: resData?.message };
        }
      } catch (err: any) {
        console.error(`[SmsService] MSG91 dispatch failed:`, err.message);
      }
    }

    // No active physical provider configured
    console.warn(`[SmsService] Physical SMS dispatch skipped: No active FAST2SMS_API_KEY, TWILIO_ACCOUNT_SID, or MSG91_AUTH_KEY in .env.`);
    return {
      sent: false,
      provider: 'none',
      note: 'No active SMS provider credentials configured in .env'
    };
  }
}
