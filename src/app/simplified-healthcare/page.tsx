import React from "react";
import { TranscriptProvider } from "../contexts/TranscriptContext";
import { EventProvider } from "../contexts/EventContext";
import SimplifiedHealthcareApp from "./SimplifiedHealthcareApp";

export default function SimplifiedHealthcarePage() {
  return (
    <TranscriptProvider>
      <EventProvider>
        <SimplifiedHealthcareApp />
      </EventProvider>
    </TranscriptProvider>
  );
}
