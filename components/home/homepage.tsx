"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Users,
  Shield,
  Zap,
  ArrowRight,
  Star,
  Mic,
  ImageIcon,
  Video,
  FileText,
  Database,
  CloudOff,
  UserPlus,
  Trash2,
} from "lucide-react";
import Link from "next/link";

export default function Homepage() {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const mediaRef = useRef(null);
  const managementRef = useRef(null);
  const testimonialsRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true });
  const featuresInView = useInView(featuresRef, { once: true });
  const mediaInView = useInView(mediaRef, { once: true });
  const managementInView = useInView(managementRef, { once: true });
  const testimonialsInView = useInView(testimonialsRef, { once: true });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const coreFeatures = [
    {
      icon: MessageCircle,
      title: "Real-time Messaging",
      description:
        "Instant messaging with live typing indicators, message delivery status, and seamless synchronization",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Users,
      title: "Group & Personal Chats",
      description:
        "Create group conversations or personal chats with advanced participant management",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: Shield,
      title: "Secure Authentication",
      description:
        "Email-based OTP authentication with JWT tokens for enhanced security",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Built with modern technologies including WebSockets for optimal real-time performance",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ];

  const mediaFeatures = [
    {
      icon: ImageIcon,
      title: "Image Sharing",
      description: "Share photos with preview, zoom, and download capabilities",
      demo: "📷 Photo sharing with instant preview",
    },
    {
      icon: Video,
      title: "Video Messages",
      description:
        "Send video files with thumbnail generation and playback controls",
      demo: "🎥 Video messages with custom controls",
    },
    {
      icon: Mic,
      title: "Voice Recording",
      description: "Record and send voice messages with waveform visualization",
      demo: "🎵 Voice messages with real-time recording",
    },
    {
      icon: FileText,
      title: "File Sharing",
      description:
        "Share documents, PDFs, and other files with size validation",
      demo: "📎 Document sharing with type detection",
    },
  ];

  const managementFeatures = [
    {
      icon: Database,
      title: "Persistent Storage",
      description: "Messages saved to database with full chat history",
      badge: "Default",
      color: "bg-green-500",
    },
    {
      icon: CloudOff,
      title: "Temporary Mode",
      description:
        "Privacy-focused temporary messaging that doesn't save to database",
      badge: "Privacy",
      color: "bg-orange-500",
    },
    {
      icon: UserPlus,
      title: "Participant Management",
      description:
        "Add or remove participants from group chats with role-based permissions",
      badge: "Groups",
      color: "bg-blue-500",
    },
    {
      icon: Trash2,
      title: "Message & Chat Deletion",
      description:
        "Delete individual messages or entire chats with confirmation",
      badge: "Control",
      color: "bg-red-500",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager",
      company: "TechCorp",
      content:
        "The real-time features and media sharing capabilities have revolutionized our team communication.",
      rating: 5,
      avatar: "SJ",
    },
    {
      name: "Mike Chen",
      role: "Developer",
      company: "StartupXYZ",
      content:
        "Clean interface, fast performance, and reliable messaging. The temporary mode is perfect for sensitive discussions.",
      rating: 5,
      avatar: "MC",
    },
    {
      name: "Emily Davis",
      role: "Designer",
      company: "Creative Studio",
      content:
        "The user experience is seamless across all devices. Love the voice messaging and file sharing features!",
      rating: 5,
      avatar: "ED",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      rotate: [0, 5, 0],
      transition: {
        duration: 6,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ChatApp
              </span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => router.push("/login")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ y, opacity }}
        className="relative overflow-hidden py-20 lg:py-32"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            className="text-center"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2">
                🚀 Now with Media Sharing
              </Badge>
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
            >
              The Future of{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Team Communication
              </span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Experience seamless real-time messaging with advanced media
              sharing, and flexible storage options. Built for teams and
              individuals who value both functionality and privacy.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => router.push("/login")}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Chatting Now
                  <MessageCircle className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg rounded-lg border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
                  asChild
                >
                  <Link href={"#features"}>
                    View Features
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20"
        />
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: "2s" }}
          className="absolute top-40 right-20 w-16 h-16 bg-indigo-200 rounded-full opacity-20"
        />
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: "4s" }}
          className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-200 rounded-full opacity-20"
        />
      </motion.section>

      {/* Core Features Section */}
      <motion.section
        ref={featuresRef}
        className="py-20 bg-white"
        id="features"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={
              featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
            }
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Core Features for Modern Communication
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for effective team collaboration and personal
              messaging
            </p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {coreFeatures.map((feature, index) => (
              <motion.div key={index} variants={cardVariants}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md group">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all duration-300`}
                    >
                      <feature.icon className={`w-8 h-8 ${feature.color}`} />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Media Features Section */}
      <motion.section
        ref={mediaRef}
        className="py-20 bg-gradient-to-r from-gray-50 to-blue-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={mediaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2">
              🎨 Rich Media Support
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Share More Than Just Text
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Express yourself with images, videos, voice messages, and files
            </p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={mediaInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {mediaFeatures.map((feature, index) => (
              <motion.div key={index} variants={cardVariants}>
                <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden group">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0"
                      >
                        <feature.icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {feature.description}
                        </p>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={
                            mediaInView
                              ? { opacity: 1, x: 0 }
                              : { opacity: 0, x: -20 }
                          }
                          transition={{ delay: index * 0.2 + 0.5 }}
                          className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800 font-medium"
                        >
                          {feature.demo}
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Storage & Management Section */}
      <motion.section
        ref={managementRef}
        className="py-20 bg-gradient-to-r from-indigo-50 to-purple-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={
              managementInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
            }
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2">
              ⚙️ Advanced Management
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Flexible Storage & Control
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose between persistent storage or temporary messaging based on
              your privacy needs
            </p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={managementInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
          >
            {managementFeatures.map((feature, index) => (
              <motion.div key={index} variants={cardVariants}>
                <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg group">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        <feature.icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {feature.title}
                          </h3>
                          <Badge
                            className={`${feature.color} text-white border-0`}
                          >
                            {feature.badge}
                          </Badge>
                        </div>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section ref={testimonialsRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={
              testimonialsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
            }
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied users worldwide
            </p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={testimonialsInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={cardVariants}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: 180 }}
                          animate={
                            testimonialsInView
                              ? { scale: 1, rotate: 0 }
                              : { scale: 0, rotate: 180 }
                          }
                          transition={{ delay: index * 0.1 + i * 0.1 + 0.5 }}
                        >
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {testimonial.avatar}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {testimonial.role} at {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Communication?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join our community and experience the future of messaging today.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => router.push("/login")}
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started for Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">ChatApp</span>
            </div>
            <p className="text-gray-400 mb-4">
              Connecting people through seamless communication
            </p>
            <div className="flex justify-center space-x-6 mb-6">
              <Badge
                variant="outline"
                className="text-gray-400 border-gray-600"
              >
                Real-time Messaging
              </Badge>
              <Badge
                variant="outline"
                className="text-gray-400 border-gray-600"
              >
                Media Sharing
              </Badge>
              <Badge
                variant="outline"
                className="text-gray-400 border-gray-600"
              >
                Privacy Focused
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 ChatApp. All rights reserved.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
