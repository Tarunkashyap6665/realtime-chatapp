import Homepage from "@/components/home/homepage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChatApp - Modern Real-time Communication",
  description:
    "Experience seamless communication with our modern chat application. Secure, fast, and designed for teams and individuals alike.",
  keywords: "chat app, real-time messaging, group chat, secure communication",
  openGraph: {
    title: "ChatApp - Modern Real-time Communication",
    description:
      "Experience seamless communication with our modern chat application. Secure, fast, and designed for teams and individuals alike.",
    type: "website",
    siteName: "ChatApp",
  },
};

import React from "react";

const page = () => {
  return <Homepage />;
};

export default page;
