import type { Metadata } from "next";
import { SiteProvider } from "@/components/SiteProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";
import { Header, PopupRenderer, Footer } from "@/components/UI";
import { ToastContainer } from 'react-toastify';
import { PopupProvider } from "@/contexts/PopupContext";
import { FileUploaderProvider } from "@/contexts/FileUploaderContext";
import { defaultSettings } from "@/hooks/siteSettingsDefaults";
import { DynamicTitle } from "@/components/DynamicTitle";

export const metadata: Metadata = {
  title: defaultSettings.general.site_title,
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
      >
        <AuthProvider>
          <SiteProvider>
            <PopupProvider>
              <FileUploaderProvider>
                <DynamicTitle />
                <Header />
                <PopupRenderer />
                {children}
              <ToastContainer
              position="bottom-left"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              />
              <Footer />
              </FileUploaderProvider>
            </PopupProvider>
          </SiteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
