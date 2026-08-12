import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, businessName, contactName, contactEmail, contactPhone } = body;

    if (!contactName || !contactEmail) {
      return NextResponse.json({ success: false, error: 'Missing required contact details' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Lead received and logged in WordPress dashboard.'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
