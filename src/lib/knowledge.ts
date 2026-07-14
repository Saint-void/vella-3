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
  file_size: number;
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

export function uploadKnowledgeDocumentWithProgress(
  accessToken: string,
  chatbotId: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<KnowledgeDocument> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/v1/chatbots/${chatbotId}/knowledge/documents/upload`);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        let message = `Upload failed with status ${xhr.status}`;
        try {
          const body = JSON.parse(xhr.responseText);
          message = body.message ?? body.error ?? message;
        } catch {
          // Use default message
        }
        reject(new Error(message));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(formData);
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
