'use client';

import * as React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import AutoPlay from 'embla-carousel-autoplay';
import messages from '@/messages.json';

import '@/styles/globals.css'; // Import global CSS

const Home = () => {
  return (
    <>
      <main id="main-content" className="flex-grow flex flex-col items-center justify-center w-full px-4 md:px-8 py-12 overflow-x-hidden">
        <section id="hero-section" className="text-center mb-8 md:mb-12 w-full max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-bold px-2">
            Dive into the World of <span className="highlight-text">Anonymous Conversations</span>
          </h1>
          <p className="mt-3 md:mt-4 text-base md:text-lg px-2">
            Explore Cloak Feedback - Where your identity remains a secret.
          </p>
        </section>
        <Carousel
          plugins={[AutoPlay({ delay: 2000 })]}
          className="w-full max-w-2xl carousel px-4"
        >
          <CarouselContent>
            {messages.map((message, index) => (
              <CarouselItem key={index} className="carousel-item">
                <div className="p-2">
                  <Card className="message-card">
                    <CardHeader>
                      {message.title}
                    </CardHeader>
                    <CardContent className="p-4">
                      <span className="text-lg font-semibold">{message.content}</span>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="carousel-nav" />
          <CarouselNext className="carousel-nav" />
        </Carousel>
        <footer className="text-center p-4 md:p-6 mt-8">
          &copy;2024 Cloak Feedback. All rights reserved.
        </footer>
      </main>
    </>
  );
};

export default Home;
