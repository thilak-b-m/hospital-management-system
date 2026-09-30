import api from '../api/axios';

const fileExtension = (contentType = '') => ({
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}[contentType.split(';')[0]] || 'file');

const fetchReportBlob = async (reportId) => {
  const { data } = await api.get(`/reports/file/${reportId}`, { responseType: 'blob' });
  return data;
};

export async function openReportFile(reportId) {
  const popup = window.open('about:blank', '_blank');
  if (popup) popup.opener = null;

  try {
    const blob = await fetchReportBlob(reportId);
    const fileUrl = URL.createObjectURL(blob);
    if (popup) {
      popup.location.replace(fileUrl);
    } else {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.rel = 'noopener';
      link.click();
    }
    window.setTimeout(() => URL.revokeObjectURL(fileUrl), 60_000);
  } catch (error) {
    popup?.close();
    throw error;
  }
}

export async function downloadReportFile(reportId) {
  const blob = await fetchReportBlob(reportId);
  const fileUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = `medical-report-${reportId}.${fileExtension(blob.type)}`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(fileUrl), 60_000);
}