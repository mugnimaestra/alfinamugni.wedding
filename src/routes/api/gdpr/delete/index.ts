/**
 * GDPR Data Deletion Endpoint
 * Allows users to request deletion of their personal data
 */

import type { RequestHandler } from "@builder.io/qwik-city"
import { deleteUserData } from "~/lib/gdpr"
import { z } from "zod"

const DeleteRequestSchema = z.object({
  email: z.string().email(),
  confirm: z.boolean().refine((val) => val === true, {
    message: "Konfirmasi penghapusan diperlukan",
  }),
})

export const onPost: RequestHandler = async ({ request, platform, json }) => {
  try {
    const body = await request.json()
    const { email, confirm } = DeleteRequestSchema.parse(body)

    if (!confirm) {
      return json(400, {
        success: false,
        message: "Konfirmasi penghapusan diperlukan",
      })
    }

    const env = platform.env
    if (!env?.DB) {
      return json(500, {
        success: false,
        message: "Database tidak tersedia",
      })
    }

    const result = await deleteUserData(env, email)

    return json(result.success ? 200 : 500, {
      success: result.success,
      message: result.message,
      deletedItems: result.deletedItems,
    })
  } catch (error) {
    console.error("Error deleting user data:", error)

    if (error instanceof z.ZodError) {
      return json(400, {
        success: false,
        message: "Data tidak valid",
        errors: error.errors,
      })
    }

    return json(500, {
      success: false,
      message: "Terjadi kesalahan saat menghapus data",
    })
  }
}
