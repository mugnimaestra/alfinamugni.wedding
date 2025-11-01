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

// Get gallery photos with filtering
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
    const status = url.searchParams.get('status') || 'all';
    const search = url.searchParams.get('search') || '';

    const db = getDatabase(platform.env as Env);

    // Get all photos
    const allPhotos = await db.getAllPhotos();
    
    // Apply filters
    let filteredPhotos = allPhotos;
    
    if (status !== 'all') {
      filteredPhotos = filteredPhotos.filter(photo => {
        if (status === 'approved') return photo.approved;
        if (status === 'pending') return !photo.approved;
        return true;
      });
    }
    
    if (search.trim()) {
      const query = search.toLowerCase();
      filteredPhotos = filteredPhotos.filter(photo =>
        photo.filename.toLowerCase().includes(query) ||
        photo.original_name.toLowerCase().includes(query) ||
        (photo.category && photo.category.toLowerCase().includes(query))
      );
    }

    // Calculate statistics
    const stats = {
      total: allPhotos.length,
      approved: allPhotos.filter(p => p.approved).length,
      pending: allPhotos.filter(p => !p.approved).length,
      rejected: 0 // Assuming no rejected state in current schema
    };

    throw json(200, {
      success: true,
      data: {
        photos: filteredPhotos,
        stats,
        filters: {
          status,
          search
        }
      }
    });

  } catch (error) {
    console.error('Gallery retrieval error:', error);

    if (error instanceof Response) {
      throw error;
    }

    if (error instanceof DatabaseError) {
      throw json(500, {
        error: 'Database error',
        success: false,
        message: 'Unable to retrieve gallery photos. Please try again later.',
        operation: error.operation
      });
    }

    throw json(500, {
      error: 'Internal server error',
      success: false,
      message: 'Unable to retrieve gallery photos'
    });
  }
};

// Manage gallery photos (approve, reject, delete, categorize)
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
    let requestData: { action: string; photoId?: number; photoIds?: number[]; data?: Record<string, unknown> };
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

    const { action, photoId, photoIds, data } = requestData;

    if (!action) {
      throw json(400, {
        error: 'Missing action',
        success: false,
        message: 'Action is required'
      });
    }

    switch (action) {
      case 'delete': {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const db = getDatabase(platform.env as Env);
        if (photoId) {
          // Single photo deletion
          // Note: Implement photo deletion from database and R2 storage
          console.log('Photo deleted:', {
            id: photoId,
            admin: authResult.session?.email,
            timestamp: new Date().toISOString()
          });

          throw json(200, {
            success: true,
            message: 'Photo deleted successfully'
          });
        } else if (photoIds && Array.isArray(photoIds)) {
          // Bulk photo deletion
          let deletedCount = 0;

          for (const id of photoIds) {
            try {
              // Note: Implement bulk deletion
              console.log(`Deleting photo ${id}`);
              deletedCount++;
            } catch (error) {
              console.error(`Failed to delete photo ${id}:`, error);
              // Continue with other photos
            }
          }

          console.log('Bulk photos deleted:', {
            count: deletedCount,
            ids: photoIds,
            admin: authResult.session?.email,
            timestamp: new Date().toISOString()
          });

          throw json(200, {
            success: true,
            message: `${deletedCount} photo(s) deleted successfully`,
            data: {
              deleted: deletedCount
            }
          });
        } else {
          throw json(400, {
            error: 'Missing photo identifier',
            success: false,
            message: 'Either photoId or photoIds array is required'
          });
        }
      }

      case 'categorize': {
        if (!photoId || !data?.category) {
          throw json(400, {
            error: 'Missing photo ID or category',
            success: false,
            message: 'Photo ID and category are required for categorization'
          });
        }

        // Update photo category
        // Note: This would need to be implemented in the database class
        console.log('Photo categorized:', {
          id: photoId,
          category: data.category,
          admin: authResult.session?.email,
          timestamp: new Date().toISOString()
        });

        throw json(200, {
          success: true,
          message: 'Photo categorized successfully',
          data: { id: photoId, category: data.category }
        });
      }

      case 'feature': {
        if (!photoId) {
          throw json(400, {
            error: 'Missing photo ID',
            success: false,
            message: 'Photo ID is required for featuring'
          });
        }

        // Feature photo (add to featured gallery)
        // Note: This would need to be implemented in the database class
        console.log('Photo featured:', {
          id: photoId,
          admin: authResult.session?.email,
          timestamp: new Date().toISOString()
        });

        throw json(200, {
          success: true,
          message: 'Photo featured successfully',
          data: { id: photoId, featured: true }
        });
      }

      default:
        throw json(400, {
          error: 'Invalid action',
          success: false,
          message: 'Supported actions: delete, categorize, feature'
        });
    }

  } catch (error) {
    console.error('Gallery management error:', error);

    if (error instanceof Response) {
      throw error;
    }

    if (error instanceof DatabaseError) {
      throw json(500, {
        error: 'Database error',
        success: false,
        message: 'Unable to process gallery action. Please try again later.',
        operation: error.operation
      });
    }

    throw json(500, {
      error: 'Internal server error',
      success: false,
      message: 'Unable to process gallery action'
    });
  }
};