// API utilities

const API_BASE = '/api';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data as T;
}

export const api = {
  // Requesters
  getRequesters: () => apiFetch<import('./types').Requester[]>('/requesters'),

  // Categories
  getCategories: () => apiFetch<import('./types').Category[]>('/categories'),

  // Related Systems
  getRelatedSystems: () => apiFetch<import('./types').RelatedSystem[]>('/related-systems'),

  // Tickets
  createTicket: (body: {
    title: string;
    description: string;
    categoryId: number;
    priority: string;
    requesterId: number;
    relatedSystemId?: number | null;
  }) =>
    apiFetch<import('./types').TicketDetail>('/tickets', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getTickets: (params: Record<string, string | number | undefined>) => {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '' && v !== null)
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join('&');
    return apiFetch<import('./types').PaginatedResponse<import('./types').TicketSummary>>(
      `/tickets?${query}`
    );
  },

  getTicket: (id: number) => apiFetch<import('./types').TicketDetail>(`/tickets/${id}`),

  // Attachments
  uploadAttachment: (ticketId: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return fetch(`${API_BASE}/tickets/${ticketId}/attachments`, {
      method: 'POST',
      body: form,
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Upload failed');
      return d as import('./types').Attachment;
    });
  },

  deleteAttachment: (id: number) =>
    apiFetch<{ id: number; deletedAt: string }>(`/attachments/${id}`, { method: 'DELETE' }),
};
