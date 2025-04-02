import { useTranscript } from "../contexts/TranscriptContext";
import { ServerEvent, SessionStatus, AgentConfig } from "../types";
import { useEvent } from "../contexts/EventContext";
import { useRef } from "react";

export interface UseHandleServerEventParams {
  setSessionStatus: (status: SessionStatus) => void;
  selectedAgentName: string;
  selectedAgentConfigSet: AgentConfig[] | null;
  sendClientEvent?: (type: string, data?: Record<string, any>) => void;
  setSelectedAgentName?: (name: string) => void;
}

export function useHandleServerEvent({
  setSessionStatus,
  selectedAgentName,
  selectedAgentConfigSet,
  sendClientEvent,
  setSelectedAgentName,
}: UseHandleServerEventParams) {
  const {
    transcriptItems,
    addTranscriptBreadcrumb,
    addTranscriptMessage,
    updateTranscriptMessage,
    updateTranscriptItemStatus,
  } = useTranscript();
  
  const { logServerEvent } = useEvent();

  const handleServerEvent = (event: ServerEvent) => {
    logServerEvent(event);

    if (event.type === "session.terminated") {
      addTranscriptBreadcrumb("WebSocket connection terminated", event);
      setSessionStatus("DISCONNECTED");
      return;
    }

    if (event.type === "session.message") {
      const itemId = event.item?.id;
      if (!itemId) {
        console.error("Missing item_id in session.message event:", event);
        return;
      }

      const role = event.item?.role;
      if (role === "assistant") {
        const content = event.item?.content?.[0];
        const existingItem = transcriptItems.find(
          (item) => item.itemId === itemId
        );

        if (!existingItem) {
          addTranscriptMessage(itemId, "assistant", "");
        }

        if (content?.text) {
          updateTranscriptMessage(itemId, content.text, false);
        }
      } else if (role === "user") {
        const content = event.item?.content?.[0];
        const transcript = content?.transcript ?? content?.text ?? "";
        
        if (transcript) {
          const existingItem = transcriptItems.find(
            (item) => item.itemId === itemId
          );
          
          if (existingItem) {
            updateTranscriptMessage(itemId, transcript, false);
          } else {
            addTranscriptMessage(itemId, "user", transcript);
          }
        }
      }
    }

    if (event.type === "session.message.delta") {
      const itemId = event.item_id;
      if (!itemId) {
        console.error("Missing item_id in session.message.delta event:", event);
        return;
      }

      if (event.delta) {
        updateTranscriptMessage(itemId, event.delta, true);
      }
    }

    if (event.type === "session.message.completed") {
      const itemId = event.item_id;
      if (!itemId) {
        console.error("Missing item_id in session.message.completed event:", event);
        return;
      }
      
      updateTranscriptItemStatus(itemId, "DONE");
    }

    if (event.type === "session.error") {
      addTranscriptBreadcrumb(`Error: ${JSON.stringify(event)}`, event);
    }
  };

  return useRef(handleServerEvent);
}
