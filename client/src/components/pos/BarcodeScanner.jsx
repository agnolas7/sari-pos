import { useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";

function BarcodeScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    // Only initialize if not already initialized
    if (scannerRef.current) return;

    console.log("🔧 Initializing barcode scanner...");

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
        ],
      },
      false,
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        console.log("✅ Barcode detected:", decodedText);
        scanner.clear();
        onScan(decodedText);
      },
      (error) => {
        // Silently ignore scan errors to reduce console spam
      },
    );

    console.log("✅ Scanner initialized successfully");

    return () => {
      console.log("🧹 Cleaning up scanner...");
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 16,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: 20,
          width: "100%",
          maxWidth: 400,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontWeight: 700, fontSize: 18 }}>📷 Scan Barcode</h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 22 }}
          >
            ✕
          </button>
        </div>

        <div id="reader" style={{ width: "100%" }} />

        <p
          style={{
            textAlign: "center",
            color: "#888",
            fontSize: 13,
            marginTop: 12,
          }}
        >
          Point camera at the barcode on the product
        </p>
      </div>
    </div>
  );
}

export default BarcodeScanner;
