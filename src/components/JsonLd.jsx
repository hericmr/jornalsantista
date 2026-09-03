import React from 'react';

// Renderiza um bloco <script type="application/ld+json"> com dados estruturados
// (Schema.org). O Google lê JSON-LD em qualquer lugar do documento.
const JsonLd = ({ data }) => {
  if (!data) return null;
  const payload = Array.isArray(data) ? data : [data];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload.length === 1 ? payload[0] : payload) }}
    />
  );
};

export default JsonLd;
