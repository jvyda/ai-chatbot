import { NextResponse } from "next/server"
import { getApiKeysByServiceId, addApiKey } from "@/lib/db/queries"
import { auth } from '@/app/(auth)/auth';

export async function GET(
  req: Request,
  { params }: { params: { serviceId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const keys = await getApiKeysByServiceId({
      serviceId: params.serviceId,
      userId: session.user.id
    })
    return NextResponse.json(keys)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch keys" }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { serviceId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const key = await addApiKey({
      serviceId: params.serviceId,
      userId: session.user.id,
      key: body.key,
      name: body.name
    })
    
    return NextResponse.json(key)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create key" }, { status: 500 })
  }
} 