export default function handler(req, res) {
  return res.status(200).json({
    success: true,
    message: "Mendak is alive!",
    version: "1.0.0"
  });
}
