import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toBeVisible(): R
      toBeEmpty(): R
      toBeDisabled(): R
      toBeEnabled(): R
      toBeInvalid(): R
      toBeRequired(): R
      toBeValid(): R
      toContainElement(element: Element | null): R
      toContainHTML(html: string): R
      toHaveAttribute(attr: string, value?: string | RegExp): R
      toHaveClass(...classNames: string[]): R
      toHaveFocus(): R
      toHaveFormValues(expectedValues: Record<string, unknown>): R
      toHaveStyle(css: string | Record<string, unknown>): R
      toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): R
      toHaveValue(value: string | string[] | number): R
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R
      toBeChecked(): R
      toBePartiallyChecked(): R
      toHaveErrorMessage(text: string | RegExp): R
      toBeEmptyDOMElement(): R
      toHaveAccessibleDescription(text: string | RegExp): R
      toHaveAccessibleName(text: string | RegExp): R
    }
  }
}