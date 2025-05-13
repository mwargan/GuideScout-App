interface ParsedCV {
  current_city: string;
  document_language: string;
  email: string;
  name: string;
  phone_e164: string;
  surname: string;
  tour_guiding_years_experience: number;
  certifications?: string[];
  educations?: Education[];
  experiences?: Experience[];
  languages?: string[];
  personality_traits?: string[];
  qualifications?: string[];
  skills?: string[];
  is_cv: boolean;
}

interface Education {
  degree?: string;
  institution: string;
  start_year: number;
}

interface Experience {
  company_is_tour_operator: boolean;
  company_name: string;
  description: string;
  end_year: number;
  start_year: number;
  title: string;
}
