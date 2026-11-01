import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActionsTakenSection from '../../components/ActionsTakenSection';
import type { ActionTaken } from '../../types';

// Mock the API fetch
const { mockFetchApi } = vi.hoisted(() => ({ mockFetchApi: vi.fn() }));
vi.mock('../../lib/api', () => ({
  fetchApi: mockFetchApi,
}));

describe('ActionsTakenSection Component (Lab 04 - Issue 3)', () => {
  const sampleActions: ActionTaken[] = [
    {
      id: 101,
      ticketId: 1,
      actionDateTime: '2026-05-12T10:15:00.000Z',
      actionDescription: 'Replaced faulty RAM module in motherboard slot 2.',
      result: 'Diagnostic memory test passed with 0 errors.',
      performedById: 2,
      followUpRequired: false,
      followUpNote: null,
      attachmentNotes: 'ram-benchmark.png',
      createdAt: '2026-05-12T10:15:00.000Z',
      updatedAt: '2026-05-12T10:15:00.000Z',
      performedBy: {
        id: 2,
        name: 'Michael IT',
        email: 'michael.it@toktick.internal',
        role: 'IT_STAFF',
      },
    },
    {
      id: 102,
      ticketId: 1,
      actionDateTime: '2026-05-12T14:30:00.000Z',
      actionDescription: 'Configured VLAN routing on switch port 24.',
      result: 'Ping latency dropped below 2ms, but packet loss intermittently observed.',
      performedById: 3,
      followUpRequired: true,
      followUpNote: 'Monitor switch logs at 17:00 and replace patch cable if drops continue.',
      attachmentNotes: null,
      createdAt: '2026-05-12T14:30:00.000Z',
      updatedAt: '2026-05-12T14:30:00.000Z',
      performedBy: {
        id: 3,
        name: 'Sarah IT',
        email: 'sarah.it@toktick.internal',
        role: 'IT_STAFF',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UI-01: Actions Taken List Rendering', () => {
    it('renders empty state when there are 0 actions taken', () => {
      render(
        <ActionsTakenSection
          ticketId={1}
          actions={[]}
          onActionSaved={vi.fn()}
          canManage={true}
          currentUserName="Michael IT"
        />
      );

      expect(screen.getByText('Actions Taken')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByTestId('actions-empty-state')).toBeInTheDocument();
      expect(screen.getByText('No actions taken recorded yet')).toBeInTheDocument();
      expect(screen.getByText(/Click "\+ Record Action Taken" above to log work done/)).toBeInTheDocument();
    });

    it('renders data table with all required fields when actions exist', () => {
      render(
        <ActionsTakenSection
          ticketId={1}
          actions={sampleActions}
          onActionSaved={vi.fn()}
          canManage={true}
          currentUserName="Michael IT"
        />
      );

      expect(screen.getByText('Actions Taken')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();

      // Check Action 1 details
      expect(screen.getByText('Replaced faulty RAM module in motherboard slot 2.')).toBeInTheDocument();
      expect(screen.getByText('Diagnostic memory test passed with 0 errors.')).toBeInTheDocument();
      expect(screen.getByText('Michael IT')).toBeInTheDocument();
      expect(screen.getByText('📎 ram-benchmark.png')).toBeInTheDocument();

      // Check Action 2 details with follow-up
      expect(screen.getByText('Configured VLAN routing on switch port 24.')).toBeInTheDocument();
      expect(screen.getByText('Sarah IT')).toBeInTheDocument();
      expect(screen.getByText(/⚠️ Follow-up Required/)).toBeInTheDocument();
      expect(screen.getByText('Monitor switch logs at 17:00 and replace patch cable if drops continue.')).toBeInTheDocument();
    });
  });

  describe('UI-03: Requester Read-Only View', () => {
    it('hides "+ Record Action Taken" button and Edit buttons when canManage is false', () => {
      render(
        <ActionsTakenSection
          ticketId={1}
          actions={sampleActions}
          onActionSaved={vi.fn()}
          canManage={false}
          currentUserName="Anya Requester"
        />
      );

      // Verify header and table are visible
      expect(screen.getByText('Actions Taken')).toBeInTheDocument();
      expect(screen.getByText('Replaced faulty RAM module in motherboard slot 2.')).toBeInTheDocument();

      // Verify management buttons are hidden
      expect(screen.queryByTestId('record-action-btn')).not.toBeInTheDocument();
      expect(screen.queryByTestId('edit-action-101')).not.toBeInTheDocument();
      expect(screen.queryByTestId('edit-action-102')).not.toBeInTheDocument();
    });
  });

  describe('UI-02: Modal Validation & Creation Flow', () => {
    it('opens modal, validates required fields, enforces conditional follow-up note, and creates action', async () => {
      const user = userEvent.setup();
      const onActionSaved = vi.fn();

      render(
        <ActionsTakenSection
          ticketId={1}
          actions={[]}
          onActionSaved={onActionSaved}
          canManage={true}
          currentUserName="Michael IT"
        />
      );

      // Click "+ Record Action Taken"
      await user.click(screen.getByTestId('record-action-btn'));

      // Modal should appear
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Record Action Taken' })).toBeInTheDocument();
      expect(screen.getByLabelText('Performed By')).toHaveValue('Michael IT');

      const descInput = screen.getByLabelText(/Action Description/);
      const resultInput = screen.getByLabelText(/Result/);
      const saveBtn = screen.getByTestId('save-action-btn');

      // Test validation: description < 5 characters
      await user.type(descInput, 'Fix');
      await user.type(resultInput, 'OK');
      await user.click(saveBtn);

      expect(screen.getByText('Action description is required (min 5 characters).')).toBeInTheDocument();
      expect(screen.getByText('Result is required (min 3 characters).')).toBeInTheDocument();

      // Fix description and result
      await user.clear(descInput);
      await user.type(descInput, 'Reinstalled network adapter drivers');
      await user.clear(resultInput);
      await user.type(resultInput, 'Interface came up');

      // Check follow-up required checkbox
      const followUpToggle = screen.getByLabelText('Further Follow-Up Required?');
      await user.click(followUpToggle);

      // Now followUpNote should be mandatory
      expect(screen.getByLabelText(/Follow-Up Note/)).toBeInTheDocument();
      await user.click(saveBtn);
      expect(screen.getByText('Follow-up note is required when follow-up is needed.')).toBeInTheDocument();

      // Fill in followUpNote and optional attachmentNotes
      await user.type(screen.getByLabelText(/Follow-Up Note/), 'Check with user tomorrow morning.');
      await user.type(screen.getByLabelText(/Attachment Notes/), 'driver-install.log');

      // Mock API success
      const newAction: ActionTaken = {
        id: 103,
        ticketId: 1,
        actionDateTime: new Date().toISOString(),
        actionDescription: 'Reinstalled network adapter drivers',
        result: 'Interface came up',
        performedById: 2,
        followUpRequired: true,
        followUpNote: 'Check with user tomorrow morning.',
        attachmentNotes: 'driver-install.log',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        performedBy: { id: 2, name: 'Michael IT', email: 'michael@test.com', role: 'IT_STAFF' },
      };
      mockFetchApi.mockResolvedValueOnce(newAction);

      // Submit form
      await user.click(saveBtn);

      await waitFor(() => {
        expect(mockFetchApi).toHaveBeenCalledWith('/tickets/1/actions', {
          method: 'POST',
          body: expect.stringContaining('"actionDescription":"Reinstalled network adapter drivers"'),
        });
        expect(onActionSaved).toHaveBeenCalledWith(newAction);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('opens edit modal pre-populated and successfully updates action', async () => {
      const user = userEvent.setup();
      const onActionSaved = vi.fn();

      render(
        <ActionsTakenSection
          ticketId={1}
          actions={sampleActions}
          onActionSaved={onActionSaved}
          canManage={true}
          currentUserName="Michael IT"
        />
      );

      // Click Edit on Action 101
      await user.click(screen.getByTestId('edit-action-101'));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Edit Action Taken' })).toBeInTheDocument();

      const descInput = screen.getByLabelText(/Action Description/);
      expect(descInput).toHaveValue('Replaced faulty RAM module in motherboard slot 2.');

      // Update description
      await user.clear(descInput);
      await user.type(descInput, 'Replaced faulty RAM module and cleaned heat sink.');

      const updatedAction = {
        ...sampleActions[0],
        actionDescription: 'Replaced faulty RAM module and cleaned heat sink.',
      };
      mockFetchApi.mockResolvedValueOnce(updatedAction);

      await user.click(screen.getByTestId('save-action-btn'));

      await waitFor(() => {
        expect(mockFetchApi).toHaveBeenCalledWith('/tickets/1/actions/101', {
          method: 'PATCH',
          body: expect.stringContaining('"actionDescription":"Replaced faulty RAM module and cleaned heat sink."'),
        });
        expect(onActionSaved).toHaveBeenCalledWith(updatedAction);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });
});
