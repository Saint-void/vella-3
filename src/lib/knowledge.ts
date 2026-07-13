import { apiRequest } from "./api";

export type KnowledgeDocument = {
  id: string;
  chatbot_id: string;
  name: string;
  source_type: "text" | "upload" | string;
  mime_type: string | null;
  status: "uploaded" | "processing" | "ready" | "failed";
  error_message: string | null;
  character_count: number;
  chunk_count: number;
  created_at: string;
  updated_at: string;
};

export type KnowledgeTextPayload = {
  name: string;
  content: string;
};

export function listKnowledgeDocuments(accessToken: string, chatbotId: string) {
  return apiRequest<KnowledgeDocument[]>(`/api/v1/chatbots/${chatbotId}/knowledge/documents`, accessToken);
}

export function createTextKnowledgeDocument(accessToken: string, chatbotId: string, payload: KnowledgeTextPayload) {
  return apiRequest<KnowledgeDocument>(`/api/v1/chatbots/${chatbotId}/knowledge/documents/text`, accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function uploadKnowledgeDocument(accessToken: string, chatbotId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<KnowledgeDocument>(`/api/v1/chatbots/${chatbotId}/knowledge/documents/upload`, accessToken, {
    method: "POST",
    body: formData,
  });
}

export function reprocessKnowledgeDocument(accessToken: string, chatbotId: string, documentId: string) {
  return apiRequest<KnowledgeDocument>(
    `/api/v1/chatbots/${chatbotId}/knowledge/documents/${documentId}/reprocess`,
    accessToken,
    { method: "POST" },
  );
}

export function deleteKnowledgeDocument(accessToken: string, chatbotId: string, documentId: string) {
  return apiRequest<void>(`/api/v1/chatbots/${chatbotId}/knowledge/documents/${documentId}`, accessToken, {
    method: "DELETE",
  });
}
