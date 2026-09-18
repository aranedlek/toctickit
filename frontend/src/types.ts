export interface User {
  id: number;
  name: string;
  email: string;
  role: 'REQUESTER' | 'IT_STAFF' | 'ADMINISTRATOR';
  isActive: boolean;
  requiresPasswordChange: boolean;
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
export type TicketStatus = 'NEW' | 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_REQUESTER' | 'RESOLVED' | 'CLOSED' | 'REOPENED' | 'CANCELLED';

export interface Comment {
  id: number;
  content: string;
  authorId: number;
  ticketId: number;
  createdAt: string;
  author?: User;
}

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
  itPriority: Priority;
  ticketOwnerId: number | null;
  requesterId: number;
  categoryId: number;
  relatedSystemId: number | null;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  relatedSystem?: RelatedSystem;
  requester?: Pick<User, 'id'|'name'|'email'>;
  ticketOwner?: Pick<User, 'id'|'name'|'email'>;
  attachments?: Attachment[];
  publicComments?: Comment[];
  internalNotes?: Comment[];
}

export interface PaginatedTickets {
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
