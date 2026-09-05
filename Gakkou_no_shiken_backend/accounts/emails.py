import os
from django.conf import settings
from django.core.mail import send_mail


def get_frontend_base_url(request=None) -> str:
    """
    Resolves the frontend domain from Django settings or environment variables,
    defaulting to https://www.gakkounoshiken.site.
    """
    configured = getattr(settings, 'FRONTEND_URL', None) or os.environ.get('FRONTEND_URL') or os.environ.get('NEXT_PUBLIC_APP_URL')
    if configured:
        return configured.rstrip('/')
    return 'https://www.gakkounoshiken.site'


def send_password_reset_email(user, raw_token: str, request=None, timeout_minutes: int = 15) -> bool:
    """
    Sends a beautifully formatted, responsive HTML password reset email to the user.
    Includes the secure one-time link, expiration countdown warning, and security note.
    """
    base_url = get_frontend_base_url(request)
    reset_url = f"{base_url}/reset-password?token={raw_token}"

    display_name = user.first_name or user.username or "Candidate"
    user_email = user.email
    if not user_email:
        return False

    subject = "Reset Your Password - Gakkou No Shiken"

    html_message = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">Gakkou No Shiken</h1>
              <p style="color: #c7d2fe; font-size: 13px; margin: 6px 0 0; font-weight: 500;">Japan Skills & JFT-Basic CBT Platform</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="color: #0f172a; font-size: 19px; font-weight: 700; margin: 0 0 14px;">Password Recovery Request</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                Hello <strong>{display_name}</strong>,
              </p>
              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 26px;">
                We received a request to reset the password for your Gakkou No Shiken account (<strong>{user_email}</strong>). Click the button below to choose a new, secure password:
              </p>

              <!-- Action Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 26px;">
                <tr>
                  <td align="center">
                    <a href="{reset_url}" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35); transition: background-color 0.2s;">
                      Reset My Password &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry Alert -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="color: #92400e; font-size: 13px; margin: 0; font-weight: 500;">
                  &#9201; <strong>Link expires in {timeout_minutes} minutes.</strong> For security reasons, this link is single-use and will expire shortly.
                </p>
              </div>

              <!-- Fallback Plain URL -->
              <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0 0 18px;">
                If the button above does not work, copy and paste this link into your browser:<br>
                <a href="{reset_url}" style="color: #4f46e5; word-break: break-all; font-size: 12px;">{reset_url}</a>
              </p>

              <!-- Security Warning -->
              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 20px;">
              <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
                <strong>Security Notice:</strong> If you did not request this password reset, please ignore this email. Your existing password is safe and will not be changed.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; Gakkou No Shiken. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    plain_message = f"""Hello {display_name},

We received a request to reset the password for your Gakkou No Shiken account ({user_email}).

To set a new password, open this link in your browser:
{reset_url}

This password reset link will expire in {timeout_minutes} minutes and can only be used once.

Security Notice: If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.

- The Gakkou No Shiken Team
https://www.gakkounoshiken.site
"""

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'Gakkou No Shiken <noreply@gakkounoshiken.site>')

    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=from_email,
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False
        )
        return True
    except Exception as e:
        print(f"Error sending password reset email: {e}")
        return False
