import { renderHook, act, waitFor } from '@testing-library/react'
import { useTableOfContents } from '@/hooks/useTableOfContents'
import { ToCHeading } from '@/lib/toc-utils'

// Mock IntersectionObserver
class MockIntersectionObserver {
  callback: IntersectionObserverCallback
  elements: Set<Element> = new Set()

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(element: Element) {
    this.elements.add(element)
  }

  disconnect() {
    this.elements.clear()
  }

  triggerIntersection(entries: Array<{ target: { id: string }; isIntersecting: boolean }>) {
    const mockEntries = entries.map((entry) => ({
      target: { id: entry.target.id } as unknown as Element,
      isIntersecting: entry.isIntersecting,
      intersectionRatio: entry.isIntersecting ? 1 : 0,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: 0,
    }))
    this.callback(
      mockEntries as IntersectionObserverEntry[],
      this as unknown as IntersectionObserver
    )
  }
}

let mockIntersectionObserver: MockIntersectionObserver

beforeEach(() => {
  mockIntersectionObserver = null as unknown as MockIntersectionObserver
  global.IntersectionObserver = jest.fn((callback) => {
    mockIntersectionObserver = new MockIntersectionObserver(callback)
    return mockIntersectionObserver as unknown as IntersectionObserver
  })

  // Mock document.getElementById
  global.document.getElementById = jest.fn((id: string) => {
    return {
      id,
      getBoundingClientRect: () => ({
        top: id === 'heading-1' ? 100 : id === 'heading-2' ? 300 : 500,
        bottom: 200,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
      }),
    } as unknown as HTMLElement
  })

  // Mock window properties
  Object.defineProperty(window, 'scrollY', { writable: true, value: 0 })
  Object.defineProperty(window, 'innerHeight', { writable: true, value: 768 })
  global.scrollTo = jest.fn()
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('useTableOfContents', () => {
  const mockHeadings: ToCHeading[] = [
    { id: 'heading-1', text: 'Heading 1', level: 2 },
    { id: 'heading-2', text: 'Heading 2', level: 2 },
    {
      id: 'heading-3',
      text: 'Heading 3',
      level: 2,
      children: [{ id: 'heading-3-1', text: 'Heading 3.1', level: 3 }],
    },
  ]

  it('initializes with empty activeId', () => {
    const { result } = renderHook(() => useTableOfContents(mockHeadings))
    expect(result.current.activeId).toBe('')
  })

  it('observes all heading elements', async () => {
    renderHook(() => useTableOfContents(mockHeadings))

    await waitFor(() => {
      expect(mockIntersectionObserver.elements.size).toBe(4)
    })
  })

  it('sets initial active heading after delay', async () => {
    const { result } = renderHook(() => useTableOfContents(mockHeadings))

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150))
    })

    expect(result.current.activeId).toBe('heading-1')
  })

  it('updates activeId when headings intersect', async () => {
    const { result } = renderHook(() => useTableOfContents(mockHeadings))

    act(() => {
      mockIntersectionObserver.triggerIntersection([
        { target: { id: 'heading-2' }, isIntersecting: true },
        { target: { id: 'heading-1' }, isIntersecting: false },
      ])
    })

    expect(result.current.activeId).toBe('heading-2')
  })

  it('activates first visible heading when multiple are visible', () => {
    const { result } = renderHook(() => useTableOfContents(mockHeadings))

    act(() => {
      mockIntersectionObserver.triggerIntersection([
        { target: { id: 'heading-1' }, isIntersecting: true },
        { target: { id: 'heading-2' }, isIntersecting: true },
      ])
    })

    expect(result.current.activeId).toBe('heading-1')
  })

  it('scrolls to section with offset', () => {
    const { result } = renderHook(() => useTableOfContents(mockHeadings))

    act(() => {
      result.current.scrollToSection('heading-2')
    })

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 220, // 300 (element top) + 0 (scrollY) - 80 (offset)
      behavior: 'smooth',
    })
  })

  it('handles missing element in scrollToSection', () => {
    document.getElementById = jest.fn(() => null)
    const { result } = renderHook(() => useTableOfContents(mockHeadings))

    act(() => {
      result.current.scrollToSection('non-existent')
    })

    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('handles empty headings array', () => {
    const { result } = renderHook(() => useTableOfContents([]))

    expect(result.current.activeId).toBe('')
    expect(mockIntersectionObserver).toBeNull()
  })

  it('cleans up observer on unmount', async () => {
    const { unmount } = renderHook(() => useTableOfContents(mockHeadings))

    await waitFor(() => {
      expect(mockIntersectionObserver).toBeDefined()
    })

    const disconnectSpy = jest.spyOn(mockIntersectionObserver, 'disconnect')

    unmount()

    expect(disconnectSpy).toHaveBeenCalled()
  })

  it('handles nested headings correctly', () => {
    const { result } = renderHook(() => useTableOfContents(mockHeadings))

    act(() => {
      mockIntersectionObserver.triggerIntersection([
        { target: { id: 'heading-3-1' }, isIntersecting: true },
      ])
    })

    expect(result.current.activeId).toBe('heading-3-1')
  })

  it('maintains heading state across updates', () => {
    const { result } = renderHook(() => useTableOfContents(mockHeadings))

    // Set initial intersection
    act(() => {
      mockIntersectionObserver.triggerIntersection([
        { target: { id: 'heading-1' }, isIntersecting: true },
      ])
    })

    expect(result.current.activeId).toBe('heading-1')

    // Update with another intersection
    act(() => {
      mockIntersectionObserver.triggerIntersection([
        { target: { id: 'heading-2' }, isIntersecting: true },
        { target: { id: 'heading-1' }, isIntersecting: false },
      ])
    })

    expect(result.current.activeId).toBe('heading-2')
  })

  it('handles window scroll correctly', () => {
    window.scrollY = 100
    const { result } = renderHook(() => useTableOfContents(mockHeadings))

    act(() => {
      result.current.scrollToSection('heading-1')
    })

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 120, // 100 (element top) + 100 (scrollY) - 80 (offset)
      behavior: 'smooth',
    })
  })
})
