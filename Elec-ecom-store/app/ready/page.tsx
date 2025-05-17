// app/health/page.tsx

import React from 'react';

interface HealthResponse {
  status: string;
}

export default async function HealthPage() {
  // Use an absolute URL if NEXTAUTH_URL is defined; otherwise, rely on a relative path.
  const apiUrl = process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/api/health`
    : '/api/health';

  // Fetch the health check data from the API route without caching.
  let healthData: HealthResponse = { status: 'Not Ready' };

  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (res.ok) {
      healthData = await res.json();
    }
  } catch (error) {
    console.error('Error fetching health status:', error);
  }

  return (
    <main style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>App Health Check</h1>
      <p>Status: {healthData.status}</p>
    </main>
  );
}