import { describe, test, expect, afterEach } from "bun:test"

import type { State } from "~/lib/state"

import { copilotBaseUrl } from "~/lib/api-config"

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

const makeState = (accountType: string): State => ({
  accountType,
  manualApprove: false,
  rateLimitWait: false,
  showToken: false,
})

describe("copilotBaseUrl", () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  test("defaults to api.githubcopilot.com for individual", () => {
    delete process.env.COPILOT_API_BASE_URL
    expect(copilotBaseUrl(makeState("individual"))).toBe(
      "https://api.githubcopilot.com",
    )
  })

  test("defaults to account-type URL for business", () => {
    delete process.env.COPILOT_API_BASE_URL
    expect(copilotBaseUrl(makeState("business"))).toBe(
      "https://api.business.githubcopilot.com",
    )
  })

  test("COPILOT_API_BASE_URL overrides account-type logic", () => {
    process.env.COPILOT_API_BASE_URL = "https://copilot.mycompany.com"
    expect(copilotBaseUrl(makeState("individual"))).toBe(
      "https://copilot.mycompany.com",
    )
    expect(copilotBaseUrl(makeState("business"))).toBe(
      "https://copilot.mycompany.com",
    )
  })

  test("strips trailing slash from COPILOT_API_BASE_URL", () => {
    process.env.COPILOT_API_BASE_URL = "https://copilot.mycompany.com/"
    expect(copilotBaseUrl(makeState("individual"))).toBe(
      "https://copilot.mycompany.com",
    )
  })

  test("strips multiple trailing slashes", () => {
    process.env.COPILOT_API_BASE_URL = "https://copilot.mycompany.com///"
    expect(copilotBaseUrl(makeState("individual"))).toBe(
      "https://copilot.mycompany.com",
    )
  })
})
