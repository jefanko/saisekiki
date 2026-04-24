export const saveToHistory = (video: any) => {
  try {
    const history = JSON.parse(localStorage.getItem('watch_history') || '[]');
    // Keep only the last 20 videos, and avoid duplicates
    const filtered = history.filter((v: any) => v.id !== video.id);
    const newHistory = [video, ...filtered].slice(0, 20);
    localStorage.setItem('watch_history', JSON.stringify(newHistory));
  } catch (e) {
    console.error('Failed to save to history', e);
  }
};

export const getHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('watch_history') || '[]');
  } catch (e) {
    return [];
  }
};

export const saveSearch = (query: string) => {
  try {
    const searches = JSON.parse(localStorage.getItem('search_history') || '[]');
    const filtered = searches.filter((s: string) => s !== query);
    const newSearches = [query, ...filtered].slice(0, 10);
    localStorage.setItem('search_history', JSON.stringify(newSearches));
  } catch (e) {}
};

export const getSearchHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('search_history') || '[]');
  } catch (e) {
    return [];
  }
};
