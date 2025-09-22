import type { RequestHandler } from '@builder.io/qwik-city';
import { getDatabase, type Env, DatabaseError } from '../../../../lib/database';

// Admin wishes management actions (approve, flag, delete)
export const onPost: RequestHandler = async ({ request, json, platform }) => {
  try {
    // TODO: Add proper authentication check in Phase 2
    if ((platform.env as Env).ENVIRONMENT !== 'development') {
      throw json(401, {
        error: 'Unauthorized',
        success: false,
        message: 'Admin access required'
      });
    }

    // Parse and validate content-type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw json(400, {
        error: 'Invalid content-type',
        success: false,
        message: 'Request must be application/json'
      });
    }

    // Parse request body
    let requestData: { action: string; wishId?: number; wishIds?: number[] };
    try {
      const rawBody = await request.text();
      if (rawBody.length > 5000) { // 5KB limit for wish actions
        throw new Error('Request body too large');
      }
      requestData = JSON.parse(rawBody);
    } catch {
      throw json(400, {
        error: 'Invalid JSON',
        success: false,
        message: 'Request body must be valid JSON'
      });
    }

    const { action, wishId, wishIds } = requestData;

    if (!action) {
      throw json(400, {
        error: 'Missing action',
        success: false,
        message: 'Action is required'
      });
    }

    const db = getDatabase(platform.env as Env);

    switch (action) {
      case 'approve': {
        if (wishId) {
          // Single wish approval
          const wish = await db.approveWish(wishId);

          console.log('Wish approved:', {
            id: wishId,
            guest: wish.guest_name,
            timestamp: new Date().toISOString()
          });

          throw json(200, {
            success: true,
            message: 'Wish approved successfully',
            data: wish
          });
        } else if (wishIds && Array.isArray(wishIds)) {
          // Bulk wish approval
          const approvedWishes = [];

          for (const id of wishIds) {
            try {
              const wish = await db.approveWish(id);
              approvedWishes.push(wish);
            } catch (error) {
              console.error(`Failed to approve wish ${id}:`, error);
              // Continue with other wishes
            }
          }

          console.log('Bulk wishes approved:', {
            count: approvedWishes.length,
            ids: wishIds,
            timestamp: new Date().toISOString()
          });

          throw json(200, {
            success: true,
            message: `${approvedWishes.length} wish(es) approved successfully`,
            data: {
              approved: approvedWishes,
              count: approvedWishes.length
            }
          });
        } else {
          throw json(400, {
            error: 'Missing wish identifier',
            success: false,
            message: 'Either wishId or wishIds array is required'
          });
        }
      }

      case 'delete': {
        if (wishId) {
          // Single wish deletion
          await db.deleteWish(wishId);

          console.log('Wish deleted:', {
            id: wishId,
            timestamp: new Date().toISOString()
          });

          throw json(200, {
            success: true,
            message: 'Wish deleted successfully'
          });
        } else if (wishIds && Array.isArray(wishIds)) {
          // Bulk wish deletion
          let deletedCount = 0;

          for (const id of wishIds) {
            try {
              await db.deleteWish(id);
              deletedCount++;
            } catch (error) {
              console.error(`Failed to delete wish ${id}:`, error);
              // Continue with other wishes
            }
          }

          console.log('Bulk wishes deleted:', {
            count: deletedCount,
            ids: wishIds,
            timestamp: new Date().toISOString()
          });

          throw json(200, {
            success: true,
            message: `${deletedCount} wish(es) deleted successfully`,
            data: {
              deleted: deletedCount
            }
          });
        } else {
          throw json(400, {
            error: 'Missing wish identifier',
            success: false,
            message: 'Either wishId or wishIds array is required'
          });
        }
      }

      case 'flag': {
        if (!wishId) {
          throw json(400, {
            error: 'Missing wish ID',
            success: false,
            message: 'wishId is required for flagging'
          });
        }

        // For now, flagging just logs the action
        // In the future, this could mark wishes for special review
        const wish = await db.getWishById(wishId);

        console.log('Wish flagged for review:', {
          id: wishId,
          guest: wish?.guest_name,
          message: wish?.message?.substring(0, 100) + (wish?.message?.length && wish?.message?.length > 100 ? '...' : ''),
          timestamp: new Date().toISOString()
        });

        throw json(200, {
          success: true,
          message: 'Wish flagged for review',
          data: {
            flagged: true,
            wishId: wishId
          }
        });
      }

      default:
        throw json(400, {
          error: 'Invalid action',
          success: false,
          message: 'Supported actions: approve, delete, flag'
        });
    }

  } catch (error) {
    console.error('Wishes management error:', error);

    if (error instanceof Response) {
      throw error;
    }

    if (error instanceof DatabaseError) {
      throw json(500, {
        error: 'Database error',
        success: false,
        message: 'Unable to process wish action. Please try again later.',
        operation: error.operation
      });
    }

    throw json(500, {
      error: 'Internal server error',
      success: false,
      message: 'Unable to process wish action'
    });
  }
};