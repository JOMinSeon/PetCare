export interface FHIRPatient {
  resourceType: 'Patient';
  id: string;
  identifier?: { system: string; value: string }[];
  name?: { given: string[]; family: string }[];
  birthDate?: string;
  species?: { coding: { code: string; display: string }[] };
}

export interface FHIRObservation {
  resourceType: 'Observation';
  id: string;
  status: 'registered' | 'preliminary' | 'final' | 'cancelled';
  category?: { coding: { code: string; display: string }[] }[];
  code?: { coding: { code: string; display: string }[] };
  subject?: { reference: string };
  effectiveDateTime?: string;
  valueQuantity?: { value: number; unit: string };
}

export interface FHIREncounter {
  resourceType: 'Encounter';
  id: string;
  status: 'planned' | 'arrived' | 'in-progress' | 'finished' | 'cancelled';
  class: { code: string; display: string };
  subject?: { reference: string };
  participant?: { individual: { display: string } }[];
  period?: { start?: string; end?: string };
  reasonCode?: { coding: { code: string; display: string }[] }[];
}

export interface FHIRImmunization {
  resourceType: 'Immunization';
  id: string;
  status: 'completed' | 'entered-in-error' | 'not-done';
  vaccineCode?: { coding: { code: string; display: string }[] };
  patient?: { reference: string };
  occurrenceDateTime?: string;
  expirationDate?: string;
  performer?: { actor: { display: string } }[];
}

export function convertToFHIRPatient(pet: {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  birth_date?: string;
}): FHIRPatient {
  return {
    resourceType: 'Patient',
    id: pet.id,
    identifier: [
      { system: 'https://petcare.pe.kr/pet', value: pet.id },
    ],
    name: [{ given: [pet.name], family: pet.breed || '' }],
    birthDate: pet.birth_date || undefined,
    species: {
      coding: [{
        code: pet.species,
        display: pet.species === 'dog' ? 'Dog' : 'Cat',
      }],
    },
  };
}

export function convertToFHIRImmunization(vaccination: {
  id: string;
  vaccine_name: string;
  administered_date: string;
  next_due_date?: string;
  clinic_name?: string;
  veterinarian?: string;
  pet_id: string;
}): FHIRImmunization {
  return {
    resourceType: 'Immunization',
    id: vaccination.id,
    status: 'completed',
    vaccineCode: {
      coding: [{
        code: vaccination.vaccine_name,
        display: vaccination.vaccine_name,
      }],
    },
    patient: { reference: `Patient/${vaccination.pet_id}` },
    occurrenceDateTime: vaccination.administered_date,
    expirationDate: vaccination.next_due_date,
    performer: [{
      actor: { display: vaccination.clinic_name || vaccination.veterinarian || 'Unknown' },
    }],
  };
}

export function convertToFHIREncounter(record: {
  id: string;
  pet_id: string;
  visit_date: string;
  visit_type: string;
  diagnosis?: string;
  treatment?: string;
  hospital_id?: string;
}): FHIREncounter {
  return {
    resourceType: 'Encounter',
    id: record.id,
    status: 'finished',
    class: { code: record.visit_type, display: record.visit_type },
    subject: { reference: `Patient/${record.pet_id}` },
    reasonCode: record.diagnosis ? [{
      coding: [{ code: record.diagnosis, display: record.diagnosis }],
    }] : undefined,
  };
}

export interface EMRExportOptions {
  format: 'fhir' | 'pdf' | 'json';
  dateRange?: { start: string; end: string };
  includeVaccinations: boolean;
  includePrescriptions: boolean;
}

export async function exportPetEMR(
  petId: string,
  options: EMRExportOptions
): Promise<{ data: string; contentType: string; filename: string }> {
  const exportData: Record<string, unknown> = {
    exportDate: new Date().toISOString(),
    petId,
    format: options.format,
  };

  switch (options.format) {
    case 'fhir':
      exportData.bundle = {
        resourceType: 'Bundle',
        type: 'collection',
        entry: [],
      };
      break;
    case 'json':
      exportData.pet = null;
      exportData.records = [];
      exportData.vaccinations = [];
      exportData.prescriptions = [];
      break;
    default:
      throw new Error(`Unsupported format: ${options.format}`);
  }

  return {
    data: JSON.stringify(exportData, null, 2),
    contentType: 'application/json',
    filename: `emr_${petId}_${new Date().toISOString().split('T')[0]}.json`,
  };
}
