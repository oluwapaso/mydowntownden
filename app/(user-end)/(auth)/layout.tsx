import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Downtown Dens | Furnished Rentals, Travel Nurses, Travelers, Business Professionals",
  description: `Rent fully furnished apartments for monthly stays in the the heart of citys worldwide. 
  30 day minimum stay or longer! Downtown Dens provides furnished rentals.`,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="font-poppins font-medium">
        {children}
      </body>
    </html>
  )
  // return (<body>{children}</body>)
}
