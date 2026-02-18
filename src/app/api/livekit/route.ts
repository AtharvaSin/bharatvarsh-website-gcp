import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get('room') || 'default-room';
  const username = req.nextUrl.searchParams.get('username') || 'guest';

  if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
    return NextResponse.json(
      { error: 'Server misconfigured' },
      { status: 500 }
    );
  }

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: username,
      ttl: '10m',
    }
  );

  at.addGrant({ roomJoin: true, room: room, canPublish: true, canSubscribe: true });

  return NextResponse.json({ token: await at.toJwt() });
}
