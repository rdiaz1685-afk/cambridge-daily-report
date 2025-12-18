import { DailyReport } from '../types';
import { MOCK_REPORTS } from './mockData';

const STORAGE_KEY = 'cambridge_daily_reports';

export const saveReport = (report: DailyReport): void => {
  const existingCheck = localStorage.getItem(STORAGE_KEY);
  let reports: DailyReport[] = existingCheck ? JSON.parse(existingCheck) : [];
  reports.push(report);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
};

export const getReports = (): DailyReport[] => {
  const existingCheck = localStorage.getItem(STORAGE_KEY);
  const storedReports: DailyReport[] = existingCheck ? JSON.parse(existingCheck) : [];
  
  // Combine stored reports with mock reports for the demo
  // We filter mock reports to avoid duplicates if they were somehow saved locally with same IDs (unlikely in this setup)
  const combinedReports = [...MOCK_REPORTS, ...storedReports];
  
  // Remove duplicates by ID just in case
  const uniqueReports = Array.from(new Map(combinedReports.map(item => [item.id, item])).values());
  
  return uniqueReports;
};

export const getReportsByStudent = (studentId: string): DailyReport[] => {
  const reports = getReports();
  return reports.filter(r => r.studentId === studentId).sort((a, b) => b.timestamp - a.timestamp);
};

export const getReportsByTeacher = (teacherId: string): DailyReport[] => {
  const reports = getReports();
  return reports.filter(r => r.teacherId === teacherId).sort((a, b) => b.timestamp - a.timestamp);
};