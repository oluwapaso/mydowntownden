import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../../globals.css";
import { Providers } from "../GlobalRedux/provider";
import SideBars from "../_components/SideBars";
import PageLoader from "../_components/PageLoader";
import MainContent from "../_components/MainContent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
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
      <body className="font-Jost overflow-x-hidden">
        <Providers>
          <div className="w-full flex relative">
            {/** <Header /> */}
            <SideBars />
            <MainContent>
              {children}
            </MainContent>
            <PageLoader />
          </div>
        </Providers>
      </body>
    </html>
  );
}
