import { POST } from '@/app/api/newsletter/subscribe/route'
import {
  createMockRequest,
  expectJsonResponse,
  setupTestEnv,
  cleanupTestEnv,
} from '@/test-utils/api'
import mailchimp from '@/lib/mailchimp'
import crypto from 'crypto'

// Mock dependencies
jest.mock('@/lib/mailchimp', () => ({
  __esModule: true,
  default: {
    lists: {
      getListMember: jest.fn(),
      updateListMember: jest.fn(),
      addListMember: jest.fn(),
    },
  },
}))

// Mock console
const originalConsoleError = console.error
const originalConsoleLog = console.log

describe('POST /api/newsletter/subscribe', () => {
  beforeAll(() => {
    console.error = jest.fn()
    console.log = jest.fn()
  })

  afterAll(() => {
    console.error = originalConsoleError
    console.log = originalConsoleLog
  })

  beforeEach(() => {
    setupTestEnv({
      MAILCHIMP_API_KEY: 'test-api-key',
      MAILCHIMP_LIST_ID: 'test-list-id',
      MAILCHIMP_SERVER_PREFIX: 'us1',
    })
    jest.clearAllMocks()
  })

  afterEach(() => {
    cleanupTestEnv()
  })

  describe('Email Validation', () => {
    it('should reject invalid email format', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: { email: 'invalid-email' },
      })

      const response = await POST(request)

      await expectJsonResponse(response, 400, {
        error: 'Please provide a valid email address',
      })

      expect(mailchimp.lists.addListMember).not.toHaveBeenCalled()
    })

    it('should reject empty email', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: { email: '' },
      })

      const response = await POST(request)

      await expectJsonResponse(response, 400, {
        error: 'Please provide a valid email address',
      })
    })

    it('should accept valid email formats', async () => {
      const validEmails = ['test@example.com', 'user.name@example.com', 'user+tag@example.co.uk']

      for (const email of validEmails) {
        ;(mailchimp.lists.getListMember as jest.Mock).mockRejectedValue({ status: 404 })
        ;(mailchimp.lists.addListMember as jest.Mock).mockResolvedValue({ id: 'sub-123' })

        const request = createMockRequest({
          method: 'POST',
          body: { email },
        })

        const response = await POST(request)

        expect(response.status).toBe(200)
      }
    })
  })

  describe('New Subscriptions', () => {
    it('should subscribe new email', async () => {
      const email = 'new@example.com'

      ;(mailchimp.lists.getListMember as jest.Mock).mockRejectedValue({ status: 404 })
      ;(mailchimp.lists.addListMember as jest.Mock).mockResolvedValue({ id: 'sub-123' })

      const request = createMockRequest({
        method: 'POST',
        body: {
          email,
          firstName: 'Test',
          lastName: 'User',
        },
      })

      const response = await POST(request)

      await expectJsonResponse(response, 200, {
        message: 'Successfully subscribed to newsletter!',
        status: 'subscribed',
        id: 'sub-123',
      })

      expect(mailchimp.lists.addListMember).toHaveBeenCalledWith('test-list-id', {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: 'Test',
          LNAME: 'User',
        },
        tags: ['website-signup'],
      })
    })

    it('should sanitize input data', async () => {
      const email = 'test@example.com '
      const firstName = '  <script>alert("xss")</script>John  '
      const lastName = 'Doe<img src=x onerror=alert(1)>'

      ;(mailchimp.lists.getListMember as jest.Mock).mockRejectedValue({ status: 404 })
      ;(mailchimp.lists.addListMember as jest.Mock).mockResolvedValue({ id: 'sub-123' })

      const request = createMockRequest({
        method: 'POST',
        body: { email, firstName, lastName },
      })

      const response = await POST(request)

      expect(response.status).toBe(200)

      expect(mailchimp.lists.addListMember).toHaveBeenCalledWith('test-list-id', {
        email_address: 'test@example.com',
        status: 'subscribed',
        merge_fields: {
          FNAME: 'scriptalert("xss")/scriptJohn',
          LNAME: 'Doeimg src=x onerror=alert(1)',
        },
        tags: ['website-signup'],
      })
    })

    it('should handle custom tags', async () => {
      ;(mailchimp.lists.getListMember as jest.Mock).mockRejectedValue({ status: 404 })
      ;(mailchimp.lists.addListMember as jest.Mock).mockResolvedValue({ id: 'sub-123' })

      const request = createMockRequest({
        method: 'POST',
        body: {
          email: 'test@example.com',
          tags: ['blog', 'newsletter', 'tech'],
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(200)

      expect(mailchimp.lists.addListMember).toHaveBeenCalledWith(
        'test-list-id',
        expect.objectContaining({
          tags: ['blog', 'newsletter', 'tech'],
        })
      )
    })
  })

  describe('Existing Subscriptions', () => {
    it('should handle already subscribed users', async () => {
      const email = 'existing@example.com'

      ;(mailchimp.lists.getListMember as jest.Mock).mockResolvedValue({
        status: 'subscribed',
        email_address: email,
      })

      const request = createMockRequest({
        method: 'POST',
        body: { email },
      })

      const response = await POST(request)

      await expectJsonResponse(response, 200, {
        message: 'You are already subscribed!',
        status: 'already_subscribed',
      })

      expect(mailchimp.lists.addListMember).not.toHaveBeenCalled()
    })

    it('should resubscribe unsubscribed users', async () => {
      const email = 'unsubscribed@example.com'
      // Generate subscriber hash for webhook
      const subscriberHash = crypto.createHash('md5').update(email).digest('hex')

      ;(mailchimp.lists.getListMember as jest.Mock).mockResolvedValue({
        status: 'unsubscribed',
        email_address: email,
      })
      ;(mailchimp.lists.updateListMember as jest.Mock).mockResolvedValue({
        status: 'subscribed',
      })

      const request = createMockRequest({
        method: 'POST',
        body: {
          email,
          firstName: 'Test',
          lastName: 'User',
        },
      })

      const response = await POST(request)

      await expectJsonResponse(response, 200, {
        message: 'Successfully resubscribed to newsletter!',
        status: 'resubscribed',
      })

      expect(mailchimp.lists.updateListMember).toHaveBeenCalledWith(
        'test-list-id',
        subscriberHash,
        {
          status: 'subscribed',
          merge_fields: {
            FNAME: 'Test',
            LNAME: 'User',
          },
        }
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle missing Mailchimp configuration', async () => {
      // Clear Mailchimp config
      delete process.env.MAILCHIMP_API_KEY
      delete process.env.MAILCHIMP_LIST_ID

      const request = createMockRequest({
        method: 'POST',
        body: { email: 'test@example.com' },
      })

      const response = await POST(request)

      await expectJsonResponse(response, 503, {
        error: 'Newsletter service temporarily unavailable',
      })
    })

    it('should handle Mailchimp API errors', async () => {
      ;(mailchimp.lists.getListMember as jest.Mock).mockRejectedValue({ status: 404 })
      ;(mailchimp.lists.addListMember as jest.Mock).mockRejectedValue({
        status: 500,
        message: 'Internal Server Error',
      })

      const request = createMockRequest({
        method: 'POST',
        body: { email: 'test@example.com' },
      })

      const response = await POST(request)

      await expectJsonResponse(response, 500, {
        error: 'Failed to subscribe. Please try again later.',
      })
    })

    it('should handle Mailchimp authentication errors', async () => {
      ;(mailchimp.lists.getListMember as jest.Mock).mockRejectedValue({ status: 404 })
      ;(mailchimp.lists.addListMember as jest.Mock).mockRejectedValue({ status: 401 })

      const request = createMockRequest({
        method: 'POST',
        body: { email: 'test@example.com' },
      })

      const response = await POST(request)

      await expectJsonResponse(response, 503, {
        error: 'Newsletter service temporarily unavailable.',
      })
    })

    it('should handle invalid email from Mailchimp', async () => {
      ;(mailchimp.lists.getListMember as jest.Mock).mockRejectedValue({ status: 404 })
      ;(mailchimp.lists.addListMember as jest.Mock).mockRejectedValue({ status: 400 })

      const request = createMockRequest({
        method: 'POST',
        body: { email: 'test@example.com' },
      })

      const response = await POST(request)

      await expectJsonResponse(response, 400, {
        error: 'Invalid email address',
      })
    })
  })

  describe('Request Validation', () => {
    it('should require email field', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: { firstName: 'Test' },
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should handle missing optional fields', async () => {
      ;(mailchimp.lists.getListMember as jest.Mock).mockRejectedValue({ status: 404 })
      ;(mailchimp.lists.addListMember as jest.Mock).mockResolvedValue({ id: 'sub-123' })

      const request = createMockRequest({
        method: 'POST',
        body: { email: 'test@example.com' },
      })

      const response = await POST(request)

      expect(response.status).toBe(200)

      expect(mailchimp.lists.addListMember).toHaveBeenCalledWith(
        'test-list-id',
        expect.objectContaining({
          merge_fields: {
            FNAME: '',
            LNAME: '',
          },
        })
      )
    })
  })

  describe('Email Normalization', () => {
    it('should lowercase email addresses', async () => {
      ;(mailchimp.lists.getListMember as jest.Mock).mockRejectedValue({ status: 404 })
      ;(mailchimp.lists.addListMember as jest.Mock).mockResolvedValue({ id: 'sub-123' })

      const request = createMockRequest({
        method: 'POST',
        body: { email: 'TEST@EXAMPLE.COM' },
      })

      const response = await POST(request)

      expect(response.status).toBe(200)

      expect(mailchimp.lists.addListMember).toHaveBeenCalledWith(
        'test-list-id',
        expect.objectContaining({
          email_address: 'test@example.com',
        })
      )
    })
  })
})
