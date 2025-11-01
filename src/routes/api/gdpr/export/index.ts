/**
 * GDPR Data Export Endpoint
 * Allows users to download their personal data
 */

import type { RequestHandler } from "@builder.io/qwik-city"
import { exportUserData } from "~/lib/gdpr"
import { z } from "zod"

const ExportRequestSchema = z.object({
  email: z.string().email(),
})

export const onPost: RequestHandler = async ({ request, platform, json }) => {
  try {
    const body = await request.json()
    const { email } = ExportRequestSchema.parse(body)

    const env = platform.env
    if (!env?.DB) {
      return json(500, {
        success: false,
        message: "Database tidak tersedia",
      })
    }

    const result = await exportUserData(env, email)

    if (!result.success) {
      return json(500, {
        success: false,
        message: result.message,
      })
    }

    // Return the data as JSON
    return json(200, {
      success: true,
      message: result.message,
      data: result.data,
    })
  } catch (error) {
    console.error("Error exporting user data:", error)

    if (error instanceof z.ZodError) {
      return json(400, {
        success: false,
        message: "Format email tidak valid",
        errors: error.errors,
      })
    }

    return json(500, {
      success: false,
      message: "Terjadi kesalahan saat mengekspor data",
    })
  }
}
