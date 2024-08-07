import type { Metadata } from "next";
import "../globals.css";
import { Providers } from "./(main-layout)/GlobalRedux/provider";
import 'react-toastify/dist/ReactToastify.css';
import PageLoaderMain from "@/components/PageLoaderMain";

export const metadata: Metadata = {
  title: "Downtown Dens | Furnished Rentals, Travel Nurses, Travelers, Business Professionals",
  description: `Rent fully furnished apartments for monthly stays in the the heart of citys worldwide. 
  30 day minimum stay or longer! Downtown Dens provides furnished rentals.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="font-WorkSans font-medium">
        <Providers>
          {children}

          <PageLoaderMain />
        </Providers>
      </body>
    </html>
  );
}
