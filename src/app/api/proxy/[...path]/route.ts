// =============================================================================
// JAYARAM MITTAI ECOMMERCE PLATFORM — BACKEND PROXY
// Forwards every /api/proxy/* call to the real NestJS backend (BACKEND_API_URL).
// Keeps the browser same-origin (no CORS dependency on the backend) and keeps
// the backend's real address out of the client bundle.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

async function forward(req: NextRequest, path: string[]) {
  const targetUrl = `${BACKEND_API_URL}/${path.join('/')}${req.nextUrl.search}`;

  const headers = new Headers();
  const contentType = req.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  const authorization = req.headers.get('authorization');
  if (authorization) headers.set('authorization', authorization);

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: hasBody ? await req.text() : undefined,
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json(
      { message: 'Could not reach the backend server. Please try again.', error: 'Bad Gateway', statusCode: 502 },
      { status: 502 }
    );
  }

  const responseText = await upstreamRes.text();
  const responseContentType = upstreamRes.headers.get('content-type') || 'application/json';

  return new NextResponse(responseText, {
    status: upstreamRes.status,
    headers: { 'content-type': responseContentType },
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return forward(req, (await params).path);
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return forward(req, (await params).path);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return forward(req, (await params).path);
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return forward(req, (await params).path);
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return forward(req, (await params).path);
}
