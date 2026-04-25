// Local API client to replace Firebase since it was declined
export const db = {
  getMissingPersons: async () => {
    const res = await fetch('/api/missing-persons');
    return res.json();
  },
  reportMissing: async (data: any) => {
    const res = await fetch('/api/missing-persons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  markFound: async (personId: string) => {
    const res = await fetch('/api/mark-found', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personId }),
    });
    return res.json();
  },
  reportSighting: async (data: any) => {
    const res = await fetch('/api/sightings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }
};

// Simplified Auth Mock
export const auth = {
  currentUser: { uid: 'guest-user', email: 'guest@example.com' },
  onAuthStateChanged: (cb: any) => {
    cb({ uid: 'guest-user', email: 'guest@example.com' });
  }
};

export const loginWithGoogle = async () => {
  // In a real local version we could persist a user in localStorage
  return auth.currentUser;
};
