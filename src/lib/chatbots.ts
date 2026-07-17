import { apiRequest } from "./api";

export type Chatbot = {
  id: string;
  owner_id: string;
  name: string;
  business_name: string;
  industry: string | null;
  support_goal: string | null;
  website_domain: string | null;
  tone: string;
  greeting_message: string;
  brand_color: string;
  logo_url: string | null;
  handoff_email: string | null;
  status: "draft" | "active" | "paused" | "archived";
  created_at: string;
  updated_at: string;
};

export type ChatbotPayload = {
  name: string;
  business_name: string;
  industry?: string | null;
  support_goal?: string | null;
  website_domain?: string | null;
  tone: string;
  greeting_message: string;
  brand_color: string;
  logo_url?: string | null;
  handoff_email?: string | null;
};

export type ChatbotFAQ = {
  id: string;
  chatbot_id: string;
  question: string;
  answer: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type ChatbotFAQPayload = {
  question: string;
  answer: string;
  is_enabled?: boolean;
};

export function listChatbots(accessToken: string) {
  return apiRequest<Chatbot[]>("/api/v1/chatbots", accessToken);
}

export function createChatbot(accessToken: string, payload: ChatbotPayload) {
  return apiRequest<Chatbot>("/api/v1/chatbots", accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateChatbot(accessToken: string, chatbotId: string, payload: Partial<ChatbotPayload> & { status?: Chatbot["status"] }) {
  return apiRequest<Chatbot>(`/api/v1/chatbots/${chatbotId}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteChatbot(accessToken: string, chatbotId: string) {
  return apiRequest<void>(`/api/v1/chatbots/${chatbotId}`, accessToken, {
    method: "DELETE",
  });
}

export function uploadChatbotLogo(accessToken: string, chatbotId: string, file: File) {
  const body = new FormData();
  body.append('file', file);
  return apiRequest<Chatbot>(`/api/v1/chatbots/${chatbotId}/logo`, accessToken, {
    method: 'POST',
    body,
  });
}

export function deleteChatbotLogo(accessToken: string, chatbotId: string) {
  return apiRequest<Chatbot>(`/api/v1/chatbots/${chatbotId}/logo`, accessToken, {
    method: 'DELETE',
  });
}

export function listChatbotFaqs(accessToken: string, chatbotId: string) {
  return apiRequest<ChatbotFAQ[]>(`/api/v1/chatbots/${chatbotId}/faqs`, accessToken);
}

export function createChatbotFaq(accessToken: string, chatbotId: string, payload: ChatbotFAQPayload) {
  return apiRequest<ChatbotFAQ>(`/api/v1/chatbots/${chatbotId}/faqs`, accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateChatbotFaq(accessToken: string, chatbotId: string, faqId: string, payload: Partial<ChatbotFAQPayload>) {
  return apiRequest<ChatbotFAQ>(`/api/v1/chatbots/${chatbotId}/faqs/${faqId}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteChatbotFaq(accessToken: string, chatbotId: string, faqId: string) {
  return apiRequest<void>(`/api/v1/chatbots/${chatbotId}/faqs/${faqId}`, accessToken, {
    method: "DELETE",
  });
}
