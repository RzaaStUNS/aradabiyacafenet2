<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifikasi OTP - Aradabiya</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0e1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(180deg, #0a0e1a 0%, #1e293b 50%, #0a0e1a 100%);">
        <tr>
            <td align="center" style="padding: 50px 20px;">
                
                <!-- Main Container with Shadow Effect -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px;">
                    <tr>
                        <td style="padding: 8px; background: linear-gradient(135deg, #3b82f6, #06b6d4, #8b5cf6, #ec4899); border-radius: 20px;">
                            
                            <!-- Inner Container -->
                            <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #1a1f2e; border-radius: 16px;">
                                
                                <!-- Animated Top Border -->
                                <tr>
                                    <td style="padding: 0;">
                                        <table width="100%" cellspacing="0" cellpadding="0" border="0">
                                            <tr>
                                                <td width="16.66%" style="background-color: #3b82f6; height: 6px; border-top-left-radius: 16px;"></td>
                                                <td width="16.66%" style="background-color: #06b6d4; height: 6px;"></td>
                                                <td width="16.66%" style="background-color: #10b981; height: 6px;"></td>
                                                <td width="16.66%" style="background-color: #8b5cf6; height: 6px;"></td>
                                                <td width="16.66%" style="background-color: #ec4899; height: 6px;"></td>
                                                <td width="16.66%" style="background-color: #f59e0b; height: 6px; border-top-right-radius: 16px;"></td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Header Section with Animated GIF -->
                                <tr>
                                    <td align="center" style="padding: 40px 40px 20px; background: radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%);">
                                        
                                        <!-- Animated Lock GIF -->
                                        <table cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 25px;">
                                            <tr>
                                                <td align="center" style="padding: 15px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.2)); border-radius: 24px; border: 2px solid rgba(59, 130, 246, 0.3);">
                                                    <img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3FxcjJjcHlzNGE1ODRha3hlcXZtZDc3dnZ4enBqZm5scWIxb2lnNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/efTCy9loCBqne/giphy.gif" alt="Security Lock" width="100" height="100" style="display: block; border: none; border-radius: 16px;">
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <h1 style="margin: 0 0 10px; font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 2px; text-transform: uppercase;">ARADABIYA</h1>
                                        <table cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                            <tr>
                                                <td style="background: linear-gradient(90deg, #3b82f6, #06b6d4); padding: 6px 20px; border-radius: 20px;">
                                                    <p style="margin: 0; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px;">🔒 Secure Verification</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Content Section -->
                                <tr>
                                    <td style="padding: 20px 40px 40px;">
                                        
                                        <!-- Greeting Card -->
                                        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                                            <tr>
                                                <td style="padding: 4px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 14px;">
                                                    <table width="100%" cellspacing="0" cellpadding="0" border="0">
                                                        <tr>
                                                            <td style="background-color: #0f1419; border-radius: 12px; padding: 24px;">
                                                                <p style="margin: 0 0 14px; color: #e0e7ff; font-size: 17px; line-height: 1.5;">
                                                                    👋 Halo, <strong style="color: #ffffff; font-weight: 700; font-size: 18px;">{{ $user->name }}</strong>
                                                                </p>
                                                                <p style="margin: 0; color: #94a3b8; font-size: 15px; line-height: 1.8;">
                                                                    Terima kasih telah bergabung dengan <strong style="color: #cbd5e1;">Aradabiya</strong>! Untuk keamanan akun Anda, silakan verifikasi identitas dengan memasukkan kode OTP di bawah ini.
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- OTP Card with Gradient Border -->
                                        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 40px 0;">
                                            <tr>
                                                <td align="center">
                                                    
                                                    <!-- Outer Glow -->
                                                    <table cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                                        <tr>
                                                            <td style="padding: 5px; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 25%, #8b5cf6 50%, #ec4899 75%, #3b82f6 100%); border-radius: 20px; box-shadow: 0 8px 32px rgba(59, 130, 246, 0.4);">
                                                                
                                                                <!-- Inner OTP Box -->
                                                                <table cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(180deg, #0a0e1a 0%, #1a1f2e 100%); border-radius: 16px;">
                                                                    <tr>
                                                                        <td style="padding: 40px 70px; text-align: center;">
                                                                            <p style="margin: 0 0 15px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; font-weight: 700;">🔑 Your Verification Code</p>
                                                                            
                                                                            <!-- OTP Code -->
                                                                            <table cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                                                                <tr>
                                                                                    <td style="background: linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(59, 130, 246, 0.1)); padding: 20px 35px; border-radius: 12px; border: 2px solid rgba(34, 211, 238, 0.3);">
                                                                                        <p style="margin: 0; color: #22d3ee; font-size: 52px; font-weight: 700; letter-spacing: 18px; font-family: 'Courier New', Consolas, monospace; line-height: 1; text-shadow: 0 0 30px rgba(34, 211, 238, 0.5);">
                                                                                            {{ $otp }}
                                                                                        </p>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                            
                                                                            <!-- Timer Info -->
                                                                            <table cellspacing="0" cellpadding="0" border="0" style="margin: 20px auto 0;">
                                                                                <tr>
                                                                                    <td style="background-color: rgba(59, 130, 246, 0.1); padding: 8px 16px; border-radius: 20px; border: 1px solid rgba(59, 130, 246, 0.3);">
                                                                                        <p style="margin: 0; color: #60a5fa; font-size: 12px; font-weight: 600;">⏱️ Berlaku 10 menit</p>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                                
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Warning Card -->
                                        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 35px;">
                                            <tr>
                                                <td style="padding: 3px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 14px;">
                                                    <table width="100%" cellspacing="0" cellpadding="0" border="0">
                                                        <tr>
                                                            <td style="background: linear-gradient(135deg, rgba(15, 20, 25, 0.95), rgba(26, 31, 46, 0.95)); border-radius: 12px; padding: 22px; border-left: 5px solid #ef4444;">
                                                                <table cellspacing="0" cellpadding="0" border="0">
                                                                    <tr>
                                                                        <td style="padding-right: 15px; vertical-align: top; font-size: 24px; line-height: 1;">⚠️</td>
                                                                        <td>
                                                                            <p style="margin: 0 0 8px; color: #fecaca; font-size: 14px; font-weight: 700; line-height: 1.4;">
                                                                                Peringatan Keamanan
                                                                            </p>
                                                                            <p style="margin: 0; color: #fca5a5; font-size: 13px; line-height: 1.7;">
                                                                                Jangan pernah membagikan kode OTP ini kepada <strong style="color: #fecaca;">siapa pun</strong>, termasuk pihak yang mengaku dari Aradabiya. Tim kami tidak akan pernah meminta kode verifikasi Anda melalui telepon, email, atau pesan.
                                                                            </p>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Info Card -->
                                        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 25px;">
                                            <tr>
                                                <td style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.08)); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px; padding: 20px;">
                                                    <table cellspacing="0" cellpadding="0" border="0">
                                                        <tr>
                                                            <td style="padding-right: 12px; vertical-align: top; font-size: 20px; line-height: 1;">💡</td>
                                                            <td>
                                                                <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.7;">
                                                                    <strong style="color: #cbd5e1;">Tips:</strong> Pastikan Anda membuka link verifikasi dari email resmi kami. Jika Anda tidak merasa melakukan pendaftaran, abaikan email ini.
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Security Animation Section -->
                                        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 35px 0;">
                                            <tr>
                                                <td align="center" style="padding: 30px 0;">
                                                    
                                                    <!-- Animated Shield GIF -->
                                                    <table cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                                        <tr>
                                                            <td style="padding: 20px; background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.1) 50%, transparent 100%); border-radius: 50%;">
                                                                <table cellspacing="0" cellpadding="0" border="0">
                                                                    <tr>
                                                                        <td style="padding: 3px; background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899); border-radius: 50%;">
                                                                            <table cellspacing="0" cellpadding="0" border="0">
                                                                                <tr>
                                                                                    <td style="background-color: #0f1419; border-radius: 50%; padding: 8px;">
                                                                                        <img src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmZyaWN6dm96d3BvZXA1YjgzcHFrN3hscjF3bXN3cHhuanlkbDU0bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/YThNrTETLgHhchqbKs/giphy.gif" alt="Security Shield" width="140" height="140" style="display: block; border: none; border-radius: 50%;">
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    
                                                    <!-- Security Message -->
                                                    <table cellspacing="0" cellpadding="0" border="0" style="margin: 25px auto 0;">
                                                        <tr>
                                                            <td align="center">
                                                                <p style="margin: 0 0 8px; color: #cbd5e1; font-size: 16px; font-weight: 700; line-height: 1.4;">
                                                                    🛡️ Akun Anda Terlindungi
                                                                </p>
                                                                <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.6; max-width: 400px;">
                                                                    Kami menggunakan enkripsi tingkat bank untuk melindungi data pribadi Anda
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Divider -->
                                        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 25px 0;">
                                            <tr>
                                                <td style="border-top: 1px solid rgba(51, 65, 85, 0.5);"></td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Support Section -->
                                        <table width="100%" cellspacing="0" cellpadding="0" border="0">
                                            <tr>
                                                <td align="center">
                                                    <p style="margin: 0 0 10px; color: #64748b; font-size: 14px; line-height: 1.5;">
                                                        Butuh bantuan? Tim kami siap membantu! 💬
                                                    </p>
                                                    <table cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                                        <tr>
                                                            <td style="background: linear-gradient(90deg, #3b82f6, #8b5cf6); padding: 12px 28px; border-radius: 8px;">
                                                                <a href="mailto:support@aradabiya.com" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; display: block;">
                                                                    📧 support@aradabiya.com
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 30px 40px; background: linear-gradient(180deg, transparent 0%, rgba(10, 14, 26, 0.8) 100%); text-align: center;">
                                        
                                        <!-- Social Icons -->
                                        <table cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 20px;">
                                            <tr>
                                                <td style="padding: 0 8px;">
                                                    <table cellspacing="0" cellpadding="0" border="0">
                                                        <tr>
                                                            <td style="background: linear-gradient(135deg, #3b82f6, #06b6d4); padding: 10px; border-radius: 10px;">
                                                                <a href="#" style="display: block; width: 20px; height: 20px; text-align: center; line-height: 20px; text-decoration: none; font-size: 16px;">📱</a>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                                <td style="padding: 0 8px;">
                                                    <table cellspacing="0" cellpadding="0" border="0">
                                                        <tr>
                                                            <td style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 10px; border-radius: 10px;">
                                                                <a href="#" style="display: block; width: 20px; height: 20px; text-align: center; line-height: 20px; text-decoration: none; font-size: 16px;">🌐</a>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                                <td style="padding: 0 8px;">
                                                    <table cellspacing="0" cellpadding="0" border="0">
                                                        <tr>
                                                            <td style="background: linear-gradient(135deg, #06b6d4, #8b5cf6); padding: 10px; border-radius: 10px;">
                                                                <a href="#" style="display: block; width: 20px; height: 20px; text-align: center; line-height: 20px; text-decoration: none; font-size: 16px;">📧</a>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <p style="margin: 0 0 8px; color: #475569; font-size: 12px; line-height: 1.6;">
                                            © {{ date('Y') }} <strong style="color: #64748b;">Aradabiya System</strong>. All rights reserved.
                                        </p>
                                        <p style="margin: 0; color: #334155; font-size: 11px; line-height: 1.5;">
                                            Email otomatis - Mohon tidak membalas pesan ini
                                        </p>
                                    </td>
                                </tr>
                                
                            </table>
                            
                        </td>
                    </tr>
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>