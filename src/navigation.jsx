/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const NavigationContext = createContext(null)

export function NavigationProvider({ children, initialPath = '/' }) {
  const [pathname, setPathname] = useState(initialPath)

  const navigate = useCallback((nextPath) => {
    if (typeof nextPath !== 'string' || nextPath.length === 0) {
      return
    }

    setPathname(nextPath)
  }, [])

  const value = useMemo(() => ({
    pathname,
    navigate,
  }), [navigate, pathname])

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigate() {
  const context = useContext(NavigationContext)

  if (!context) {
    throw new Error('useNavigate must be used within NavigationProvider')
  }

  return context.navigate
}

export function useLocation() {
  const context = useContext(NavigationContext)

  if (!context) {
    throw new Error('useLocation must be used within NavigationProvider')
  }

  return { pathname: context.pathname }
}

export function Link({ children, className, onClick, to, ...props }) {
  const navigate = useNavigate()

  const handleClick = useCallback((event) => {
    event.preventDefault()

    if (onClick) {
      onClick(event)
    }

    navigate(to)
  }, [navigate, onClick, to])

  return (
    <a
      href={to}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  )
}
