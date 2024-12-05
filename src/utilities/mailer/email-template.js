export const emailTemplate = (names, otp, subject) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      color: #333333;
    }
    .otp-code {
      font-size: 24px;
      font-weight: bold;
      color: #2c7df0;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #aaaaaa;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <p>Halo, ${names}</p>
    <p>Gunakan kode OTP berikut untuk melanjutkan proses ${subject.toLowerCase()}. Kode ini berlaku selama 2 menit:</p>
    <div class="otp-code">${otp}</div>
    <p>Jika Anda tidak meminta kode ini, silakan abaikan email ini atau hubungi tim dukungan kami.</p>
    <p>Terima kasih telah menggunakan layanan kami!</p>
    <div class="footer">
      <p>&copy; 2024 ISYARA. Semua hak dilindungi.</p>
    </div>
  </div>
</body>
</html>`;
};
