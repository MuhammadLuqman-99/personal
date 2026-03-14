'use client';

import { useCallback, useRef } from 'react';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

interface PickerResult {
  name: string;
  url: string;
  mimeType: string;
}

let gapiLoaded = false;
let gisLoaded = false;
let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let accessToken: string | null = null;

declare global {
  interface Window {
    gapi: typeof gapi;
    google: typeof google;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function ensureGapiLoaded() {
  if (gapiLoaded) return;
  await loadScript('https://apis.google.com/js/api.js');
  await new Promise<void>((resolve) => {
    window.gapi.load('picker', () => {
      gapiLoaded = true;
      resolve();
    });
  });
}

async function ensureGisLoaded() {
  if (gisLoaded) return;
  await loadScript('https://accounts.google.com/gsi/client');
  gisLoaded = true;
}

export function useGoogleDrivePicker() {
  const callbackRef = useRef<((result: PickerResult | null) => void) | null>(null);

  const openPicker = useCallback(async (onResult: (result: PickerResult | null) => void) => {
    callbackRef.current = onResult;

    await Promise.all([ensureGapiLoaded(), ensureGisLoaded()]);

    // If no token, request one
    if (!accessToken) {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.access_token) {
            accessToken = response.access_token;
            showPicker();
          }
        },
      });
      tokenClient.requestAccessToken();
    } else {
      showPicker();
    }

    function showPicker() {
      // Upload view - lets user upload new files
      const uploadView = new window.google.picker.DocsUploadView();

      // Docs view - lets user pick existing PDFs
      const docsView = new window.google.picker.DocsView()
        .setIncludeFolders(true)
        .setMimeTypes('application/pdf');

      // Extract project number from client ID (before the dash)
      const appId = CLIENT_ID.split('-')[0];

      const picker = new window.google.picker.PickerBuilder()
        .addView(uploadView)
        .addView(docsView)
        .setOAuthToken(accessToken!)
        .setDeveloperKey(API_KEY)
        .setAppId(appId)
        .setCallback(async (data: google.picker.ResponseObject) => {
          if (data.action === 'picked' && data.docs && data.docs.length > 0) {
            const doc = data.docs[0];
            const fileId = doc.id;

            // Make the file publicly readable
            try {
              await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    role: 'reader',
                    type: 'anyone',
                  }),
                }
              );
            } catch {
              // Permission might already exist
            }

            const viewUrl = `https://drive.google.com/file/d/${fileId}/preview`;

            callbackRef.current?.({
              name: doc.name || 'Untitled',
              url: viewUrl,
              mimeType: doc.mimeType || 'application/pdf',
            });
          } else if (data.action === 'cancel') {
            callbackRef.current?.(null);
          }
        })
        .setTitle('Select or Upload PDF')
        .build();

      picker.setVisible(true);
    }
  }, []);

  return { openPicker };
}
