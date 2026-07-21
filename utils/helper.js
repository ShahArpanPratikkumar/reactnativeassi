export function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

export function formatDateTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function getPriorityColor(priority, colors) {
  switch (priority) {
    case 'High':
      return colors.error;
    case 'Medium':
      return colors.warning;
    case 'Low':
      return colors.success;
    default:
      return colors.textSecondary;
  }
}

export function validateSurveyFields(survey) {
  const errors = {};
  if (!survey.siteName || survey.siteName.trim() === '') {
    errors.siteName = 'Site name is required';
  }
  if (!survey.clientName || survey.clientName.trim() === '') {
    errors.clientName = 'Client name is required';
  }
  if (!survey.description || survey.description.trim() === '') {
    errors.description = 'Description is required';
  }
  if (!survey.priority) {
    errors.priority = 'Priority is required';
  }
  if (!survey.date) {
    errors.date = 'Date is required';
  }
  return errors;
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}
