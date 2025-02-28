import { NextResponse } from "next/server"
import { getApiServices, addApiService } from "@/lib/db/queries"

export async function GET() {
  try {
    const services = await getApiServices()
    return NextResponse.json(services)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const service = await addApiService({
      name: body.name,
      wordLimit: body.wordLimit
    })
    return NextResponse.json(service)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
} 