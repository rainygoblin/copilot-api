import { describe, test, expect, afterEach } from "bun:test"

describe("api-config env overrides", () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  test("GITHUB_API_BASE_URL defaults to https://api.github.com", async () => {
    delete process.env.GITHUB_API_BASE_URL
    const { GITHUB_API_BASE_URL } = await import("~/lib/api-config")
    expect(GITHUB_API_BASE_URL).toBe("https://api.github.com")
  })

  test("GITHUB_BASE_URL defaults to https://github.com", async () => {
    delete process.env.GITHUB_BASE_URL
    const { GITHUB_BASE_URL } = await import("~/lib/api-config")
    expect(GITHUB_BASE_URL).toBe("https://github.com")
  })
})
