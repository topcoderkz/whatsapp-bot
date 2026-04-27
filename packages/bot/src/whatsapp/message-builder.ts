// Build WhatsApp Cloud API payloads for different message types

export function buildTextPayload(to: string, text: string) {
  return {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  };
}

export function buildButtonPayload(
  to: string,
  bodyText: string,
  buttons: Array<{ id: string; title: string }>
) {
  return {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: bodyText },
      action: {
        buttons: buttons.map((b) => ({
          type: 'reply',
          reply: { id: b.id, title: b.title.slice(0, 20) },
        })),
      },
    },
  };
}

export function buildListPayload(
  to: string,
  bodyText: string,
  buttonText: string,
  sections: Array<{
    title?: string;
    rows: Array<{ id: string; title: string; description?: string }>;
  }>
) {
  return {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: bodyText },
      action: {
        button: buttonText.slice(0, 20),
        sections: sections.map((s) => ({
          title: s.title?.slice(0, 24),
          rows: s.rows.map((r) => ({
            id: r.id,
            title: r.title.slice(0, 24),
            description: r.description?.slice(0, 72),
          })),
        })),
      },
    },
  };
}

export function buildTemplatePayload(
  to: string,
  templateName: string,
  languageCode: string,
  bodyParams?: string[]
) {
  const payload: any = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
    },
  };

  if (bodyParams && bodyParams.length > 0) {
    payload.template.components = [
      {
        type: 'body',
        parameters: bodyParams.map((p) => ({ type: 'text', text: p })),
      },
    ];
  }

  return payload;
}

export function buildImagePayload(to: string, imageUrl: string, caption?: string) {
  return {
    messaging_product: 'whatsapp',
    to,
    type: 'image',
    image: {
      link: imageUrl,
      ...(caption && { caption }),
    },
  };
}
