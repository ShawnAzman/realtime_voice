"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { TranscriptItem } from "../types";
import { useTranscript } from "../contexts/TranscriptContext";

export interface TranscriptProps {
  userText: string;
  setUserText: (val: string) => void;
  onSendMessage: () => void;
  canSend: boolean;
  isPTTActive?: boolean;
  onPTTStart?: () => void;
  onPTTEnd?: () => void;
}

function Transcript({
  userText,
  setUserText,
  onSendMessage,
  canSend,
  isPTTActive = false,
  onPTTStart,
  onPTTEnd,
}: TranscriptProps) {
  const { transcriptItems, toggleTranscriptItemExpand } = useTranscript();
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const [prevLogs, setPrevLogs] = useState<TranscriptItem[]>([]);
  const [justCopied, setJustCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function scrollToBottom() {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }

  useEffect(() => {
    const hasNewMessage = transcriptItems.length > prevLogs.length;
    const hasUpdatedMessage = transcriptItems.some((newItem, index) => {
      const oldItem = prevLogs[index];
      return (
        oldItem &&
        (newItem.title !== oldItem.title || newItem.data !== oldItem.data)
      );
    });

    if (hasNewMessage || hasUpdatedMessage) {
      scrollToBottom();
    }

    setPrevLogs(transcriptItems);
  }, [transcriptItems]);

  useEffect(() => {
    if (canSend && inputRef.current) {
      inputRef.current.focus();
    }
  }, [canSend]);

  const handleCopyTranscript = async () => {
    if (!transcriptRef.current) return;
    try {
      await navigator.clipboard.writeText(transcriptRef.current.innerText);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy transcript:", error);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-white min-h-0 rounded-xl">
      <div className="relative flex-1 min-h-0">
        <button
          onClick={handleCopyTranscript}
          className={`absolute w-20 top-3 right-2 mr-1 z-10 text-sm px-3 py-2 rounded-full bg-gray-200 hover:bg-gray-300`}
        >
          {justCopied ? "Copied!" : "Copy"}
        </button>

        <div
          ref={transcriptRef}
          className="overflow-auto p-4 flex flex-col gap-y-4 h-full"
        >
          {transcriptItems.map((item) => {
            const { itemId, type, role, data, expanded, timestamp, title = "", isHidden } = item;

            if (isHidden) {
              return null;
            }

            if (type === "MESSAGE") {
              const isUser = role === "user";
              const baseContainer = "flex justify-end flex-col";
              const containerClasses = `${baseContainer} ${isUser ? "items-end" : "items-start"}`;
              const bubbleBase = `max-w-lg p-3 rounded-xl ${isUser ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-black"}`;
              const isBracketedMessage = title.startsWith("[") && title.endsWith("]");
              const messageStyle = isBracketedMessage ? "italic text-gray-400" : "";
              const displayTitle = isBracketedMessage ? title.slice(1, -1) : title;

              return (
                <div key={itemId} className={containerClasses}>
                  <div className={bubbleBase}>
                    <div className={`text-xs ${isUser ? "text-gray-400" : "text-gray-500"} font-mono`}>
                      {timestamp}
                    </div>
                    <div className={`whitespace-pre-wrap ${messageStyle}`}>
                      <ReactMarkdown>{displayTitle}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            } else if (type === "BREADCRUMB") {
              return (
                <div
                  key={itemId}
                  className="flex flex-col justify-start items-start text-gray-500 text-sm"
                >
                  <span className="text-xs font-mono">{timestamp}</span>
                  <div
                    className={`whitespace-pre-wrap flex items-center font-mono text-sm text-gray-800 ${
                      data ? "cursor-pointer" : ""
                    }`}
                    onClick={() => data && toggleTranscriptItemExpand(itemId)}
                  >
                    {data && (
                      <span
                        className={`text-gray-400 mr-1 transform transition-transform duration-200 select-none font-mono ${
                          expanded ? "rotate-90" : "rotate-0"
                        }`}
                      >
                        ▶
                      </span>
                    )}
                    {title}
                  </div>
                  {expanded && data && (
                    <div className="text-gray-800 text-left">
                      <pre className="border-l-2 ml-1 border-gray-200 whitespace-pre-wrap break-words font-mono text-xs mb-2 mt-2 pl-2">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            } else {
              return (
                <div
                  key={itemId}
                  className="flex justify-center text-gray-500 text-sm italic font-mono"
                >
                  Unknown item type: {type}{" "}
                  <span className="ml-2 text-xs">{timestamp}</span>
                </div>
              );
            }
          })}
        </div>
      </div>

      <div className="p-4 flex items-center gap-x-2 flex-shrink-0 border-t border-gray-200">
        <input
          ref={inputRef}
          type="text"
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canSend) {
              onSendMessage();
            }
          }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          placeholder="Type a message..."
          disabled={!canSend}
        />
        
        {onPTTStart && onPTTEnd && (
          <button
            onMouseDown={onPTTStart}
            onMouseUp={onPTTEnd}
            onTouchStart={onPTTStart}
            onTouchEnd={onPTTEnd}
            disabled={!canSend}
            className={`p-2 rounded-full ${
              isPTTActive
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } transition-colors duration-150 disabled:opacity-50`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" x2="12" y1="19" y2="22"></line>
            </svg>
          </button>
        )}
        
        <button
          onClick={onSendMessage}
          disabled={!canSend || !userText.trim()}
          className="bg-gray-900 text-white rounded-full p-2 disabled:opacity-50 hover:bg-gray-700 transition-colors duration-150"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Transcript;
