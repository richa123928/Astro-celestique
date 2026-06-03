import React, { createContext, useContext, useState } from 'react';

const TimezoneContext = createContext();

export const TIMEZONES = [
  { code: 'IST',  label: 'India',          zone: 'Asia/Kolkata',        offset: '+5:30' },
  { code: 'UTC',  label: 'London (UTC)',    zone: 'Europe/London',       offset: '+0:00' },
  { code: 'EST',  label: 'New York',        zone: 'America/New_York',    offset: '-5:00' },
  { code: 'PST',  label: 'Los Angeles',     zone: 'America/Los_Angeles', offset: '-8:00' },
  { code: 'GST',  label: 'Dubai',           zone: 'Asia/Dubai',          offset: '+4:00' },
  { code: 'SGT',  label: 'Singapore',       zone: 'Asia/Singapore',      offset: '+8:00' },
  { code: 'AEST', label: 'Sydney',          zone: 'Australia/Sydney',    offset: '+10:00' },
  { code: 'CET',  label: 'Paris',           zone: 'Europe/Paris',        offset: '+1:00' },
  { code: 'CST',  label: 'Chicago',         zone: 'America/Chicago',     offset: '-6:00' },
  { code: 'JST',  label: 'Tokyo',           zone: 'Asia/Tokyo',          offset: '+9:00' },
  { code: 'CAT',  label: 'Nairobi',         zone: 'Africa/Nairobi',      offset: '+3:00' },
  { code: 'BRT',  label: 'São Paulo',       zone: 'America/Sao_Paulo',   offset: '-3:00' },
];

export function TimezoneProvider({ children }) {
  const [timezone, setTimezone] = useState('IST');

  const currentTZ = TIMEZONES.find(t => t.code === timezone) || TIMEZONES[0];

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      timeZone: currentTZ.zone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      timeZone: currentTZ.zone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      timeZone: currentTZ.zone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <TimezoneContext.Provider value={{
      timezone,
      setTimezone,
      currentTZ,
      TIMEZONES,
      formatTime,
      formatDateTime,
      getCurrentTime
    }}>
      {children}
    </TimezoneContext.Provider>
  );
}

export const useTimezone = () => useContext(TimezoneContext);