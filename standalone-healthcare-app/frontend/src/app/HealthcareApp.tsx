"use client";

import React, { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTranscript } from "../contexts/TranscriptContext";
import { useEvent } from "../contexts/EventContext";
import { useHandleServerEvent } from "../hooks/useHandleServerEvent";
import { createRealtimeConnection } from "../lib/realtimeConnection";
import Transcript from "../components/Transcript";
import { SessionStatus, AgentConfig } from "../types";

const healthcareAgent: AgentConfig = {
  name: "Healthcare Appointment Agent",
  publicDescription: "An agent that helps patients manage their healthcare appointments",
  instructions: `You are Sarah, a medical office assistant at Dr. Smith's office.
Your job is to help patients with their appointments and answer questions about their healthcare.`,
  tools: [
    {
      type: "function",
      name: "recordDoctorNotes",
      description: "Record important information for the doctor to review before the appointment",
      parameters: {
        type: "object",
        properties: {
          notes: {
            type: "string",
            description: "The information to record in the patient's file"
          }
        },
        required: ["notes"]
      }
    },
    {
      type: "function",
      name: "provideMedicationInformation",
      description: "Provide information about a medication",
      parameters: {
        type: "object",
        properties: {
          medication: {
            type: "string",
            description: "The name of the medication"
          }
        },
        required: ["medication"]
      }
    }
  ]
};

const LeftPanel = () => (
  <div className="w-64 bg-white rounded-xl p-4 mr-2 flex flex-col">
    <h2 className="text-lg font-semibold mb-4">Patient Information</h2>
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-1">Upcoming Appointment</h3>
      <p className="text-sm text-gray-600">
        {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        })}
      </p>
      <p className="text-sm text-gray-600">10:00 AM</p>
    </div>
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-1">Current Medications</h3>
      <ul className="text-sm text-gray-600 list-disc pl-4">
        <li>Lisinopril (10mg)</li>
        <li>Metformin (500mg)</li>
        <li>Simvastatin (20mg)</li>
      </ul>
    </div>
    <div>
      <h3 className="text-sm font-medium mb-1">Recent Notes</h3>
      <p className="text-sm text-gray-600 italic">No recent notes available</p>
    </div>
  </div>
);

const RightPanel = () => (
  <div className="w-64 bg-white rounded-xl p-4 ml-2 flex flex-col">
    <h2 className="text-lg font-semibold mb-4">Doctor Information</h2>
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-1">Dr. Smith</h3>
      <p className="text-sm text-gray-600">Family Medicine</p>
      <p className="text-sm text-gray-600">Office: Suite 302</p>
    </div>
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-1">Office Hours</h3>
      <p className="text-sm text-gray-600">Monday - Friday: 9am - 5pm</p>
      <p className="text-sm text-gray-600">Saturday: 9am - 12pm</p>
    </div>
    <div>
      <h3 className="text-sm font-medium mb-1">Contact</h3>
      <p className="text-sm text-gray-600">Phone: (555) 123-4567</p>
      <p className="text-sm text-gray-600">Email: drsmith@example.com</p>
    </div>
  </div>
);

export default function HealthcareApp() {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("DISCONNECTED");
  const [userText, setUserText] = useState("");
  const [isPTTActive, setIsPTTActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [ephemeralKey, setEphemeralKey] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const { addTranscriptBreadcrumb, addTranscriptMessage } = useTranscript();
  const { logClientEvent } = useEvent();
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleServerEvent = useHandleServerEvent({
    setSessionStatus,
    selectedAgentName: healthcareAgent.name,
    selectedAgentConfigSet: [healthcareAgent],
    sendClientEvent: (type, data) => {
      if (dataChannelRef.current?.readyState === "open") {
        const event = {
          type,
          ...data,
        };
        logClientEvent(event);
        dataChannelRef.current.send(JSON.stringify(event));
      }
    },
  }).current;

  const connect = async () => {
    try {
      setSessionStatus("CONNECTING");
      addTranscriptBreadcrumb("Connecting to backend...");

      const sessionResponse = await fetch(`${apiUrl}/api/session/create`, {
        method: "POST",
      });

      if (!sessionResponse.ok) {
        throw new Error(`Failed to create session: ${sessionResponse.statusText}`);
      }

      const sessionData = await sessionResponse.json();
      setSessionId(sessionData.session_id);
      setEphemeralKey(sessionData.ephemeral_key);

      addTranscriptBreadcrumb(`Session created: ${sessionData.session_id}`);

      if (sessionData.ephemeral_key) {
        const { pc, dc } = await createRealtimeConnection(
          sessionData.ephemeral_key,
          audioRef
        );

        peerConnectionRef.current = pc;
        dataChannelRef.current = dc;

        dc.onopen = () => {
          addTranscriptBreadcrumb("WebSocket connection established");
          setSessionStatus("CONNECTED");
        };

        dc.onclose = () => {
          addTranscriptBreadcrumb("WebSocket connection closed");
          setSessionStatus("DISCONNECTED");
        };

        dc.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleServerEvent(data);
          } catch (error) {
            console.error("Error parsing server event:", error);
          }
        };
      }
    } catch (error) {
      console.error("Connection error:", error);
      addTranscriptBreadcrumb(`Connection error: ${error instanceof Error ? error.message : String(error)}`);
      setSessionStatus("DISCONNECTED");
    }
  };

  const disconnect = () => {
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setSessionStatus("DISCONNECTED");
    addTranscriptBreadcrumb("Disconnected from backend");
  };

  const sendMessage = () => {
    if (sessionStatus !== "CONNECTED" || !userText.trim()) {
      return;
    }

    const messageId = uuidv4();
    addTranscriptMessage(messageId, "user", userText);

    if (dataChannelRef.current?.readyState === "open") {
      const event = {
        type: "session.message",
        message: {
          role: "user",
          content: [
            {
              type: "text",
              text: userText,
            },
          ],
        },
      };
      logClientEvent(event);
      dataChannelRef.current.send(JSON.stringify(event));
    }

    setUserText("");
  };

  const handlePTTStart = () => {
    setIsPTTActive(true);
  };

  const handlePTTEnd = () => {
    setIsPTTActive(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Healthcare Appointment Assistant</h1>
        <div className="flex gap-2">
          {sessionStatus === "DISCONNECTED" ? (
            <button
              onClick={connect}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Connect
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        <LeftPanel />
        
        <div className="flex-1 flex flex-col min-h-0">
          <Transcript
            userText={userText}
            setUserText={setUserText}
            onSendMessage={sendMessage}
            canSend={sessionStatus === "CONNECTED"}
            isPTTActive={isPTTActive}
            onPTTStart={handlePTTStart}
            onPTTEnd={handlePTTEnd}
          />
        </div>
        
        <RightPanel />
      </div>

      <audio ref={audioRef} autoPlay />
    </div>
  );
}
