async function fetchSponsorProfile(sponsorId) {
  try {
    const projectId = 'localhub-69fbe';
    const databaseId = 'ai-studio-atomy-8c095ab7-7361-4880-9af8-2d105a37ebb2';
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/sponsors/${sponsorId}`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}
fetchSponsorProfile('39823016');
