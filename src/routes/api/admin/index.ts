import type { RequestHandler } from '@builder.io/qwik-city';
import { getDatabase, type Env } from '../../../lib/database';
import { createAuth } from '../../../lib/auth';

// Helper function to validate admin session
async function validateAdminAuth(request: Request, env: Env): Promise<{ valid: boolean; session?: import('../../../lib/auth').AdminSession }> {
  try {
    const auth = createAuth(env);
    
    // Get session cookie
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return { valid: false };
    }

    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(cookie => {
        const [name, value] = cookie.trim().split('=');
        return [name, value];
      })
    );

    const sessionId = cookies['admin-session'];
    if (!sessionId) {
      return { valid: false };
    }

    return await auth.validateSession(sessionId);
  } catch (error) {
    console.error('Auth validation error:', error);
    return { valid: false };
  }
}

// Admin dashboard statistics and management
export const onGet: RequestHandler = async ({ request, json, platform }) => {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    // Validate admin authentication
    const authResult = await validateAdminAuth(request, platform.env as Env);
    if (!authResult.valid) {
      throw json(401, {
        error: 'Unauthorized - Admin access required',
        success: false
      });
    }

    const db = getDatabase(platform.env as Env);

    switch (action) {
      case 'stats': {
        // Get comprehensive wedding statistics
        const rsvpStats = await db.getRsvpStats();
        const allRsvps = await db.getAllRsvps();
        const allWishes = await db.getAllWishes();
        const allPhotos = await db.getAllPhotos();

        const stats = {
          rsvp: {
            ...rsvpStats,
            pending_wishes: allWishes.filter(w => !w.approved).length,
            total_wishes: allWishes.length,
            pending_photos: allPhotos.filter(p => !p.approved).length,
            total_photos: allPhotos.length
          },
          recent_activity: {
            recent_rsvps: allRsvps.slice(0, 5).map(rsvp => ({
              id: rsvp.id,
              guest_name: rsvp.guest_name,
              attending: rsvp.attending,
              plus_one_count: rsvp.plus_one_count,
              created_at: rsvp.created_at
            })),
            recent_wishes: allWishes.slice(0, 5).map(wish => ({
              id: wish.id,
              guest_name: wish.guest_name,
              message: wish.message.length > 50 ? wish.message.substring(0, 50) + '...' : wish.message,
              approved: wish.approved,
              created_at: wish.created_at
            })),
            recent_photos: allPhotos.slice(0, 5).map(photo => ({
              id: photo.id,
              filename: photo.filename,
              original_name: photo.original_name,
              category: photo.category,
              approved: photo.approved,
              upload_date: photo.upload_date
            }))
          }
        };

        throw json(200, {
          success: true,
          data: stats
        });
      }

      case 'rsvps': {
        const rsvps = await db.getAllRsvps();
        throw json(200, {
          success: true,
          data: rsvps
        });
      }

      case 'wishes': {
        const wishes = await db.getAllWishes();
        throw json(200, {
          success: true,
          data: wishes
        });
      }

      case 'photos': {
        const photos = await db.getAllPhotos();
        throw json(200, {
          success: true,
          data: photos
        });
      }

      default:
        throw json(400, {
          error: 'Invalid action. Supported actions: stats, rsvps, wishes, photos',
          success: false
        });
    }

  } catch (error) {
    console.error('Admin API error:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw json(500, {
      error: 'Internal server error',
      success: false
    });
  }
};

// Admin actions (approve/reject content)
export const onPost: RequestHandler = async ({ request, json, platform }) => {
  try {
    // Validate admin authentication
    const authResult = await validateAdminAuth(request, platform.env as Env);
    if (!authResult.valid) {
      throw json(401, {
        error: 'Unauthorized - Admin access required',
        success: false
      });
    }

    const { action, type, id } = await request.json();

    if (!action || !type || !id) {
      throw json(400, {
        error: 'Missing required fields: action, type, id',
        success: false
      });
    }

    const db = getDatabase(platform.env as Env);

    if (type === 'wish' && action === 'approve') {
      const wish = await db.approveWish(parseInt(id));
      throw json(200, {
        success: true,
        message: 'Wish approved successfully',
        data: wish
      });
    }

    if (type === 'photo' && action === 'approve') {
      const photo = await db.approvePhoto(parseInt(id), 'admin');
      throw json(200, {
        success: true,
        message: 'Photo approved successfully',
        data: photo
      });
    }

    throw json(400, {
      error: 'Invalid action or type combination',
      success: false
    });

  } catch (error) {
    console.error('Admin action error:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw json(500, {
      error: 'Internal server error',
      success: false
    });
  }
};