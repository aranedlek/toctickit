// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface Requester {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface RelatedSystem {
  id: number;
  name: string;
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TicketSummary {
  id: number;
  title: string;
  status: TicketStatus;
  priority: Priority;
  createdAt: string;
  category: Category;
}

export interface Attachment {
  id: number;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface TicketDetail {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  requesterId: number;
  category: Category;
  relatedSystem: RelatedSystem | null;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TicketFilters {
  search?: string;
  status?: TicketStatus | '';
  priority?: Priority | '';
  sortBy?: 'createdAt' | 'priority';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ─── Create Ticket Form ───────────────────────────────────────────────────────

export interface CreateTicketInput {
  title: string;
  description: string;
  categoryId: number | null;
  priority: Priority;
  relatedSystemId: number | null;
}

export interface PendingAttachment {
  file: File;
  id: string; // local UUID for tracking
}
