async function saveQRCode(sessionName, base64Qr) {
  var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (matches.length !== 3) {
    throw new Error("Invalid input string");
  }
  const buffer = Buffer.from(matches[2], "base64");
  require("fs").writeFile(
    `./qrImages/qr-${sessionName}.png`,
    buffer,
    "binary",
    (err) => {
      if (err) {
        console.error("Erro ao salvar QR code como imagem:", err);
      }
    }
  );
}

module.exports = { saveQRCode };
