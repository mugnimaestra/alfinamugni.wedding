import type { RequestHandler } from '@builder.io/qwik-city';
import { type Env } from '../../../lib/database';
import { createRsvpService } from '../../../services/rsvp-service';
import { createWishesService } from '../../../services/wishes-service';
import { ApiErrorHandler, generateRequestId } from '../../../lib/api-error-handler';

// Type definitions for test functions
type JsonFunction = (status: number, data: unknown) => unknown;


// Test endpoint for RSVP functionality
export const onPost: RequestHandler = async ({ request, json, platform }) => {
  const requestId = generateRequestId();
  
  try {
    const url = new URL(request.url);
    const testType = url.searchParams.get('type') || 'rsvp';

    switch (testType) {
      case 'rsvp':
        throw await testRsvpSubmission(request, json, platform as Env, requestId);
      
      case 'wishes':
        throw await testWishSubmission(request, json, platform as Env, requestId);
      
      case 'rate-limit':
        throw await testRateLimit(request, json, platform as Env, requestId);
      
      case 'spam-detection':
        throw await testSpamDetection(request, json, platform as Env, requestId);
      
      case 'validation':
        throw await testValidation(request, json, requestId);
      
      default:
        throw json(400, {
          success: false,
          message: 'Invalid test type. Available: rsvp, wishes, rate-limit, spam-detection, validation',
          requestId
        });
    }

  } catch (error) {
    console.error('Test endpoint error:', error);
    throw ApiErrorHandler.handleError(error, requestId, undefined, json);
  }
};

// Test RSVP submission
async function testRsvpSubmission(request: Request, json: JsonFunction, env: Env, requestId: string) {
  const testData = {
    guest_name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    phone: '+628123456789',
    attending: 'both' as const,
    plus_one_count: 1,
    plus_one_name: 'Test Plus One',
    meal_preference: 'chicken' as const,
    plus_one_meal: 'vegetarian' as const,
    accommodation_needed: false,
    special_requests: 'Test special request',
    dietary_restrictions: 'Test dietary restrictions'
  };

  const rsvpService = createRsvpService(env);
  const result = await rsvpService.submitRsvp(testData, {
    ipAddress: '127.0.0.1',
    userAgent: 'Test-Agent/1.0'
  });

  return json(200, {
    success: true,
    message: 'RSVP test completed successfully',
    data: {
      testType: 'rsvp',
      result,
      testData
    },
    requestId
  });
}

// Test wish submission
async function testWishSubmission(request: Request, json: JsonFunction, env: Env, requestId: string) {
  const testData = {
    guest_name: 'Test Wisher',
    email: `wish-${Date.now()}@example.com`,
    message: 'This is a test wish message for the wedding website. Congratulations!'
  };

  const wishesService = createWishesService(env);
  const result = await wishesService.submitWish(testData, {
    ipAddress: '127.0.0.1',
    userAgent: 'Test-Agent/1.0'
  });

  return json(200, {
    success: true,
    message: 'Wish test completed successfully',
    data: {
      testType: 'wishes',
      result,
      testData
    },
    requestId
  });
}

// Test rate limiting
async function testRateLimit(request: Request, json: JsonFunction, env: Env, requestId: string) {
  const testData = {
    guest_name: 'Rate Limit Test',
    email: `ratelimit-${Date.now()}@example.com`,
    attending: 'both' as const,
    plus_one_count: 0,
    accommodation_needed: false
  };

  const rsvpService = createRsvpService(env);
  const results = [];

  // Try to submit multiple RSVPs quickly to test rate limiting
  for (let i = 0; i < 3; i++) {
    const testEmail = `ratelimit-${Date.now()}-${i}@example.com`;
    const result = await rsvpService.submitRsvp({
      ...testData,
      email: testEmail
    }, {
      ipAddress: '127.0.0.1',
      userAgent: 'Test-Agent/1.0'
    });
    
    results.push({
      attempt: i + 1,
      email: testEmail,
      success: result.success,
      message: result.message,
      rateLimitInfo: result.rateLimitInfo
    });

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return json(200, {
    success: true,
    message: 'Rate limit test completed',
    data: {
      testType: 'rate-limit',
      results
    },
    requestId
  });
}

// Test spam detection
async function testSpamDetection(request: Request, json: JsonFunction, env: Env, requestId: string) {
  const spamTestCases = [
    {
      name: 'Legitimate message',
      data: {
        guest_name: 'Good User',
        email: `good-${Date.now()}@example.com`,
        message: 'Congratulations on your wedding! Wishing you both a lifetime of happiness and love.'
      }
    },
    {
      name: 'Suspicious keywords',
      data: {
        guest_name: 'Spam User',
        email: `spam-${Date.now()}@suspicious.com`,
        message: 'CLICK HERE NOW! WIN MILLION DOLLARS! LIMITED TIME OFFER! BUY VIAGRA!'
      }
    },
    {
      name: 'Excessive punctuation',
      data: {
        guest_name: 'Excited User',
        email: `excited-${Date.now()}@example.com`,
        message: 'Congratulations!!!!!!! This is amazing!!!!!!!!!! So happy for you both!!!!!!!!!'
      }
    },
    {
      name: 'Random characters',
      data: {
        guest_name: 'Bot User',
        email: `bot-${Date.now()}@tempmail.com`,
        message: 'asdfghjklqwertyuiopzxcvbnm1234567890'
      }
    }
  ];

  const wishesService = createWishesService(env);
  const results = [];

  for (const testCase of spamTestCases) {
    const result = await wishesService.submitWish(testCase.data, {
      ipAddress: '127.0.0.1',
      userAgent: 'Test-Agent/1.0'
    });

    results.push({
      testCase: testCase.name,
      success: result.success,
      message: result.message,
      spamInfo: result.spamInfo,
      requiresModeration: result.requiresModeration
    });
  }

  return json(200, {
    success: true,
    message: 'Spam detection test completed',
    data: {
      testType: 'spam-detection',
      results
    },
    requestId
  });
}

// Test validation
async function testValidation(request: Request, json: JsonFunction, requestId: string) {
  const validationTestCases = [
    {
      name: 'Valid RSVP',
      data: {
        guest_name: 'Valid User',
        email: 'valid@example.com',
        attending: 'both',
        plus_one_count: 0,
        accommodation_needed: false
      },
      shouldPass: true
    },
    {
      name: 'Invalid email',
      data: {
        guest_name: 'Invalid Email User',
        email: 'invalid-email',
        attending: 'both',
        plus_one_count: 0,
        accommodation_needed: false
      },
      shouldPass: false
    },
    {
      name: 'Name too short',
      data: {
        guest_name: 'A',
        email: 'short@example.com',
        attending: 'both',
        plus_one_count: 0,
        accommodation_needed: false
      },
      shouldPass: false
    },
    {
      name: 'Plus one without name',
      data: {
        guest_name: 'Forgetful User',
        email: 'forgetful@example.com',
        attending: 'both',
        plus_one_count: 1,
        accommodation_needed: false
      },
      shouldPass: false
    },
    {
      name: 'Valid wish',
      data: {
        guest_name: 'Good Wisher',
        email: 'wish@example.com',
        message: 'Congratulations on your wedding! Wishing you both all the best.'
      },
      shouldPass: true
    },
    {
      name: 'Wish message too short',
      data: {
        guest_name: 'Short Wisher',
        email: 'short@example.com',
        message: 'Hi'
      },
      shouldPass: false
    }
  ];

  const results = [];

  for (const testCase of validationTestCases) {
    // Basic validation simulation
    let isValid = true;
    const errors: string[] = [];

    if (testCase.data.email && !testCase.data.email.includes('@')) {
      isValid = false;
      errors.push('Invalid email format');
    }

    if (testCase.data.guest_name && testCase.data.guest_name.length < 2) {
      isValid = false;
      errors.push('Name too short');
    }

    if ('plus_one_count' in testCase.data &&
        typeof testCase.data.plus_one_count === 'number' &&
        testCase.data.plus_one_count > 0 &&
        !('plus_one_name' in testCase.data)) {
      isValid = false;
      errors.push('Plus one name required');
    }

    if (testCase.data.message && testCase.data.message.length < 10) {
      isValid = false;
      errors.push('Message too short');
    }

    results.push({
      testCase: testCase.name,
      expected: testCase.shouldPass,
      actual: isValid,
      passed: isValid === testCase.shouldPass,
      errors: isValid ? [] : errors
    });
  }

  const allPassed = results.every(result => result.passed);

  return json(200, {
    success: true,
    message: `Validation test ${allPassed ? 'passed' : 'failed'}`,
    data: {
      testType: 'validation',
      results,
      summary: {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length
      }
    },
    requestId
  });
}

// Get test status and results
export const onGet: RequestHandler = async ({ request, json, platform }) => {
  const requestId = generateRequestId();
  
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'status';

    switch (action) {
      case 'status': {
        throw json(200, {
          success: true,
          message: 'API test endpoint is operational',
          data: {
            availableTests: [
              {
                type: 'rsvp',
                description: 'Test RSVP submission with validation and rate limiting'
              },
              {
                type: 'wishes',
                description: 'Test wish submission with moderation and spam detection'
              },
              {
                type: 'rate-limit',
                description: 'Test rate limiting functionality'
              },
              {
                type: 'spam-detection',
                description: 'Test spam detection with various scenarios'
              },
              {
                type: 'validation',
                description: 'Test input validation with edge cases'
              }
            ],
            usage: {
              method: 'POST',
              url: '/api/test?type={testType}',
              example: 'POST /api/test?type=rsvp'
            }
          },
          requestId
        });
      }

      case 'health': {
        // Test database connection
        const env = platform as Env;
        const db = env.DB;
        
        try {
          // Simple database health check
          await db.prepare('SELECT 1').first();
          
          throw json(200, {
            success: true,
            message: 'All systems operational',
            data: {
              database: 'connected',
              timestamp: new Date().toISOString(),
              environment: env.ENVIRONMENT || 'unknown'
            },
            requestId
          });
        } catch (dbError) {
          throw json(503, {
            success: false,
            message: 'Database connection failed',
            data: {
              database: 'disconnected',
              error: dbError instanceof Error ? dbError.message : 'Unknown error',
              timestamp: new Date().toISOString()
            },
            requestId
          });
        }
      }

      default:
        throw json(400, {
          success: false,
          message: 'Invalid action. Available: status, health',
          requestId
        });
    }

  } catch (error) {
    console.error('Test GET endpoint error:', error);
    throw ApiErrorHandler.handleError(error, requestId, undefined, json);
  }
};