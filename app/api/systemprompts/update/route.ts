import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { updateSystemPromptById } from '@/lib/db/queries';



export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const { id, name, prompt } = json;

    if (!id || !name || !prompt) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    try {
        const systemPrompt = await updateSystemPromptById({ id, name, prompt, userId: session.user.id });

        return NextResponse.json(systemPrompt);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
