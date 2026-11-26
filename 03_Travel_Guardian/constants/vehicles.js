// Travel Guardian - Vehicle Options & Helpers
// Single source of truth for all travel modes and vehicle display icons

export const VEHICLE_OPTIONS = [
  { id: 'Car', label: 'Car', icon: '🚗' },
  { id: 'Bike', label: 'Bike', icon: '🏍️' },
  { id: 'Bus', label: 'Bus', icon: '🚌' },
  { id: 'Train', label: 'Train', icon: '🚆' },
  { id: 'Flight', label: 'Flight', icon: '✈️' },
  { id: 'Taxi', label: 'Taxi', icon: '🚕' },
  { id: 'Walking', label: 'Walking', icon: '🚶' },
  { id: 'Bicycle', label: 'Bicycle', icon: '🚲' },
  { id: 'Auto Rickshaw', label: 'Auto', icon: '🛺' },
  { id: 'Other', label: 'Other', icon: '🗺️' },
];

// Returns appropriate emoji icon for a vehicle string
export const getVehicleIcon = (type = '') => {
  const t = (type || '').toLowerCase();
  if (t.includes('bike')) return '🏍️';
  if (t.includes('bus')) return '🚌';
  if (t.includes('train')) return '🚆';
  if (t.includes('flight') || t.includes('plane')) return '✈️';
  if (t.includes('taxi') || t.includes('cab')) return '🚕';
  if (t.includes('walk')) return '🚶';
  if (t.includes('bicycle')) return '🚲';
  if (t.includes('auto') || t.includes('rickshaw')) return '🛺';
  if (t.includes('car')) return '🚗';
  return '🚗';
};

// Returns icon and friendly label for travel status displays
export const getVehicleDisplay = (vehicleType) => {
  const v = (vehicleType || 'Car').toLowerCase();
  if (v.includes('bike')) return { icon: '🏍️', label: 'Bike' };
  if (v.includes('bus')) return { icon: '🚌', label: 'Bus' };
  if (v.includes('train')) return { icon: '🚆', label: 'Train' };
  if (v.includes('flight') || v.includes('plane')) return { icon: '✈️', label: 'Flight' };
  if (v.includes('taxi') || v.includes('cab')) return { icon: '🚕', label: 'Taxi' };
  if (v.includes('walk')) return { icon: '🚶', label: 'Walking' };
  if (v.includes('bicycle')) return { icon: '🚲', label: 'Bicycle' };
  if (v.includes('auto') || v.includes('rickshaw')) return { icon: '🛺', label: 'Auto Rickshaw' };
  return { icon: '🚗', label: vehicleType || 'Car' };
};

export default {
  VEHICLE_OPTIONS,
  getVehicleIcon,
  getVehicleDisplay,
};
