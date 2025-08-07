import type { ImageField, EmbedField, RichTextField } from '@prismicio/client'

export type MockImageField = Partial<ImageField>
export type MockEmbedField = Partial<EmbedField>
export type MockRichTextField = RichTextField

export interface MockNavigator extends Partial<Omit<Navigator, 'clipboard'>> {
  share?: jest.Mock<Promise<void>, [ShareData]>
  clipboard?: {
    writeText: jest.Mock<Promise<void>, [string]>
  }
}

export interface MockClipboard {
  writeText: jest.Mock<Promise<void>, [string]>
}

export interface GSAPContextSafe {
  <T extends (...args: unknown[]) => unknown>(fn: T): T
}

export interface MockGSAPContext {
  contextSafe: GSAPContextSafe
}

export type GSAPCallback = (context: MockGSAPContext) => void
export type GSAPConfig = Record<string, unknown>
