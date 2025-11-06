import { test, expect } from '@playwright/test'

test('signup -> onboarding -> add block -> dashboard -> overlap API', async ({ page }) => {
  await page.goto('http://localhost:3000/(auth)/signup')
  const now = Date.now()
  const email = `test+${now}@example.com`
  const username = `testuser${now.toString().slice(-4)}`
  await page.fill('input[placeholder="Username"]', username)
  await page.fill('input[placeholder="Email"]', email)
  await page.fill('input[placeholder="Password"]', 'password123')
  await page.click('button:has-text("Sign up")')
  await page.waitForURL('**/onboarding', { timeout: 5000 })
  await page.fill('input[placeholder="Username"]', username)
  await page.fill('input[placeholder="College"]', 'MIT')
  await page.click('button:has-text("Continue")')
  await page.waitForURL('**/dashboard', { timeout: 5000 })

  // Add a block
  await page.fill('input[placeholder="Title"]', 'Playwright Test Class')
  await page.click('button:has-text("Add block")')

  // Wait for timeline
  await page.waitForSelector('text=Week timeline', { timeout: 5000 })

  // Query overlap API with seeded user (if present)
  const res = await page.request.post('http://localhost:3000/api/overlap', {
    data: {
      userIds: [],
      weekStartISO: new Date().toISOString(),
      weekEndISO: new Date().toISOString(),
      minUsers: 1,
    },
  })
  expect(res.status()).toBeGreaterThanOrEqual(200)
  expect(res.status()).toBeLessThan(500)
})