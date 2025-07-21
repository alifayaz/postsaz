import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const imageUrl = searchParams.get("url")

        if (!imageUrl) {
            return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
        }

        console.log("🔄 Proxying image:", imageUrl)

        const response = await fetch(imageUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
        })

        if (!response.ok) {
            console.error("❌ Failed to fetch image:", response.status, response.statusText)
            return NextResponse.json({ error: "Failed to fetch image" }, { status: response.status })
        }

        const imageBuffer = await response.arrayBuffer()
        const contentType = response.headers.get("content-type") || "image/png"

        console.log("✅ Image proxied successfully, size:", imageBuffer.byteLength)

        return new NextResponse(imageBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000",
                "Access-Control-Allow-Origin": "*",
            },
        })
    } catch (error) {
        console.error("❌ Image proxy error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
