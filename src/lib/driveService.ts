export interface BackupData {
  topics: any[];
  articles: any[];
  accessLogs: any[];
}

export async function getBackupFileId(accessToken: string): Promise<string | null> {
  const q = encodeURIComponent("name = 'backup.json' and 'appDataFolder' in parents and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&spaces=appDataFolder&fields=files(id,name)`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to list backup files: ${res.statusText}`);
  }
  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
}

export async function downloadBackup(accessToken: string, fileId: string): Promise<BackupData | null> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to download backup: ${res.statusText}`);
  }
  return await res.json();
}

export async function uploadBackup(accessToken: string, payload: BackupData): Promise<string> {
  let fileId = await getBackupFileId(accessToken);
  
  if (!fileId) {
    // 1. Create file metadata in appDataFolder
    const metadataRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'backup.json',
        parents: ['appDataFolder'],
        mimeType: 'application/json'
      }),
    });
    if (!metadataRes.ok) {
      throw new Error(`Failed to create backup file metadata: ${metadataRes.statusText}`);
    }
    const metadata = await metadataRes.json();
    fileId = metadata.id;
  }

  if (!fileId) {
    throw new Error('Could not resolve or create backup file ID');
  }

  // 2. Upload actual JSON content (media stream) to the fileId
  const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
  const contentRes = await fetch(uploadUrl, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!contentRes.ok) {
    throw new Error(`Failed to upload backup content: ${contentRes.statusText}`);
  }

  return fileId;
}
