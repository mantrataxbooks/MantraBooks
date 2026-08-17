'use client'

export function FontAwesomeLoader() {
  return (
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      media="print"
      onLoad={(e) => {
        ;(e.currentTarget as HTMLLinkElement).media = 'all'
      }}
    />
  )
}
