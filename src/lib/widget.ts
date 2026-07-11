import { publicApiRequest } from './api';

export type WidgetConfig = {
  chatbot_id: string;
  name: string;
  business_name: string;
  industry: string | null;
  support_goal: string | null;
  greeting_message: string;
  brand_color: string;
  logo_url: string | null;
  tone: string;
  suggested_questions: string[];
};

export type WidgetConversation = {
  id: string;
  chatbot_id: string;
  visitor_id: string | null;
  site_origin: string;
  status: string;
  created_at: string;
  updated_at: string;
  messages: WidgetMessage[];
};

export type WidgetMessage = {
  id: string;
  role: 'visitor' | 'assistant';
  content: string;
  matched_faq_id: string | null;
  created_at: string;
};

export type WidgetConversationPayload = {
  site_origin: string;
  visitor_id?: string | null;
};

export type WidgetMessagePayload = WidgetConversationPayload & {
  content: string;
};

export type WidgetSendMessageResponse = {
  conversation_id: string;
  assistant_message: WidgetMessage;
  visitor_message: WidgetMessage;
};

export function getWidgetConfig(chatbotId: string, siteOrigin: string) {
  return publicApiRequest<WidgetConfig>(
    `/api/v1/widget/${chatbotId}/config?site_origin=${encodeURIComponent(siteOrigin)}`,
  );
}

export function createWidgetConversation(chatbotId: string, payload: WidgetConversationPayload) {
  return publicApiRequest<WidgetConversation>(`/api/v1/widget/${chatbotId}/conversations`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getWidgetConversation(chatbotId: string, conversationId: string, siteOrigin: string, visitorId: string) {
  return publicApiRequest<WidgetConversation>(
    `/api/v1/widget/${chatbotId}/conversations/${conversationId}?site_origin=${encodeURIComponent(siteOrigin)}&visitor_id=${encodeURIComponent(visitorId)}`,
  );
}

export function sendWidgetMessage(chatbotId: string, conversationId: string, payload: WidgetMessagePayload) {
  return publicApiRequest<WidgetSendMessageResponse>(
    `/api/v1/widget/${chatbotId}/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}
