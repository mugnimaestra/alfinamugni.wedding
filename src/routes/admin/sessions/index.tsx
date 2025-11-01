import { component$, useSignal, useTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../components/ui/dialog";
import { LuPlus, LuCopy, LuQrCode, LuEye, LuToggleLeft, LuToggleRight, LuDownload } from "@qwikest/icons/lucide";
import { toast } from "sonner";
import type { GallerySession } from "../../../lib/database";

export default component$(() => {
  const sessions = useSignal<GallerySession[]>([]);
  const loading = useSignal(true);
  const isCreateOpen = useSignal(false);
  const qrModalOpen = useSignal(false);
  const selectedSession = useSignal<GallerySession | null>(null);

  // Create session form
  const newTitle = useSignal("");
  const newDescription = useSignal("");
  const newPrefix = useSignal("wdng");
  const creating = useSignal(false);

  // Load sessions on mount
  useTask$(async () => {
    await fetchSessions();
  });

  const fetchSessions = $(async () => {
    try {
      loading.value = true;
      const response = await fetch('/api/admin/sessions');
      const result = await response.json();

      if (result.success) {
        sessions.value = result.sessions;
      } else {
        toast.error('Failed to load sessions');
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      loading.value = false;
    }
  });

  const handleCreateSession = $(async () => {
    if (!newTitle.value.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      creating.value = true;

      const response = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.value,
          description: newDescription.value,
          is_active: true,
          prefix: newPrefix.value,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Session created successfully!');
        await fetchSessions();
        
        // Reset form
        newTitle.value = "";
        newDescription.value = "";
        newPrefix.value = "wdng";
        isCreateOpen.value = false;

        // Show QR modal for new session
        selectedSession.value = result.session;
        qrModalOpen.value = true;
      } else {
        toast.error(result.error || 'Failed to create session');
      }
    } catch (error) {
      console.error('Create error:', error);
      toast.error('Failed to create session');
    } finally {
      creating.value = false;
    }
  });

  const handleCopyLink = $(async (sessionId: string) => {
    const url = `${window.location.origin}/g/${sessionId}`;
    
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy link');
    }
  });

  const handleToggleActive = $(async (session: GallerySession) => {
    try {
      const response = await fetch(`/api/admin/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: !session.is_active,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Session ${result.session.is_active ? 'activated' : 'deactivated'}`);
        await fetchSessions();
      } else {
        toast.error('Failed to update session');
      }
    } catch (error) {
      console.error('Toggle error:', error);
      toast.error('Failed to update session');
    }
  });

  const handleShowQR = $((session: GallerySession) => {
    selectedSession.value = session;
    qrModalOpen.value = true;
  });

  const handleDownloadQR = $(() => {
    if (!selectedSession.value?.qr_code_url) return;

    const link = document.createElement('a');
    link.href = selectedSession.value.qr_code_url;
    link.download = `${selectedSession.value.session_id}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div class="space-y-8 p-6">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-semibold text-gray-900">Gallery Sessions</h1>
          <p class="mt-2 text-sm text-gray-600">
            Manage gallery upload sessions with shareable links and QR codes
          </p>
        </div>
        <Button
          onClick$={() => (isCreateOpen.value = true)}
          class="bg-wedding-brown hover:bg-wedding-brown/90 text-white"
        >
          <LuPlus class="w-4 h-4 mr-2" />
          Create New Session
        </Button>
      </div>

      {/* Stats Cards */}
      <div class="grid gap-4 md:grid-cols-3">
        <Card class="p-6">
          <div class="text-sm font-medium text-gray-600">Total Sessions</div>
          <div class="mt-2 text-3xl font-bold text-gray-900">{sessions.value.length}</div>
        </Card>
        <Card class="p-6">
          <div class="text-sm font-medium text-gray-600">Active Sessions</div>
          <div class="mt-2 text-3xl font-bold text-green-600">
            {sessions.value.filter(s => s.is_active).length}
          </div>
        </Card>
        <Card class="p-6">
          <div class="text-sm font-medium text-gray-600">Total Photos</div>
          <div class="mt-2 text-3xl font-bold text-wedding-brown">
            {sessions.value.reduce((sum, s) => sum + s.photo_count, 0)}
          </div>
        </Card>
      </div>

      {/* Sessions List */}
      {loading.value ? (
        <div class="text-center py-12">
          <div class="animate-pulse">Loading sessions...</div>
        </div>
      ) : sessions.value.length === 0 ? (
        <Card class="p-12 text-center">
          <div class="text-gray-400 mb-4">No sessions yet</div>
          <Button
            onClick$={() => (isCreateOpen.value = true)}
            class="bg-wedding-brown hover:bg-wedding-brown/90 text-white"
          >
            <LuPlus class="w-4 h-4 mr-2" />
            Create Your First Session
          </Button>
        </Card>
      ) : (
        <div class="space-y-4">
          {sessions.value.map((session) => (
            <Card key={session.id} class="p-6">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-3">
                    <h3 class="text-xl font-semibold text-gray-900">{session.title}</h3>
                    {session.is_active ? (
                      <Badge class="bg-green-100 text-green-700 hover:bg-green-100">
                        🟢 Active
                      </Badge>
                    ) : (
                      <Badge class="bg-gray-100 text-gray-600 hover:bg-gray-100">
                        🔴 Inactive
                      </Badge>
                    )}
                  </div>

                  <div class="mt-2 space-y-1">
                    <p class="text-sm text-gray-600 font-mono">/g/{session.session_id}</p>
                    {session.description && (
                      <p class="text-sm text-gray-600">{session.description}</p>
                    )}
                  </div>

                  <div class="mt-4 flex items-center gap-6 text-sm text-gray-500">
                    <span>📸 {session.photo_count} photos</span>
                    <span>📅 Created: {formatDate(session.created_at)}</span>
                    {session.last_upload_at && (
                      <span>⏰ Last upload: {getTimeAgo(session.last_upload_at)}</span>
                    )}
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick$={() => handleCopyLink(session.session_id)}
                    title="Copy share link"
                  >
                    <LuCopy class="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick$={() => handleShowQR(session)}
                    title="View QR code"
                  >
                    <LuQrCode class="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick$={() => window.open(`/g/${session.session_id}`, '_blank')}
                    title="View gallery"
                  >
                    <LuEye class="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick$={() => handleToggleActive(session)}
                    title={session.is_active ? 'Deactivate' : 'Activate'}
                    class={session.is_active ? 'text-green-600' : 'text-gray-400'}
                  >
                    {session.is_active ? (
                      <LuToggleRight class="w-4 h-4" />
                    ) : (
                      <LuToggleLeft class="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Session Dialog */}
      {isCreateOpen.value && (
        <Dialog open={isCreateOpen.value} onOpenChange$={(open: boolean) => (isCreateOpen.value = open)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Gallery Session</DialogTitle>
              <DialogDescription>
                Create a new session with a unique shareable link for guests to upload photos
              </DialogDescription>
            </DialogHeader>

            <div class="space-y-4 mt-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Title <span class="text-red-500">*</span>
                </label>
                <Input
                  value={newTitle.value}
                  onInput$={(e) => (newTitle.value = (e.target as HTMLInputElement).value)}
                  placeholder="Wedding Day - November 29, 2025"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <Textarea
                  value={newDescription.value}
                  onInput$={(e) => (newDescription.value = (e.target as HTMLTextAreaElement).value)}
                  placeholder="Share your favorite moments from our special day!"
                  rows={3}
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Session ID Prefix
                </label>
                <Input
                  value={newPrefix.value}
                  onInput$={(e) => (newPrefix.value = (e.target as HTMLInputElement).value)}
                  placeholder="wdng"
                  maxLength={4}
                />
                <p class="mt-1 text-xs text-gray-500">
                  4 letters only (e.g., "wdng" → wdng-a7b3c4d5)
                </p>
              </div>

              <div class="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick$={() => (isCreateOpen.value = false)}
                  disabled={creating.value}
                >
                  Cancel
                </Button>
                <Button
                  onClick$={handleCreateSession}
                  disabled={creating.value || !newTitle.value.trim()}
                  class="bg-wedding-brown hover:bg-wedding-brown/90 text-white"
                >
                  {creating.value ? 'Creating...' : 'Create Session'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* QR Code Modal */}
      {qrModalOpen.value && selectedSession.value && (
        <Dialog open={qrModalOpen.value} onOpenChange$={(open: boolean) => (qrModalOpen.value = open)}>
          <DialogContent class="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedSession.value.title}</DialogTitle>
              <DialogDescription>
                Share this QR code or link with guests
              </DialogDescription>
            </DialogHeader>

            <div class="space-y-4 mt-4">
              {selectedSession.value.qr_code_url && (
                <div class="flex justify-center">
                  <img
                    src={selectedSession.value.qr_code_url}
                    alt="QR Code"
                    width="256"
                    height="256"
                    class="w-64 h-64 border-4 border-wedding-beige rounded-lg"
                  />
                </div>
              )}

              <div class="text-center">
                <code class="text-sm bg-gray-100 px-3 py-2 rounded">
                  {window.location.origin}/g/{selectedSession.value.session_id}
                </code>
              </div>

              <div class="flex gap-3">
                <Button
                  variant="outline"
                  onClick$={() => handleCopyLink(selectedSession.value!.session_id)}
                  class="flex-1"
                >
                  <LuCopy class="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  onClick$={handleDownloadQR}
                  class="flex-1"
                >
                  <LuDownload class="w-4 h-4 mr-2" />
                  Download QR
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: "Gallery Sessions - Admin",
  meta: [
    {
      name: "description",
      content: "Manage gallery upload sessions",
    },
  ],
};
