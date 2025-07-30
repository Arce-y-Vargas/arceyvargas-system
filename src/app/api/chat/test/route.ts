import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ 
      status: 'OK',
      message: 'API del asistente funcionando correctamente',
      timestamp: new Date().toISOString(),
      hasOpenAI: !!process.env.OPENAI_API_KEY
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error en el test' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({ 
      status: 'OK',
      message: 'Test POST exitoso',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error en test POST' },
      { status: 500 }
    );
  }
}