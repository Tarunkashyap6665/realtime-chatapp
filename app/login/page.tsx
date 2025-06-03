import LoginInterface from "@/components/auth/login-interface";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - ChatApp",
  description:
    "Sign in to your ChatApp account to start messaging with your team and friends securely.",
  keywords: "chat app login, secure messaging, team communication",
  openGraph: {
    title: "Login - ChatApp",
    description:
      "Sign in to your ChatApp account to start messaging with your team and friends securely.",
    type: "website",
    siteName: "ChatApp",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const LoginPage = () => {
  return <LoginInterface />;
};

export default LoginPage;
