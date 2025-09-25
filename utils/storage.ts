import type { SavedReading, NewReading } from '../types';

const JOURNAL_KEY = 'goddessOracleJournal';
const BACKUP_KEY = 'goddessOracleJournalBackup';

// Data validation helper
const isValidReading = (reading: any): reading is SavedReading => {
  return (
    reading &&
    typeof reading.id === 'string' &&
    typeof reading.date === 'string' &&
    typeof reading.mode === 'string' &&
    Array.isArray(reading.cards) &&
    reading.cards.length > 0 &&
    Array.isArray(reading.generatedMessages) &&
    typeof reading.readingLevel === 'string'
  );
};

// Clean and validate readings data
const cleanReadingsData = (readings: any[]): SavedReading[] => {
  if (!Array.isArray(readings)) return [];

  return readings
    .filter(isValidReading)
    .map(reading => ({
      ...reading,
      // Ensure generatedMessages array has proper length
      generatedMessages: reading.generatedMessages.length === reading.cards.length
        ? reading.generatedMessages
        : reading.cards.map((_, index) => reading.generatedMessages[index] || null),
      // Ensure generatedImageUrl is properly set
      generatedImageUrl: reading.generatedImageUrl || null
    }));
};

export const getReadings = (): SavedReading[] => {
  try {
    const data = localStorage.getItem(JOURNAL_KEY);
    if (!data) return [];

    const parsedData = JSON.parse(data);
    const cleanedReadings = cleanReadingsData(parsedData);

    // If data was corrupted and cleaned, save the cleaned version
    if (cleanedReadings.length !== parsedData.length) {
      console.warn('Corrupted data found and cleaned:', parsedData.length - cleanedReadings.length, 'entries removed');
      localStorage.setItem(JOURNAL_KEY, JSON.stringify(cleanedReadings));
    }

    return cleanedReadings;
  } catch (error) {
    console.error("Error reading from localStorage", error);

    // Try to recover from backup
    try {
      const backupData = localStorage.getItem(BACKUP_KEY);
      if (backupData) {
        const backupReadings = cleanReadingsData(JSON.parse(backupData));
        console.info('Recovered', backupReadings.length, 'readings from backup');
        localStorage.setItem(JOURNAL_KEY, JSON.stringify(backupReadings));
        return backupReadings;
      }
    } catch (backupError) {
      console.error("Error reading from backup", backupError);
    }

    return [];
  }
};

export const saveReading = (reading: NewReading): boolean => {
  try {
    // Validate input data
    if (!reading || !reading.cards || reading.cards.length === 0) {
      console.error('Invalid reading data provided:', reading);
      return false;
    }

    console.log('Saving reading with data:', {
      mode: reading.mode,
      cardsLength: reading.cards.length,
      messagesLength: reading.generatedMessages?.length || 0,
      hasImageUrl: !!reading.generatedImageUrl,
      readingLevel: reading.readingLevel
    });

    const readings = getReadings();

    // Create backup before modifying
    try {
      localStorage.setItem(BACKUP_KEY, JSON.stringify(readings));
    } catch (backupError) {
      console.warn('Failed to create backup:', backupError);
    }

    const newReading: SavedReading = {
      ...reading,
      id: new Date().toISOString(),
      date: new Date().toLocaleString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      // Ensure generatedMessages array matches cards length
      generatedMessages: reading.cards.map((_, index) =>
        reading.generatedMessages && reading.generatedMessages[index] ? reading.generatedMessages[index] : null
      ),
      generatedImageUrl: reading.generatedImageUrl || null
    };

    // Validate the new reading
    if (!isValidReading(newReading)) {
      console.error('Created reading failed validation');
      return false;
    }

    const updatedReadings = [newReading, ...readings];

    // Limit the history size to prevent localStorage from getting too large
    if (updatedReadings.length > 50) {
      updatedReadings.splice(50);
    }

    localStorage.setItem(JOURNAL_KEY, JSON.stringify(updatedReadings));
    console.log('Reading saved successfully. Total readings:', updatedReadings.length);
    return true;
  } catch (error) {
    console.error("Error saving to localStorage", error);
    return false;
  }
};

export const clearReadings = (): void => {
  try {
    localStorage.removeItem(JOURNAL_KEY);
  } catch (error) {
    console.error("Error clearing localStorage", error);
  }
};