import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildReceptionGpsWhatsAppUrl,
  buildReceptionReminderWhatsAppUrl,
  calculateComparisonPercentFromPointer,
  calculateLaserPrice,
  formatPhoneForWhatsApp,
  formatPriceDa,
  generateWorkingDays,
  isSlotBooked,
  isValidAlgerianPhone,
  parseClinicConfigFromSearch,
} from './clinicLogic';
import type { Appointment } from '../types/clinic';

test('parseClinicConfigFromSearch parses defaults and overrides correctly', () => {
  const defaultCfg = parseClinicConfigFromSearch('');
  assert.equal(defaultCfg.name, 'Clinique El Yasmine');
  assert.equal(defaultCfg.type, 'laser');
  assert.equal(defaultCfg.city, 'Hydra, Alger');
  assert.equal(defaultCfg.phone, '0550 42 18 90');
  assert.equal(defaultCfg.isAgencyDemo, false);

  const customCfg = parseClinicConfigFromSearch(
    '?name=Cabinet+Dentaire+Azur&type=dental&city=Oran+Centre&phone=0661+10+20+30&demo=agency'
  );
  assert.equal(customCfg.name, 'Cabinet Dentaire Azur');
  assert.equal(customCfg.type, 'dental');
  assert.equal(customCfg.city, 'Oran Centre');
  assert.equal(customCfg.phone, '0661 10 20 30');
  assert.equal(customCfg.isAgencyDemo, true);

  const unknownType = parseClinicConfigFromSearch('?type=invalid');
  assert.equal(unknownType.type, 'laser');

  const profileAndClinic = parseClinicConfigFromSearch(
    '?profile=dental&clinic=Clinic%20Name'
  );
  assert.equal(profileAndClinic.type, 'dental');
  assert.equal(profileAndClinic.name, 'Clinic Name');

  assert.equal(parseClinicConfigFromSearch('?profile=laser').type, 'laser');
  assert.equal(parseClinicConfigFromSearch('?profile=derma').type, 'derma');
  assert.equal(parseClinicConfigFromSearch('?profile=doctor').type, 'doctor');
});

test('isValidAlgerianPhone validates 05/06/07 numbers and rejects invalid formats', () => {
  assert.equal(isValidAlgerianPhone('0550 42 18 90'), true);
  assert.equal(isValidAlgerianPhone('0661998877'), true);
  assert.equal(isValidAlgerianPhone('0770-11-22-33'), true);
  assert.equal(isValidAlgerianPhone('+213550421890'), true);

  assert.equal(isValidAlgerianPhone('021 45 67 89'), false); // landline, not mobile
  assert.equal(isValidAlgerianPhone('0550 42 18'), false); // too short
  assert.equal(isValidAlgerianPhone('0850 42 18 90'), false); // invalid prefix
  assert.equal(isValidAlgerianPhone('abc'), false);
});

test('formatPhoneForWhatsApp converts Algerian mobile numbers to 213 international format', () => {
  assert.equal(formatPhoneForWhatsApp('0550 42 18 90'), '213550421890');
  assert.equal(formatPhoneForWhatsApp('+213 661 12 34 56'), '213661123456');
});

test('calculateLaserPrice computes 1 session vs Pack 6 (-20% Offert) accurately', () => {
  const single = calculateLaserPrice(12000, false);
  assert.equal(single.totalDa, 12000);
  assert.equal(single.savingsDa, 0);

  const pack = calculateLaserPrice(12000, true);
  assert.equal(pack.originalDa, 72000);
  assert.equal(pack.totalDa, 57600);
  assert.equal(pack.savingsDa, 14400);
  assert.equal(pack.perSessionDa, 9600);
  assert.equal(formatPriceDa(pack.totalDa), '57 600 DA');
});

test('generateWorkingDays returns 7 working days and excludes Friday', () => {
  // Wednesday, 25 Nov 2026
  const wednesday = new Date(2026, 10, 25);
  const days = generateWorkingDays(wednesday, 7);

  assert.equal(days.length, 7);
  assert.equal(days[0].label, "Aujourd'hui");
  assert.equal(days[0].isoDate, '2026-11-25');
  assert.equal(days[1].label, 'Demain');
  assert.equal(days[1].isoDate, '2026-11-26');
  // Friday 2026-11-27 must be skipped -> Saturday 2026-11-28
  assert.equal(days[2].isoDate, '2026-11-28');
  assert.equal(days[2].shortDay, 'Sam');

  for (const day of days) {
    const [y, m, d] = day.isoDate.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    assert.notEqual(dt.getDay(), 5, `Day ${day.isoDate} should not be Friday`);
  }
});

test('isSlotBooked prevents double booking for matching vertical, date, and time', () => {
  const appts: Appointment[] = [
    {
      id: '1',
      reference: '#RDV-2026-25101',
      vertical: 'laser',
      dateIso: '2026-11-25',
      dateLabel: "Aujourd'hui",
      time: '10:00',
      patientName: 'Amel Benali',
      patientPhone: '0551 22 33 44',
      serviceId: 'visage',
      serviceTitle: 'Visage complet',
      priceDa: 8500,
      status: 'Confirmé',
      createdAt: '2026-11-25T08:00:00Z',
    },
  ];

  assert.equal(isSlotBooked(appts, 'laser', '2026-11-25', '10:00'), true);
  assert.equal(isSlotBooked(appts, 'laser', '2026-11-25', '11:30'), false);
  assert.equal(isSlotBooked(appts, 'dental', '2026-11-25', '10:00'), false);
});

test('WhatsApp automation URLs include encoded patient details and 213 number', () => {
  const reminderUrl = buildReceptionReminderWhatsAppUrl({
    patientPhone: '0550 42 18 90',
    patientName: 'Amel Benali',
    clinicName: 'Clinique El Yasmine',
    dateLabel: "Aujourd'hui",
    time: '10:00',
    serviceTitle: 'Visage complet',
  });
  assert.ok(reminderUrl.startsWith('https://wa.me/213550421890?text='));
  assert.ok(decodeURIComponent(reminderUrl).includes('Amel Benali'));
  assert.ok(decodeURIComponent(reminderUrl).includes('10:00'));

  const gpsUrl = buildReceptionGpsWhatsAppUrl({
    patientPhone: '0661 88 99 00',
    patientName: 'Yacine Khelifi',
    clinicName: 'Clinique El Yasmine',
    clinicCity: 'Hydra, Alger',
    hoursLabel: 'Sam - Jeu : 08h30 - 17h30',
  });
  assert.ok(gpsUrl.startsWith('https://wa.me/213661889900?text='));
  assert.ok(decodeURIComponent(gpsUrl).includes('Hydra, Alger'));
  assert.ok(decodeURIComponent(gpsUrl).includes('google.com/maps'));
});

import { VERTICAL_PROFILES } from '../data/verticals';

test('all 4 verticals have symmetrical grids and 22 strictly unique photo URLs', () => {
  assert.equal(VERTICAL_PROFILES.laser.services.length, 6);
  assert.equal(VERTICAL_PROFILES.dental.services.length, 4);
  assert.equal(VERTICAL_PROFILES.derma.services.length, 4);
  assert.equal(VERTICAL_PROFILES.doctor.services.length, 4);

  const allPhotoUrls: string[] = [];
  for (const vertical of Object.values(VERTICAL_PROFILES)) {
    allPhotoUrls.push(vertical.heroImageUrl);
    for (const service of vertical.services) {
      allPhotoUrls.push(service.imageUrl);
    }
    assert.equal(vertical.trustPillars.length, 3);
    assert.equal(vertical.beforeAfterCases.length, 2);
    for (const ba of vertical.beforeAfterCases) {
      assert.ok(ba.tabLabel.length > 0);
      assert.ok(ba.title.length > 0);
      assert.ok(ba.durationMeta.length > 0);
      assert.ok(ba.beforeImageUrl.length > 0);
      assert.ok(ba.afterImageUrl.length > 0);
    }
    assert.equal(vertical.faqs.length, 3);
  }

  assert.equal(allPhotoUrls.length, 22);
  const normalizePhotoId = (url: string) => url.split('?')[0];
  assert.equal(new Set(allPhotoUrls.map(normalizePhotoId)).size, 22);
});

test('calculateComparisonPercentFromPointer clamps pointer coordinates smoothly', () => {
  assert.equal(calculateComparisonPercentFromPointer(150, 100, 200), 25);
  assert.equal(calculateComparisonPercentFromPointer(200, 100, 200), 50);
  assert.equal(calculateComparisonPercentFromPointer(90, 100, 200), 5);
  assert.equal(calculateComparisonPercentFromPointer(400, 100, 200), 95);
  assert.equal(calculateComparisonPercentFromPointer(100, 100, 0), 50);
});


