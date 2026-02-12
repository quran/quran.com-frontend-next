import React from 'react'

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ExplorePage from '@/pages/explore'

vi.mock('@/api', () => ({
  fetcher: vi.fn(() => Promise.resolve({ articles: [] })),
}))

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
    lang: 'en',
  }),
}))

vi.mock('@/components/NextSeoWrapper', () => ({
  default: () => null,
}))

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('ExplorePage', () => {
  it('renders no list items when no articles are provided', () => {
    render(<ExplorePage />)

    const items = screen.queryAllByRole('listitem')
    expect(items).toHaveLength(0)
  })

  it('renders article cards when data exists', () => {
    render(
      <ExplorePage
        articles={[
          {
            id: '1',
            slug: 'about-the-quran',
            title: 'About the Quran',
            description: 'What the Quran is',
            image: '/hero.png',
          },
          {
            id: '2',
            slug: 'ramadan',
            title: 'Ramadan Activities',
            description: 'Make the most of the month',
            thumbnail: '/thumb.png',
          },
        ]}
      />,
    )

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(screen.getByText('About the Quran')).toBeInTheDocument()
    expect(screen.getByText('Ramadan Activities')).toBeInTheDocument()
    expect(screen.getAllByText('read_more')).toHaveLength(2)
  })
})
