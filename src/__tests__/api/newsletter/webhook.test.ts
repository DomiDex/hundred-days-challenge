import { POST } from '@/app/api/newsletter/webhook/route'
import {
  createMockRequest,
  expectJsonResponse,
  expectErrorResponse,
  setupTestEnv,
  cleanupTestEnv,
} from '@/test-utils/api'
import crypto from 'crypto'

// Mock console
const originalConsoleLog = console.log
const originalConsoleError = console.error

describe('POST /api/newsletter/webhook', () => {
  beforeAll(() => {
    console.log = jest.fn()
    console.error = jest.fn()
  })

  afterAll(() => {
    console.log = originalConsoleLog
    console.error = originalConsoleError
  })

  beforeEach(() => {
    setupTestEnv()
    jest.clearAllMocks()
  })

  afterEach(() => {
    cleanupTestEnv()
  })

  describe('Webhook Signature Verification', () => {
    beforeEach(() => {
      process.env.MAILCHIMP_WEBHOOK_KEY = 'test-webhook-key'
    })

    it('should accept valid webhook signature', async () => {
      const webhookData = {
        type: 'subscribe',
        data: {
          email: 'test@example.com',
          list_id: 'test-list',
        },
      }

      const body = JSON.stringify(webhookData)
      const signature = crypto.createHmac('sha256', 'test-webhook-key').update(body).digest('hex')

      const request = createMockRequest({
        method: 'POST',
        headers: {
          'x-mailchimp-signature': signature,
          'Content-Type': 'application/json',
        },
        body: webhookData,
      })

      const response = await POST(request)

      await expectJsonResponse(response, 200, { received: true })
    })

    it('should reject invalid webhook signature', async () => {
      const webhookData = {
        type: 'subscribe',
        data: {
          email: 'test@example.com',
        },
      }

      const request = createMockRequest({
        method: 'POST',
        headers: {
          'x-mailchimp-signature': 'invalid-signature',
          'Content-Type': 'application/json',
        },
        body: webhookData,
      })

      const response = await POST(request)

      await expectErrorResponse(response, 401, 'Invalid signature')
    })

    it('should process webhook without signature if webhook key not configured', async () => {
      delete process.env.MAILCHIMP_WEBHOOK_KEY

      const webhookData = {
        type: 'subscribe',
        data: {
          email: 'test@example.com',
        },
      }

      const request = createMockRequest({
        method: 'POST',
        body: webhookData,
      })

      const response = await POST(request)

      await expectJsonResponse(response, 200, { received: true })
    })
  })

  describe('Webhook Event Handling', () => {
    beforeEach(() => {
      delete process.env.MAILCHIMP_WEBHOOK_KEY // Skip signature verification for these tests
    })

    it('should handle subscribe events', async () => {
      const webhookData = {
        type: 'subscribe',
        data: {
          email: 'new@example.com',
          list_id: 'test-list',
          merges: {
            FNAME: 'John',
            LNAME: 'Doe',
          },
        },
      }

      const request = createMockRequest({
        method: 'POST',
        body: webhookData,
      })

      const response = await POST(request)

      await expectJsonResponse(response, 200, { received: true })

      expect(console.log).toHaveBeenCalledWith('New subscriber:', 'new@example.com')
    })

    it('should handle unsubscribe events', async () => {
      const webhookData = {
        type: 'unsubscribe',
        data: {
          email: 'unsubscribe@example.com',
          list_id: 'test-list',
          reason: 'manual',
        },
      }

      const request = createMockRequest({
        method: 'POST',
        body: webhookData,
      })

      const response = await POST(request)

      await expectJsonResponse(response, 200, { received: true })

      expect(console.log).toHaveBeenCalledWith('Unsubscribed:', 'unsubscribe@example.com')
    })

    it('should handle profile update events', async () => {
      const webhookData = {
        type: 'profile',
        data: {
          email: 'profile@example.com',
          list_id: 'test-list',
          merges: {
            FNAME: 'Jane',
            LNAME: 'Smith',
          },
        },
      }

      const request = createMockRequest({
        method: 'POST',
        body: webhookData,
      })

      const response = await POST(request)

      await expectJsonResponse(response, 200, { received: true })

      expect(console.log).toHaveBeenCalledWith('Profile updated:', 'profile@example.com')
    })

    it('should handle cleaned (bounced) email events', async () => {
      const webhookData = {
        type: 'cleaned',
        data: {
          email: 'bounced@example.com',
          list_id: 'test-list',
          reason: 'hard',
        },
      }

      const request = createMockRequest({
        method: 'POST',
        body: webhookData,
      })

      const response = await POST(request)

      await expectJsonResponse(response, 200, { received: true })

      expect(console.log).toHaveBeenCalledWith(
        'Email cleaned:',
        'bounced@example.com',
        'Reason:',
        'hard'
      )
    })

    it('should handle unknown webhook types', async () => {
      const webhookData = {
        type: 'unknown-type',
        data: {
          email: 'test@example.com',
        },
      }

      const request = createMockRequest({
        method: 'POST',
        body: webhookData,
      })

      const response = await POST(request)

      await expectJsonResponse(response, 200, { received: true })

      expect(console.log).toHaveBeenCalledWith('Unknown webhook type:', 'unknown-type')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid JSON data', async () => {
      const request = new Request('http://localhost:3000/api/newsletter/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid-json{]',
      })

      const response = await POST(request)

      await expectErrorResponse(response, 400, 'Invalid webhook data')

      expect(console.error).toHaveBeenCalledWith('Webhook processing error:', expect.any(Error))
    })

    it('should handle missing data field', async () => {
      const webhookData = {
        type: 'subscribe',
        // Missing data field
      }

      const request = createMockRequest({
        method: 'POST',
        body: webhookData,
      })

      const response = await POST(request)

      // Should still return success as the switch handles this gracefully
      await expectJsonResponse(response, 200, { received: true })
    })
  })

  describe('Webhook Data Structure', () => {
    it('should handle complex webhook data', async () => {
      const webhookData = {
        type: 'subscribe',
        fired_at: '2024-01-01 12:00:00',
        data: {
          id: 'abc123',
          email: 'complex@example.com',
          email_type: 'html',
          ip_opt: '192.168.1.1',
          web_id: '12345',
          list_id: 'test-list',
          merges: {
            EMAIL: 'complex@example.com',
            FNAME: 'Complex',
            LNAME: 'User',
            INTERESTS: 'Tech, Design',
          },
        },
      }

      const request = createMockRequest({
        method: 'POST',
        body: webhookData,
      })

      const response = await POST(request)

      await expectJsonResponse(response, 200, { received: true })
    })

    it('should handle batch webhook events', async () => {
      // Note: Current implementation doesn't handle batch events
      // This test documents expected behavior for single events
      const webhookData = {
        type: 'subscribe',
        data: {
          email: 'batch@example.com',
        },
      }

      const request = createMockRequest({
        method: 'POST',
        body: webhookData,
      })

      const response = await POST(request)

      await expectJsonResponse(response, 200, { received: true })
    })
  })
})
