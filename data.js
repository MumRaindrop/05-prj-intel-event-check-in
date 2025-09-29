// Simple persistence helpers using localStorage
(function() {
  var STORAGE_KEY = 'intelEventCheckInData_v1';

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error loading data from localStorage', e);
      return null;
    }
  }

  function save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving data to localStorage', e);
    }
  }

  function clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing data from localStorage', e);
    }
  }

  // Expose a small API on window
  window.CheckInData = {
    load: load,
    save: save,
    clear: clear
  };
})();
