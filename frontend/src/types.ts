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

export interface ActionTaken {
  id: number;
  ticketId: number;
  actionDateTime: string;
  actionDescription: string;
  result: string;
  performedById: number;
  followUpRequired: boolean;
  followUpNote?: string | null;
  attachmentNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  performedBy?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
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
  version?: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  relatedSystem?: RelatedSystem;
  requester?: Pick<User, 'id'|'name'|'email'>;
  ticketOwner?: Pick<User, 'id'|'name'|'email'>;
  attachments?: Attachment[];
  publicComments?: Comment[];
  internalNotes?: Comment[];
  actionsTaken?: ActionTaken[];
}

export interface PaginatedTickets {
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StaffDashboardData {
  metrics: {
    unassignedCount: number;
    openCount: number;
    inProgressCount: number;
    waitingForRequesterCount: number;
    assignedToMeCount: number;
    totalActiveTickets: number;
  };
  priorityBreakdown: {
    URGENT: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  recentTickets: Array<{
    id: number;
    number?: string;
    title: string;
    status: TicketStatus;
    priority: Priority;
    itPriority?: Priority;
    ticketOwner?: { id: number; name: string } | null;
    requester?: { id: number; name: string } | null;
    updatedAt: string;
  }>;
}

export interface RequesterDashboardData {
  metrics: {
    myOpenTicketsCount: number;
    inProgressCount: number;
    waitingForRequesterCount: number;
    resolvedCount: number;
    closedCount: number;
  };
  recentTickets: Array<{
    id: number;
    number?: string;
    title: string;
    status: TicketStatus;
    priority: Priority;
    updatedAt: string;
  }>;
}

