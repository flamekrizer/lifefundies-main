import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

const initialState: ErrorBoundaryState = {
  hasError: false,
  error: null,
}

const showDevDetails = import.meta.env.DEV === true

function reportErrorToService(error: Error, errorInfo: React.ErrorInfo): void {
  // Placeholder for production observability.
  // Replace this with Sentry.captureException, Crashlytics.logException, LogRocket.captureException, etc.
  console.error('Unhandled React error caught by ErrorBoundary:', error, errorInfo)
}

const fallbackStyles: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '2rem',
  textAlign: 'center',
  gap: '1.25rem',
  backgroundColor: 'var(--clr-bg)',
  color: 'var(--clr-text)',
}

const buttonStyles: React.CSSProperties = {
  padding: '0.85rem 1.5rem',
  fontSize: '1rem',
  cursor: 'pointer',
  borderRadius: '0.5rem',
  border: '1px solid transparent',
  minWidth: '10rem',
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = initialState
  private fallbackRef = React.createRef<HTMLDivElement>()

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    reportErrorToService(error, errorInfo)
  }

  componentDidUpdate(_: ErrorBoundaryProps, prevState: ErrorBoundaryState): void {
    if (!prevState.hasError && this.state.hasError && this.fallbackRef.current) {
      this.fallbackRef.current.focus()
    }
  }

  handleReload = (): void => {
    window.location.reload()
  }

  handleReset = (): void => {
    this.setState(initialState)
  }

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div
        ref={this.fallbackRef}
        role="alert"
        aria-live="assertive"
        aria-labelledby="error-boundary-heading"
        tabIndex={-1}
        style={fallbackStyles}
      >
        <div style={{ maxWidth: '36rem' }}>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--clr-text-muted)' }}>
            Something unexpected happened.
          </p>
          <h1 id="error-boundary-heading" style={{ fontSize: '2rem', margin: 0 }}>
            Application error
          </h1>
          <p style={{ margin: '1rem 0 0', lineHeight: 1.6, color: 'var(--clr-text-muted)' }}>
            The application encountered an error and was unable to continue normally. You can try again or reload the page.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.75rem' }}>
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              ...buttonStyles,
              backgroundColor: 'var(--clr-primary)',
              color: 'var(--clr-on-primary)',
              borderColor: 'var(--clr-primary)',
            }}
          >
            Try again
          </button>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              ...buttonStyles,
              backgroundColor: 'transparent',
              color: 'var(--clr-text)',
              borderColor: 'var(--clr-border-strong)',
            }}
          >
            Reload page
          </button>
        </div>

        {showDevDetails && this.state.error && (
          <pre
            style={{
              marginTop: '1.5rem',
              whiteSpace: 'pre-wrap',
              textAlign: 'left',
              maxWidth: '36rem',
              borderRadius: '0.75rem',
              background: 'rgba(148, 163, 184, 0.1)',
              color: 'var(--clr-text-secondary)',
              padding: '1rem',
              overflowX: 'auto',
            }}
          >
            {this.state.error.stack ?? this.state.error.message}
          </pre>
        )}
      </div>
    )
  }
}
