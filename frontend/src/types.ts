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

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Attachment {
  id: number;
  ticketId: number;
  filename: string;
  url?: string;
  sizeBytes: number;
  mimeType: string;
  deletedAt: string | null;
}

export interface Ticket {
  id: number;
  number: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  requesterId: number;
  categoryId: number;
  relatedSystemId: number | null;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  relatedSystem?: RelatedSystem;
  attachments?: Attachment[];
}

export interface PaginatedTickets {
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
