import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import ThemeProvider from '@/components/providers/ThemeProvider'
import GSAPProvider from '@/components/providers/GSAPProvider'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withTheme?: boolean
  withGsap?: boolean
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { withTheme = true, withGsap = false, ...renderOptions } = options

  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    let element = <>{children}</>

    if (withGsap) {
      element = <GSAPProvider>{element}</GSAPProvider>
    }

    if (withTheme) {
      element = <ThemeProvider>{element}</ThemeProvider>
    }

    return element
  }

  return render(ui, { wrapper: AllTheProviders, ...renderOptions })
}

// Re-export everything
export * from '@testing-library/react'
export { renderWithProviders as render }