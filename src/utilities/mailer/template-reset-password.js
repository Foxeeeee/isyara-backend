export const resetPasswordTemplate = (names, link) => {
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
    .button {
      display: block;
      width: fit-content;
      margin: 20px auto;
      padding: 10px 20px;
      background-color: #2c7df0;
      color: #ffffff;
      text-decoration: none;
      font-size: 16px;
      font-weight: bold;
      border-radius: 4px;
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
    <p>Kami menerima permintaan untuk mengatur ulang kata sandi Anda. Klik tombol di bawah untuk melanjutkan:</p>
    <a href="${link}" class="button">Atur Ulang Kata Sandi</a>
    <p>Jika Anda tidak meminta pengaturan ulang kata sandi, silakan abaikan email ini atau hubungi tim dukungan kami.</p>
    <p>Demi keamanan Anda, tautan ini akan kedaluwarsa dalam 1 jam.</p>
    <div class="footer">
      <p>&copy; 2024 ISYARA. Semua hak dilindungi.</p>
    </div>
  </div>
</body>
</html>`;
};
