export function sendJson(response, statusCode, payload) {
  response.status(statusCode).json(payload);
}

export function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export function readBearerToken(request) {
  const header = request.headers.authorization || request.headers.Authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim() || null;
}

export async function readJsonBody(request, options = {}) {
  const { maxBytes = 16 * 1024 } = options;

  const contentTypeHeader = request.headers['content-type'] || request.headers['Content-Type'] || '';
  const contentType = contentTypeHeader.split(';')[0].trim().toLowerCase();

  if (contentType && contentType !== 'application/json') {
    throw createHttpError(415, 'Content-Type must be application/json');
  }

  if (request.body && typeof request.body === 'object') {
    return request.body;
  }

  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.length;
    if (totalBytes > maxBytes) {
      throw createHttpError(413, 'Request body is too large');
    }
    chunks.push(buffer);
  }

  if (chunks.length === 0) return {};
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    throw createHttpError(400, 'Request body must be valid JSON');
  }
}
