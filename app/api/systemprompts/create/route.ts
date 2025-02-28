import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { createSystemPrompt } from '@/lib/db/queries';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await req.json();
    const { name, prompt } = json;

    if (!name || !prompt) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const systemPrompt = await createSystemPrompt({
      name,
      prompt,
      userId: session.user.id,
    });

    return NextResponse.json(systemPrompt);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 