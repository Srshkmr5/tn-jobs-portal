#!/usr/bin/env node
/**
 * Tamil Nadu Public Job Portal - Automated Maintenance & Freshness Engine
 * Validates deadlines, prunes expired notifications, and appends new verified opportunities.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JOBS_FILE = path.join(__dirname, 'data', 'jobs.json');
const ARCHIVE_FILE = path.join(__dirname, 'data', 'archived-jobs.json');

function loadJobs() {
  if (!fs.existsSync(JOBS_FILE)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(JOBS_FILE, 'utf8'));
}

function saveJobs(jobs) {
  fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2), 'utf8');
}

function loadArchived() {
  if (!fs.existsSync(ARCHIVE_FILE)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(ARCHIVE_FILE, 'utf8'));
}

function saveArchived(archived) {
  fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(archived, null, 2), 'utf8');
}

export function checkFreshness() {
  const jobs = loadJobs();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let active = 0;
  let expiringSoon = 0; // <= 7 days
  let expired = 0;

  console.log(`\n🔍 Checking freshness for ${jobs.length} jobs in Tamil Nadu portal...\n`);

  jobs.forEach(job => {
    const deadline = new Date(job.deadline);
    const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      expired++;
      console.log(`❌ EXPIRED: [${job.id}] ${job.title} (Deadline was ${job.deadline})`);
    } else if (diffDays <= 7) {
      expiringSoon++;
      console.log(`⚠️ CLOSING SOON (${diffDays}d left): [${job.id}] ${job.title}`);
    } else {
      active++;
    }
  });

  console.log('\n📊 Summary:');
  console.log(`  Active:        ${active}`);
  console.log(`  Closing Soon:  ${expiringSoon}`);
  console.log(`  Expired:       ${expired}`);
  return { active, expiringSoon, expired };
}

export function archiveExpired() {
  const jobs = loadJobs();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeJobs = [];
  const newlyExpired = [];

  jobs.forEach(job => {
    const deadline = new Date(job.deadline);
    if (deadline < today) {
      newlyExpired.push({
        ...job,
        archived_at: new Date().toISOString()
      });
    } else {
      activeJobs.push(job);
    }
  });

  if (newlyExpired.length > 0) {
    const archive = loadArchived();
    const updatedArchive = [...archive, ...newlyExpired];
    saveArchived(updatedArchive);
    saveJobs(activeJobs);
    console.log(`📦 Archived ${newlyExpired.length} expired listings. ${activeJobs.length} active remaining.`);
  } else {
    console.log(`✅ No expired listings found. All ${jobs.length} jobs are active.`);
  }
}

export function printStats() {
  const jobs = loadJobs();
  let totalVacancies = 0;
  const sectors = {};
  const locations = {};
  const quals = {};

  jobs.forEach(j => {
    if (typeof j.vacancies === 'number') totalVacancies += j.vacancies;
    sectors[j.sector] = (sectors[j.sector] || 0) + 1;
    locations[j.location] = (locations[j.location] || 0) + 1;
    quals[j.qualification_level] = (quals[j.qualification_level] || 0) + 1;
  });

  console.log('\n======================================================');
  console.log('🏛️  TN CAREER COMPASS - LIVE DATA METRICS');
  console.log('======================================================');
  console.log(`Total Opportunities: ${jobs.length}`);
  console.log(`Total Vacancies:     ${totalVacancies.toLocaleString('en-IN')}+`);
  console.log('\nSectors:');
  Object.entries(sectors).forEach(([k, v]) => console.log(`  - ${k}: ${v}`));
  console.log('\nQualifications:');
  Object.entries(quals).forEach(([k, v]) => console.log(`  - ${k}: ${v}`));
  console.log('======================================================\n');
}

// CLI handler
const arg = process.argv[2];
if (arg === '--archive') {
  archiveExpired();
} else if (arg === '--stats') {
  printStats();
} else {
  checkFreshness();
}
