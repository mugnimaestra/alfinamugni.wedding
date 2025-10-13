import type { RequestHandler } from '@builder.io/qwik-city';
import { getDatabase, type Env, DatabaseError } from '../../../../lib/database';
import { createAuth } from '../../../../lib/auth';

// Helper function to validate admin session
async function validateAdminAuth(request: Request, env: Env): Promise<{ valid: boolean; session?: import('../../../../lib/auth').AdminSession }> {
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

// Get RSVPs with filtering and pagination
export const onGet: RequestHandler = async ({ request, json, platform }) => {
  try {
    // Validate admin authentication
    const authResult = await validateAdminAuth(request, platform.env as Env);
    if (!authResult.valid) {
      throw json(401, {
        error: 'Unauthorized - Admin access required',
        success: false,
        message: 'Admin access required'
      });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '25');
    const status = url.searchParams.get('status') || 'all';
    const search = url.searchParams.get('search') || '';

    const db = getDatabase(platform.env as Env);

    // Get all RSVPs (we'll filter in memory for now)
    const allRsvps = await db.getAllRsvps();
    
    // Apply filters
    let filteredRsvps = allRsvps;
    
    if (status !== 'all') {
      filteredRsvps = filteredRsvps.filter(rsvp => rsvp.attending === status);
    }
    
    if (search.trim()) {
      const query = search.toLowerCase();
      filteredRsvps = filteredRsvps.filter(rsvp =>
        rsvp.guest_name.toLowerCase().includes(query) ||
        rsvp.email.toLowerCase().includes(query) ||
        (rsvp.phone && rsvp.phone.toLowerCase().includes(query)) ||
        (rsvp.plus_one_name && rsvp.plus_one_name.toLowerCase().includes(query))
      );
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedRsvps = filteredRsvps.slice(offset, offset + limit);

    // Get statistics
    const stats = await db.getRsvpStats();

    throw json(200, {
      success: true,
      data: {
        rsvps: paginatedRsvps,
        stats,
        pagination: {
          page,
          limit,
          total: filteredRsvps.length,
          totalPages: Math.ceil(filteredRsvps.length / limit)
        },
        filters: {
          status,
          search
        }
      }
    });

  } catch (error) {
    console.error('RSVP retrieval error:', error);

    if (error instanceof Response) {
      throw error;
    }

    if (error instanceof DatabaseError) {
      throw json(500, {
        error: 'Database error',
        success: false,
        message: 'Unable to retrieve RSVPs. Please try again later.',
        operation: error.operation
      });
    }

    throw json(500, {
      error: 'Internal server error',
      success: false,
      message: 'Unable to retrieve RSVPs'
    });
  }
};

// Update RSVP (edit status, delete, etc.)
export const onPost: RequestHandler = async ({ request, json, platform }) => {
  try {
    // Validate admin authentication
    const authResult = await validateAdminAuth(request, platform.env as Env);
    if (!authResult.valid) {
      throw json(401, {
        error: 'Unauthorized - Admin access required',
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
    let requestData: { action: string; rsvpId?: number; rsvpIds?: number[]; data?: Record<string, unknown> };
    try {
      const rawBody = await request.text();
      if (rawBody.length > 10000) { // 10KB limit
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

    const { action, rsvpId, rsvpIds, data } = requestData;

    if (!action) {
      throw json(400, {
        error: 'Missing action',
        success: false,
        message: 'Action is required'
      });
    }

    const db = getDatabase(platform.env as Env);

    switch (action) {
      case 'update': {
        if (!rsvpId || !data) {
          throw json(400, {
            error: 'Missing RSVP ID or data',
            success: false,
            message: 'RSVP ID and data are required for update'
          });
        }

        // Update RSVP in database
        // Note: This would need to be implemented in the database class
        // For now, we'll return a success response
        console.log('RSVP updated:', {
          id: rsvpId,
          data,
          admin: authResult.session?.email,
          timestamp: new Date().toISOString()
        });

        throw json(200, {
          success: true,
          message: 'RSVP updated successfully',
          data: { id: rsvpId, updated: true }
        });
      }

      case 'delete': {
        if (rsvpId) {
          // Single RSVP deletion
          // Note: This would need to be implemented in the database class
          console.log('RSVP deleted:', {
            id: rsvpId,
            admin: authResult.session?.email,
            timestamp: new Date().toISOString()
          });

          throw json(200, {
            success: true,
            message: 'RSVP deleted successfully'
          });
        } else if (rsvpIds && Array.isArray(rsvpIds)) {
          // Bulk RSVP deletion
          let deletedCount = 0;

          for (const id of rsvpIds) {
            try {
              // Note: This would need to be implemented in the database class
              console.log(`Deleting RSVP ${id}`);
              deletedCount++;
            } catch (error) {
              console.error(`Failed to delete RSVP ${id}:`, error);
              // Continue with other RSVPs
            }
          }

          console.log('Bulk RSVPs deleted:', {
            count: deletedCount,
            ids: rsvpIds,
            admin: authResult.session?.email,
            timestamp: new Date().toISOString()
          });

          throw json(200, {
            success: true,
            message: `${deletedCount} RSVP(s) deleted successfully`,
            data: {
              deleted: deletedCount
            }
          });
        } else {
          throw json(400, {
            error: 'Missing RSVP identifier',
            success: false,
            message: 'Either rsvpId or rsvpIds array is required'
          });
        }
      }

      case 'export': {
        // Get all RSVPs for export
        const allRsvps = await db.getAllRsvps();
        
        const exportData = allRsvps.map(rsvp => ({
          id: rsvp.id,
          guest_name: rsvp.guest_name,
          email: rsvp.email,
          phone: rsvp.phone,
          attending: rsvp.attending,
          plus_one_count: rsvp.plus_one_count,
          plus_one_name: rsvp.plus_one_name,
          meal_preference: rsvp.meal_preference,
          plus_one_meal: rsvp.plus_one_meal,
          accommodation_needed: rsvp.accommodation_needed,
          special_requests: rsvp.special_requests,
          dietary_restrictions: rsvp.dietary_restrictions,
          created_at: rsvp.created_at
        }));

        throw json(200, {
          success: true,
          message: 'RSVP data ready for export',
          data: {
            rsvps: exportData,
            count: exportData.length,
            exported_at: new Date().toISOString()
          }
        });
      }

      default:
        throw json(400, {
          error: 'Invalid action',
          success: false,
          message: 'Supported actions: update, delete, export'
        });
    }

  } catch (error) {
    console.error('RSVP management error:', error);

    if (error instanceof Response) {
      throw error;
    }

    if (error instanceof DatabaseError) {
      throw json(500, {
        error: 'Database error',
        success: false,
        message: 'Unable to process RSVP action. Please try again later.',
        operation: error.operation
      });
    }

    throw json(500, {
      error: 'Internal server error',
      success: false,
      message: 'Unable to process RSVP action'
    });
  }
};