'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ 
  showSpinner: false, 
  speed: 0.3, 
  easing: 'ease', 
  minimum: 0.08,
  parent: 'body'
})

export function ProgressBar() {
  const pathname = usePathname()
  const lastPathname = useRef<string>()

  useEffect(() => {
    if (lastPathname.current !== pathname) {
      NProgress.start()
      lastPathname.current = pathname
      
      // Complète la barre après un court délai
      const timer = setTimeout(() => {
        NProgress.done()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [pathname])

  return null
}
