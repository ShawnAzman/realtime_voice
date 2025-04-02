"use client";

import React from "react";
import { TranscriptProvider } from "../contexts/TranscriptContext";
import { EventProvider } from "../contexts/EventContext";
import HealthcareApp from "./HealthcareApp";

export default function Home() {
  return (
    <TranscriptProvider>
      <EventProvider>
        <HealthcareApp />
      </EventProvider>
    </TranscriptProvider>
  );
}
