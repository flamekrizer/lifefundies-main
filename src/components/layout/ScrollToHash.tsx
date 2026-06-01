import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      const element = document.getElementById(id)
      if (element) {
        // Small delay to ensure the page has rendered and elements are in the DOM
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 150)
        return () => clearTimeout(timer)
      }
    } else {
      // Scroll to top of the page when changing routes
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  return null
}
