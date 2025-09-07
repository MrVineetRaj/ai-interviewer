import React, { useState, type FormEvent } from "react";
import {
  getDocumentProxy,
  extractText,
  extractLinks,
  renderPageAsImage,
} from "unpdf";

export function PdfTextReader(): React.JSX.Element {
  const [text, setText] = useState<string>("");
  const [links, setLinks] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [image, setImage] = useState<string>("");

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    setLoading(true);
    setError("");
    setText("");
    setLinks([]);
    setImage("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Clone for text extraction
      const textPdf = new Uint8Array(uint8Array);

      // Clone for links extraction
      const linksPdf = new Uint8Array(uint8Array);

      // Clone for rendering
      const renderPdf = new Uint8Array(uint8Array);

      const { totalPages, text } = await extractText(
        await getDocumentProxy(textPdf),
        {
          mergePages: true,
        }
      );
      const { links } = await extractLinks(await getDocumentProxy(linksPdf));
      setText(text);
      setLinks(links);
      const imageDataUrl = await renderPageAsImage(renderPdf, 1, {
        scale: 2,
        toDataURL: true,
      });
      console.log("Rendered image data URL:", imageDataUrl);
      setImage(imageDataUrl);
    } catch (e: any) {
      setError("Could not parse PDF. " + e.message);
    }

    setLoading(false);
  };

  return (
    <div>
      <h2>PDF Text and Link Extractor</h2>
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => {
          handleFileChange(e.target.files ? e.target.files[0] : null);
        }}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="flex gap-4 mt-4">
        {image && (
          <div className="flex-1">
            <h3>Rendered Page 1</h3>
            <img
              src={image}
              alt="Rendered PDF Page"
              style={{ maxWidth: "50%" }}
            />
          </div>
        )}
        <div className="flex-1">
          {loading && <p>Loading...</p>}
          {text && (
            <div>
              <h3>Extracted Text</h3>
              <pre style={{ whiteSpace: "pre-wrap" }}>{text}</pre>
            </div>
          )}
          {links.length > 0 && (
            <div>
              <h3>Extracted Links</h3>
              <ul>
                {links.map((link, i) => (
                  <li key={i}>
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
