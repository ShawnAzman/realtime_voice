"use client";

import React, { createContext, useContext, useState, FC, PropsWithChildren } from "react";
import { v4 as uuidv4 } from "uuid";
import { TranscriptItem } from "../types";

type TranscriptContextValue = {
  transcriptItems: TranscriptItem[];
  addTranscriptMessage: (itemId: string, role: "user" | "assistant", content: string) => void;
  updateTranscriptMessage: (itemId: string, content: string, isDelta: boolean) => void;
  addTranscriptBreadcrumb: (title: string, data?: Record<string, any>) => void;
  toggleTranscriptItemExpand: (itemId: string) => void;
  updateTranscriptItemStatus: (itemId: string, status: "IN_PROGRESS" | "DONE") => void;
};

const TranscriptContext = createContext<TranscriptContextValue | undefined>(undefined);

export const TranscriptProvider: FC<PropsWithChildren> = ({ children }) => {
  const [transcriptItems, setTranscriptItems] = useState<TranscriptItem[]>([]);

  const addTranscriptMessage: TranscriptContextValue["addTranscriptMessage"] = (
    itemId,
    role,
    content
  ) => {
    setTranscriptItems((prev) => [
      ...prev,
      {
        itemId,
        type: "MESSAGE",
        role,
        title: content,
        expanded: false,
        timestamp: new Date().toLocaleTimeString(),
        createdAtMs: Date.now(),
        status: "IN_PROGRESS",
        isHidden: false,
      },
    ]);
  };

  const updateTranscriptMessage: TranscriptContextValue["updateTranscriptMessage"] = (
    itemId,
    content,
    isDelta
  ) => {
    setTranscriptItems((prev) =>
      prev.map((item) => {
        if (item.itemId === itemId) {
          return {
            ...item,
            title: isDelta ? (item.title || "") + content : content,
          };
        }
        return item;
      })
    );
  };

  const addTranscriptBreadcrumb: TranscriptContextValue["addTranscriptBreadcrumb"] = (
    title,
    data
  ) => {
    setTranscriptItems((prev) => [
      ...prev,
      {
        itemId: uuidv4(),
        type: "BREADCRUMB",
        title,
        data,
        expanded: false,
        timestamp: new Date().toLocaleTimeString(),
        createdAtMs: Date.now(),
        status: "DONE",
        isHidden: false,
      },
    ]);
  };

  const toggleTranscriptItemExpand: TranscriptContextValue["toggleTranscriptItemExpand"] = (
    itemId
  ) => {
    setTranscriptItems((prev) =>
      prev.map((item) => {
        if (item.itemId === itemId) {
          return { ...item, expanded: !item.expanded };
        }
        return item;
      })
    );
  };

  const updateTranscriptItemStatus: TranscriptContextValue["updateTranscriptItemStatus"] = (
    itemId,
    status
  ) => {
    setTranscriptItems((prev) =>
      prev.map((item) => {
        if (item.itemId === itemId) {
          return { ...item, status };
        }
        return item;
      })
    );
  };

  return (
    <TranscriptContext.Provider
      value={{
        transcriptItems,
        addTranscriptMessage,
        updateTranscriptMessage,
        addTranscriptBreadcrumb,
        toggleTranscriptItemExpand,
        updateTranscriptItemStatus,
      }}
    >
      {children}
    </TranscriptContext.Provider>
  );
};

export function useTranscript() {
  const context = useContext(TranscriptContext);
  if (!context) {
    throw new Error("useTranscript must be used within a TranscriptProvider");
  }
  return context;
}
