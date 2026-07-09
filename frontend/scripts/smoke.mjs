import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'

const edgePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const sampleIdea = 'Saya ingin membuat website open source untuk membantu user membuat PRD dengan AI. Flow dimulai dari chat ide, lalu AI atau user memilih stack. AI membuat pertanyaan adaptif, memilih Mermaid diagram yang perlu, lalu membuat PRD. Frontend React 18 TypeScript, backend Laravel API, database MySQL.'
const targets = [
  { name: 'desktop', width: 1440, height: 1000, path: 'D:/PRD/frontend/screenshots/app-desktop.png' },
  { name: 'mobile', width: 390, height: 1100, path: 'D:/PRD/frontend/screenshots/app-mobile.png' },
]

await mkdir('D:/PRD/frontend/screenshots', { recursive: true })

const browser = await chromium.launch({
  headless: true,
  executablePath: edgePath,
})

const results = []

for (const target of targets) {
  const page = await browser.newPage({ viewport: { width: target.width, height: target.height } })
  const consoleErrors = []
  const pageErrors = []

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
  await page.getByText('Apa yang ingin Anda bangun?').waitFor({ timeout: 10000 })
  await page.locator('.topbar-actions').getByRole('button', { name: /^Settings$/i }).click()
  await page.getByText('AI Provider').first().waitFor({ timeout: 10000 })
  const providerRows = await page.locator('.provider-row').count()
  await page.getByRole('button', { name: /System check/i }).click()
  await page.getByText('Database').first().waitFor({ timeout: 10000 })
  const healthTiles = await page.locator('.health-tile').count()
  const backendBadge = (await page.locator('.backend-health').first().textContent())?.trim() ?? ''
  await page.locator('.settings-close').click()

  await page.locator('textarea').first().fill(sampleIdea)
  await page.keyboard.press('Enter')
  await page.getByText('Pilih cara menentukan stack').waitFor({ timeout: 10000 })
  await page.getByRole('button', { name: /Lanjut/i }).click()
  await page.getByText('Jawab pertanyaan adaptif').waitFor({ timeout: 10000 })
  const questionCards = await page.locator('.question-card').count()
  const answerButtons = page.locator('.answer-chip')
  const answerCount = await answerButtons.count()
  if (answerCount >= 2) {
    await answerButtons.nth(0).click()
    await answerButtons.nth(1).click()
  }
  await page.getByRole('button', { name: /Buat scratchboard/i }).click()
  await page.locator('.mermaid svg').first().waitFor({ timeout: 10000 })
  const mermaidCount = await page.locator('.mermaid svg').count()
  await page.getByRole('button', { name: /Approve PRD/i }).click()
  await page.getByText('PRD Markdown').waitFor({ timeout: 10000 })
  const exportVisible = await page.getByRole('button', { name: /^Export/i }).first().isVisible()

  await page.screenshot({ path: target.path, fullPage: true })
  results.push({
    viewport: target.name,
    providerRows,
    healthTiles,
    backendBadge,
    mermaidCount,
    exportVisible,
    questionCards,
    consoleErrors,
    pageErrors,
    screenshot: target.path,
  })

  await page.close()
}

await browser.close()
console.log(JSON.stringify(results, null, 2))